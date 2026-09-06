/* eslint-disable @typescript-eslint/no-require-imports -- Isolated server action test harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const prismaModule = require('@prisma/client');
function setup({ user = { id: 'current-user' }, failure } = {}) {
  const calls = [];
  const mocks = {
    '@prisma/client': prismaModule,
    '@/lib/auth': { getCurrentUser: async () => user },
    '@/lib/prisma': { prisma: { user: { update: async query => { calls.push(query); if (failure) throw failure; return {}; } } } },
    'next/cache': { revalidatePath: path => calls.push(path) },
  };
  function load(path) {
    const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const context = { exports: {}, require: name => { assert.ok(name in mocks); return mocks[name]; } };
    vm.runInNewContext(code, context);
    return context.exports;
  }
  mocks['@/lib/validation'] = load('src/lib/validation.ts');
  return { ...load('src/app/dashboard/profile/actions.ts'), calls };
}
function form(values = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: '  Updated Name  ', email: 'NEW@example.com', ...values })) data.set(key, value);
  return data;
}
test('profile changes require authentication', async () => {
  const api = setup({ user: null });
  assert.ok((await api.updateProfile({}, form())).error);
  assert.equal(api.calls.length, 0);
});
test('profile updates use the session user and only allow name and email', async () => {
  const api = setup();
  assert.ok((await api.updateProfile({}, form({ id: 'foreign-user', passwordHash: 'forged' }))).success);
  assert.deepEqual(JSON.parse(JSON.stringify(api.calls[0])), { where: { id: 'current-user' }, data: { name: 'Updated Name', email: 'new@example.com' } });
  assert.equal(api.calls[1], '/dashboard');
});
test('invalid profile fields cannot reach the database', async () => {
  for (const fields of [{ name: ' ' }, { name: 'x'.repeat(81) }, { email: 'invalid' }]) {
    const api = setup();
    assert.ok((await api.updateProfile({}, form(fields))).error);
    assert.equal(api.calls.length, 0);
  }
});
test('duplicate emails return a useful error without refreshing', async () => {
  const api = setup({ failure: new prismaModule.Prisma.PrismaClientKnownRequestError('Unique constraint', { code: 'P2002', clientVersion: '6.16.3' }) });
  assert.equal((await api.updateProfile({}, form())).error, 'That email address is already in use.');
  assert.equal(api.calls.length, 1);
});
test('database errors do not report a successful profile update', async () => {
  const api = setup({ failure: new Error('Unavailable') });
  assert.ok((await api.updateProfile({}, form())).error);
  assert.equal(api.calls.length, 1);
});
