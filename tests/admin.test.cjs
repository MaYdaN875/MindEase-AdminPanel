const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const root = path.join(__dirname, '..');

// Compile the real TS services in memory, injecting only HTTP and browser boundaries.
function load(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, URL, URLSearchParams, ...globals,
    require(name) { if (!(name in dependencies)) throw new Error('Unexpected dependency: ' + name); return dependencies[name]; },
  }, { filename: file });
  return module.exports;
}
const permissions = load('src/services/permissions.ts');
test('appointment supervision restricted to administrators', () => {
  for (const role of ['ADMIN', 'SUPERADMIN', 'SUPPORT', 'REVISOR', 'MODERATOR', 'USER', 'PSYCHOLOGIST_VERIFIED']) assert.equal(permissions.canAccess([role], 'appointments'), ['ADMIN', 'SUPERADMIN'].includes(role));
});
test('appointment client preserves independent filters and abort signal', async () => {
  const calls = [];
  const client = load('src/services/appointmentAdminService.ts', { './api': { __esModule: true, default: { async get(route, config) { calls.push({ route, config }); return { data: { data: { ok: true } } }; } } } });
  const controller = new AbortController();
  await client.listAdminAppointments({ status: 'CONFIRMED', consultationStatus: 'IN_PROGRESS', paymentStatus: 'NONE' }, 2, controller.signal);
  await client.getAdminAppointment('test-id', controller.signal);
  assert.equal(calls[0].route, '/admin/appointments');
  assert.equal(calls[0].config.params.page, 2);
  assert.equal(calls[0].config.params.consultationStatus, 'IN_PROGRESS');
  assert.equal(calls[0].config.params.paymentStatus, 'NONE');
  assert.equal(calls[0].config.signal, controller.signal);
  assert.equal(calls[1].route, '/admin/appointments/test-id');
});
test('finance navigation is restricted to administrators', () => {
  for (const role of ['ADMIN', 'SUPERADMIN', 'SUPPORT', 'REVISOR', 'MODERATOR', 'USER', 'PSYCHOLOGIST_VERIFIED']) {
    assert.equal(permissions.canAccess([role], 'finance'), ['ADMIN', 'SUPERADMIN'].includes(role));
  }
});
test('finance client preserves filters, pagination and cancellation; only reads', async () => {
  const calls = [];
  const client = load('src/services/financeService.ts', { './api': { __esModule: true, default: { async get(route, config) { calls.push({ route, config }); return { data: { data: { ok: true } } }; } } } });
  const controller = new AbortController();
  await client.getFinanceSummary('MXN', controller.signal);
  await client.getFinanceList('refunds', { currency: 'USD', status: 'REFUNDED', search: 'test' }, 2, controller.signal);
  await client.getFinancePayment('payment-id', controller.signal);
  assert.equal(calls[0].route, '/admin/finance/summary');
  assert.equal(calls[1].route, '/admin/finance/refunds');
  assert.equal(calls[1].config.params.page, 2);
  assert.equal(calls[1].config.params.status, 'REFUNDED');
  assert.equal(calls[1].config.params.currency, 'USD');
  assert.equal(calls[1].config.signal, controller.signal);
  assert.equal(calls[2].route, '/admin/finance/payments/payment-id');
});
function service(api, globals = {}) {
  return load('src/services/adminService.ts', { './api': { __esModule: true, default: api }, './permissions': permissions }, globals);
}

test('least-privilege navigation for every staff role', () => {
  const { canAccess, hasStaffRole } = permissions;
  for (const role of ['USER', 'PSYCHOLOGIST_VERIFIED', 'PSYCHOLOGIST_APPLICANT']) {
    assert.equal(hasStaffRole([role]), false);
    assert.equal(canAccess([role], 'users'), false);
  }
  assert.equal(canAccess(['REVISOR'], 'requests'), true);
  assert.equal(canAccess(['REVISOR'], 'users'), false);
  assert.equal(canAccess(['REVISOR'], 'audit'), false);
  assert.equal(canAccess(['SUPPORT'], 'support'), true);
  assert.equal(canAccess(['SUPPORT'], 'community'), false);
  assert.equal(canAccess(['MODERATOR'], 'community'), true);
  assert.equal(canAccess(['MODERATOR'], 'support'), false);
  assert.equal(canAccess(['MODERATOR'], 'broadcast'), false);
  for (const role of ['ADMIN', 'SUPERADMIN']) for (const view of ['requests', 'users', 'audit', 'support', 'community', 'catalogs']) assert.equal(canAccess([role], view), true);
});

test('report pagination preserves all pages and correct route', async () => {
  const calls = [];
  const api = { async get(route, options) {
    calls.push({ route, options });
    return { data: { data: calls.length === 1 ? { items: [{ id: 'a' }], hasMore: true, nextCursor: 'a' } : { items: [{ id: 'b' }], hasMore: false } } };
  } };
  const result = await service(api).getCommunityReports({ status: 'PENDING' });
  assert.equal(JSON.stringify(result), JSON.stringify([{ id: 'a' }, { id: 'b' }]));
  assert.equal(calls[0].route, '/community/reports');
  assert.equal(calls[1].options.params.cursor, 'a');
  assert.equal(calls[1].options.params.status, 'PENDING');
});

test('repeating cursor fails rather than looping forever', async () => {
  const api = { async get() { return { data: { data: { items: [], hasMore: true, nextCursor: 'same' } } }; } };
  await assert.rejects(service(api).getUserConductReports(), /Cursor repetido/);
});

test('moderation mutations match backend routes and payloads', async () => {
  const calls = [];
  const methods = service({ async put(route, body) { calls.push({ route, body }); } });
  await methods.resolveCommunityReport('r1', 'RESOLVED', 'Revisado');
  await methods.toggleCommunityPostVisibility('p1', 'HIDE', 'Normas');
  assert.equal(calls[0].route, '/community/reports/r1/review');
  assert.equal(calls[0].body.moderatorNotes, 'Revisado');
  assert.equal(calls[1].route, '/community/posts/p1/moderate');
  assert.equal(calls[1].body.action, 'HIDE');
});

test('patient login cannot persist a panel session', async () => {
  let saved = false;
  const api = { async post() { return { data: { data: { token: 'not-a-staff-token', user: { roles: ['USER'] } } } }; } };
  await assert.rejects(service(api, { localStorage: { setItem() { saved = true; } } }).loginAdmin('test@example.test', 'example'), /no tiene acceso/);
  assert.equal(saved, false);
});

test('authorized download is resolved against API origin without exposing login token', async () => {
  let preview; let payload;
  const api = { defaults: { baseURL: 'http://localhost:3000/api' }, async post(route, body) {
    assert.equal(route, '/media/access'); payload = body;
    return { data: { data: { url: '/uploads/support/file.png?access=short-lived' } } };
  } };
  const methods = service(api, { CustomEvent, window: { location: { origin: 'http://localhost:5173' }, dispatchEvent(event) { preview = event.detail; } } });
  await methods.openProtectedMedia('/uploads/support/file.png');
  assert.equal(payload.url, '/uploads/support/file.png');
  assert.equal(preview.url, 'http://localhost:3000/uploads/support/file.png?access=short-lived');
  assert.equal(preview.path, '/uploads/support/file.png');
});

test('external or malicious download origins are rejected', async () => {
  let requested = false;
  const api = { defaults: { baseURL: 'http://localhost:3000/api' }, async post() { requested = true; } };
  const methods = service(api, { window: { location: { origin: 'http://localhost:5173' } } });
  await assert.rejects(methods.openProtectedMedia('https://foreign.test/uploads/support/file.png'), /no permitida/);
  await assert.rejects(methods.openProtectedMedia('javascript:alert(1)'), /no permitida/);
  assert.equal(requested, false);
});

test('catalog actions resolve full IDs instead of filtered table indexes', () => {
  const source = fs.readFileSync(path.join(root, 'src/views/CatalogsView.tsx'), 'utf8');
  assert.ok(source.includes('id: sp.id,'));
  assert.ok(source.includes('specialtiesDb.find(record => record.id === item.id)'));
  assert.ok(source.includes('handleDeleteSpecialty(item.id)'));
  assert.ok(!source.includes('specialtiesDb[dbIndex]'));
});
