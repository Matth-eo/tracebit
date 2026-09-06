/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness evaluates actual server actions in an isolated VM. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const enums = require('@prisma/client');

function actions({ user = { id: 'owner-a' }, ownsProject = true, ownsIssue = true, count = 1, failWrite = false } = {}) {
  const calls = [];
  function write(kind, authorized = true) {
    return async query => {
      calls.push([kind, query]);
      if (failWrite) throw new Error('Database unavailable');
      return { count: authorized ? count : 0, id: 'project-a' };
    };
  }
  const prisma = {
    project: {
      findFirst: async query => { calls.push(['project', query]); return ownsProject ? { id: 'project-a' } : null; },
      create: write('project-create'),
      updateMany: write('project-update', ownsProject),
      deleteMany: write('project-delete', ownsProject),
    },
    issue: {
      create: write('create'),
      findFirst: async query => { calls.push(['issue', query]); return ownsIssue ? { projectId: 'project-a' } : null; },
      updateMany: write('update', ownsIssue),
      deleteMany: write('delete', ownsIssue),
    },
  };
  const mocks = {
    'next/cache': { revalidatePath: path => calls.push(['refresh', path]) },
    'next/navigation': { redirect: path => { throw new Error(`REDIRECT:${path}`); } },
    '@prisma/client': enums,
    '@/lib/auth': { getCurrentUser: async () => user },
    '@/lib/prisma': { prisma },
  };
  function load(path) {
    const source = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const context = { exports: {}, require: name => { assert.ok(name in mocks, `Unexpected dependency ${name}`); return mocks[name]; } };
    vm.runInNewContext(source, context);
    return context.exports;
  }
  mocks['@/lib/validation'] = load('src/lib/validation.ts');
  return { ...load('src/app/dashboard/issues/actions.ts'), ...load('src/app/dashboard/actions.ts'), calls };
}
function form(overrides = {}) {
  const result = new FormData();
  for (const [key, value] of Object.entries({ name: 'My project', title: 'Fix checkout', description: 'Checkout fails.', type: 'BUG', status: 'TODO', priority: 'HIGH', ...overrides })) result.set(key, value);
  return result;
}

test('all mutations reject unauthenticated users before database access', async () => {
  const api = actions({ user: null });
  assert.ok((await api.createProject({}, form())).error);
  for (const name of ['createIssue', 'updateIssue', 'deleteIssue', 'updateIssueStatus', 'updateProject', 'deleteProject']) {
    assert.ok((await api[name]('id', {}, form())).error, name);
  }
  assert.equal(api.calls.length, 0);
});
test('foreign project IDs cannot receive issues', async () => {
  const api = actions({ ownsProject: false });
  assert.equal((await api.createIssue('foreign', {}, form())).error, 'Project not found.');
  assert.equal(api.calls[0][1].where.ownerId, 'owner-a');
  assert.equal(api.calls[0][1].where.id, 'foreign');
  assert.equal(api.calls.some(([kind]) => kind === 'create'), false);
});
test('foreign issue IDs cannot be edited, deleted, or have status updated', async () => {
  for (const name of ['updateIssue', 'deleteIssue', 'updateIssueStatus']) {
    const api = actions({ ownsIssue: false });
    assert.equal((await api[name]('foreign', {}, form())).error, 'Issue not found.');
    assert.equal(api.calls[0][1].where.project.ownerId, 'owner-a');
    assert.equal(api.calls.some(([kind]) => ['update', 'delete'].includes(kind)), false);
  }
});
test('project edits and deletions scope writes to the owner and reject foreign IDs', async () => {
  for (const name of ['updateProject', 'deleteProject']) {
    const api = actions({ ownsProject: false });
    assert.equal((await api[name]('foreign', {}, form())).error, 'Project not found.');
    assert.equal(api.calls[0][1].where.ownerId, 'owner-a');
    assert.equal(api.calls[0][1].where.id, 'foreign');
    assert.equal(api.calls.some(([kind]) => kind === 'refresh'), false);
  }
});
test('invalid issue text and enums are rejected for creation and editing', async () => {
  for (const name of ['createIssue', 'updateIssue']) {
    for (const invalid of [{ type: 'ADMIN' }, { status: 'CLOSED' }, { priority: 'URGENT' }, { title: ' ' }, { title: 'x'.repeat(161) }, { description: 'x'.repeat(5001) }]) {
      const api = actions();
      assert.ok((await api[name]('id', {}, form(invalid))).error);
      assert.equal(api.calls.some(([kind]) => ['create', 'update'].includes(kind)), false);
    }
  }
});
test('omitted and blank descriptions are accepted for issue creation and editing', async () => {
  for (const name of ['createIssue', 'updateIssue']) {
    for (const description of ['', '   ', null]) {
      const api = actions();
      const data = form({ description });
      if (description === null) data.delete('description');
      assert.ok((await api[name]('id', {}, data)).success);
      const query = api.calls.find(([kind]) => ['create', 'update'].includes(kind))[1];
      assert.equal(query.data.description, '');
    }
  }
});
test('issue editing saves all supported fields and ignores forged ownership fields', async () => {
  const api = actions();
  assert.ok((await api.updateIssue('issue-a', {}, form({ title: '  New title  ', description: '', type: 'FEATURE', status: 'DONE', priority: 'LOW', projectId: 'foreign', ownerId: 'foreign' }))).success);
  const query = api.calls.find(([kind]) => kind === 'update')[1];
  assert.equal(query.where.project.ownerId, 'owner-a');
  assert.equal(query.where.id, 'issue-a');
  assert.deepEqual(JSON.parse(JSON.stringify(query.data)), { title: 'New title', description: '', type: 'FEATURE', status: 'DONE', priority: 'LOW' });
  assert.ok(api.calls.some(([kind, path]) => kind === 'refresh' && path === '/dashboard'));
});
test('issue deletion scopes the final write to the owner and refreshes data', async () => {
  const api = actions();
  assert.ok((await api.deleteIssue('issue-a', {}, form())).success);
  const query = api.calls.find(([kind]) => kind === 'delete')[1];
  assert.equal(query.where.id, 'issue-a');
  assert.equal(query.where.project.ownerId, 'owner-a');
  assert.ok(api.calls.some(([kind, path]) => kind === 'refresh' && path === '/dashboard/projects/project-a'));
});
test('project deletion redirects only after a successful owner-scoped deletion', async () => {
  const api = actions();
  await assert.rejects(api.deleteProject('project-a', {}, form()), /REDIRECT:\/dashboard\/projects/);
  assert.equal(api.calls[0][1].where.ownerId, 'owner-a');
  assert.equal(api.calls[0][1].where.id, 'project-a');
});
test('project editing validates input and saves only supported fields', async () => {
  const api = actions();
  assert.ok((await api.updateProject('project-a', {}, form({ name: ' ' }))).error);
  assert.ok((await api.updateProject('project-a', {}, form({ description: 'x'.repeat(501) }))).error);
  assert.equal(api.calls.length, 0);
  assert.ok((await api.updateProject('project-a', {}, form({ name: '  Renamed  ', description: '', ownerId: 'foreign' }))).success);
  assert.deepEqual(JSON.parse(JSON.stringify(api.calls[0][1].data)), { name: 'Renamed', description: null });
});
test('database failures and records removed before writes do not report success', async () => {
  for (const name of ['updateIssue', 'deleteIssue', 'updateIssueStatus', 'updateProject', 'deleteProject']) {
    for (const options of [{ count: 0 }, { failWrite: true }]) {
      const api = actions(options);
      assert.ok((await api[name]('id', {}, form())).error, name);
      assert.equal(api.calls.some(([kind]) => kind === 'refresh'), false);
    }
  }
});
test('status updates validate input and scope the final write', async () => {
  const api = actions();
  assert.ok((await api.updateIssueStatus('issue-a', {}, form({ status: 'INVALID' }))).error);
  assert.equal(api.calls.length, 0);
  assert.ok((await api.updateIssueStatus('issue-a', {}, form({ status: 'DONE' }))).success);
  const query = api.calls.find(([kind]) => kind === 'update')[1];
  assert.equal(query.where.project.ownerId, 'owner-a');
  assert.equal(query.data.status, 'DONE');
});
