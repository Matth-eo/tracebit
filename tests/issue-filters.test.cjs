/* eslint-disable @typescript-eslint/no-require-imports -- Isolated CommonJS harness for TypeScript query and page tests. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(path, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const context = { exports: {}, require: name => {
    assert.ok(name in mocks, `Unexpected dependency ${name}`);
    return mocks[name];
  } };
  vm.runInNewContext(source, context);
  return context.exports;
}
const labels = load('src/lib/issues.ts');
const helpers = load('src/lib/issue-filters.ts', { '@/lib/issues': labels });
const plain = value => JSON.parse(JSON.stringify(value));

test('unfiltered queries always scope issues to the authenticated owner', () => {
  const result = helpers.buildIssueFilters({}, 'owner-a');
  assert.deepEqual(plain(result.where), { project: { ownerId: 'owner-a' } });
  assert.equal(result.active, false);
});
test('title, status, priority, and type combine without changing ownership', () => {
  const result = helpers.buildIssueFilters({ q: '  checkout  ', status: 'TODO', priority: 'HIGH', type: 'BUG', ownerId: 'foreign', project: 'foreign' }, 'owner-a');
  assert.deepEqual(plain(result.where), {
    project: { ownerId: 'owner-a' }, title: { contains: 'checkout', mode: 'insensitive' }, status: 'TODO', priority: 'HIGH', type: 'BUG',
  });
  assert.equal(result.q, 'checkout');
  assert.equal(result.active, true);
});
test('all supported enum filters are accepted individually', () => {
  for (const [field, choices] of Object.entries({ status: labels.statusLabels, priority: labels.priorityLabels, type: labels.typeLabels })) {
    for (const value of Object.keys(choices)) {
      assert.equal(helpers.buildIssueFilters({ [field]: value }, 'owner-a').where[field], value);
    }
  }
});
test('invalid, duplicate, and inherited enum values are ignored safely', () => {
  for (const value of ['invalid', 'toString', '__proto__', ['TODO', 'DONE'], undefined]) {
    const result = helpers.buildIssueFilters({ q: ['one', 'two'], status: value, priority: value, type: value }, 'owner-a');
    assert.deepEqual(plain(result.where), { project: { ownerId: 'owner-a' } });
    assert.equal(result.active, false);
  }
});
test('search handles whitespace, length limits, and literal wildcard characters', () => {
  assert.equal(helpers.buildIssueFilters({ q: '   ' }, 'a').active, false);
  assert.equal(helpers.buildIssueFilters({ q: 'x'.repeat(200) }, 'a').q.length, 160);
  const q = '100%_\\done';
  const result = helpers.buildIssueFilters({ q }, 'a');
  assert.equal(result.q, q);
  assert.equal(result.where.title.contains, '100\\%\\_\\\\done');
});

function pageMocks(prisma, user = { id: 'owner-a', name: 'Test User' }) {
  return {
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: () => null },
    '@/lib/prisma': { prisma },
    '@/lib/workspace': { requireUser: async () => { if (!user) throw new Error('LOGIN_REQUIRED'); return user; } },
    '@/lib/issues': labels,
    '@/lib/issue-filters': helpers,
    '@/components/workspace-ui': { EmptyState: 'empty-state', IssueTable: 'issue-table', PageHeading: 'page-heading', ProjectCards: 'project-cards' },
  };
}
test('Issues page sends the combined owner-scoped filters to Prisma', async () => {
  let query;
  const page = load('src/app/dashboard/issues/page.tsx', pageMocks({ issue: { findMany: async args => { query = args; return []; } } })).default;
  await page({ searchParams: Promise.resolve({ q: 'checkout', status: 'DONE', priority: 'LOW', type: 'TASK' }) });
  assert.equal(query.where.project.ownerId, 'owner-a');
  assert.equal(query.where.title.contains, 'checkout');
  assert.equal(query.where.status, 'DONE');
  assert.equal(query.where.priority, 'LOW');
  assert.equal(query.where.type, 'TASK');
});
test('dashboard obtains all counts and recent lists from owner-scoped database queries', async () => {
  const calls = [];
  const record = (name, value) => async query => { calls.push([name, query]); return value; };
  const prisma = {
    project: { count: record('project-count', 7), findMany: record('projects', []) },
    issue: { count: record('issue-count', 4), findMany: record('issues', []) },
  };
  const page = load('src/app/dashboard/page.tsx', pageMocks(prisma)).default;
  const result = await page();
  assert.equal(calls.length, 6);
  for (const [name, query] of calls) {
    assert.equal(name.startsWith('project') ? query.where.ownerId : query.where.project.ownerId, 'owner-a');
  }
  const counts = calls.filter(([name]) => name === 'issue-count').map(([, query]) => plain(query.where.status));
  assert.deepEqual(counts, [{ not: 'DONE' }, 'IN_PROGRESS', 'DONE']);
  assert.equal(calls.find(([name]) => name === 'projects')[1].take, 3);
  assert.equal(calls.find(([name]) => name === 'issues')[1].take, 6);
  const cards = result.props.children[1].props.children;
  assert.equal(cards[0].props.children[1].props.children, 7);
  assert.equal(cards[1].props.children[1].props.children, 4);
});
test('unauthenticated pages stop before querying issue or dashboard data', async () => {
  for (const path of ['src/app/dashboard/issues/page.tsx', 'src/app/dashboard/page.tsx']) {
    const page = load(path, pageMocks({}, null)).default;
    await assert.rejects(page({ searchParams: Promise.resolve({}) }), /LOGIN_REQUIRED/);
  }
});
