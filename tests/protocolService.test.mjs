import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'

const source = await readFile(new URL('../src/services/protocolService.js', import.meta.url), 'utf8')

async function setup({ error = null, unavailable = false } = {}) {
  const logs = []
  const inserts = []
  const context = vm.createContext({
    console: {
      info: (event, fields) => logs.push({ event, ...fields }),
      error: (event, fields) => logs.push({ event, ...fields }),
    },
  })
  const client = {
    from(table) {
      assert.equal(table, 'protocols')
      return {
        insert(payload) {
          inserts.push(payload)
          return { select: () => ({ single: async () => ({
            data: error ? null : { id: 'new-protocol', ...payload, sort_order: 0 },
            error,
          }) }) }
        },
      }
    },
  }
  const dependency = new vm.SyntheticModule(['requireSupabase'], function () {
    this.setExport('requireSupabase', () => {
      if (unavailable) throw new Error('Supabase environment variables are missing.')
      return client
    })
  }, { context })
  const module = new vm.SourceTextModule(source, { context })
  await module.link(() => dependency)
  await module.evaluate()
  return { create: module.namespace.createProtocol, logs, inserts }
}

test('creates a trimmed active protocol in its department and logs success', async () => {
  const { create, logs, inserts } = await setup()
  const saved = await create({ name: '  Closing  ', department_id: 'bar' })
  assert.equal(saved.name, 'Closing')
  assert.equal(inserts[0].department_id, 'bar')
  assert.equal(inserts[0].active, true)
  assert.deepEqual(logs.map(({ event }) => event), [
    'protocol_create_attempt', 'protocol_create_insert', 'protocol_create_succeeded',
  ])
})

test('invalid input never inserts and logs the concrete reason', async () => {
  for (const draft of [{ name: ' ' , department_id: 'bar' }, { name: 'Closing' }]) {
    const { create, logs, inserts } = await setup()
    await assert.rejects(create(draft), /Choose a department/)
    assert.equal(inserts.length, 0)
    assert.ok(logs.some((log) => log.reason === 'missing_department_or_name'))
    assert.equal(logs.at(-1).event, 'protocol_create_failed')
  }
})

for (const [code, message] of [
  ['23505', /already exists/],
  ['42501', /denied by the database permissions/],
  ['08006', /Connection failed/],
]) {
  test(`database error ${code} is diagnosed and surfaced`, async () => {
    const { create, logs } = await setup({
      error: { code, message: 'Connection failed', details: 'test details', hint: 'test hint' },
    })
    await assert.rejects(create({ name: 'Closing', department_id: 'bar' }), (error) => message.test(error.message))
    const failure = logs.at(-1)
    assert.equal(failure.event, 'protocol_create_failed')
    assert.equal(failure.code, code)
    assert.equal(failure.departmentId, 'bar')
    assert.equal(failure.details, 'test details')
    assert.equal(failure.hint, 'test hint')
    assert.ok(!logs.some((log) => log.event === 'protocol_create_succeeded'))
  })
}

test('missing client configuration is diagnosed before any insert', async () => {
  const { create, logs, inserts } = await setup({ unavailable: true })
  await assert.rejects(create({ name: 'Closing', department_id: 'bar' }), /environment variables/)
  assert.equal(inserts.length, 0)
  assert.match(logs.at(-1).reason, /environment variables/)
})

async function setupEntities({ error = null, hasProtocols = false } = {}) {
  const logs = []
  const calls = []
  const context = vm.createContext({ console: {
    info: (event, fields) => logs.push({ event, ...fields }),
    error: (event, fields) => logs.push({ event, ...fields }),
  } })
  const client = { from(table) {
    const query = {
      insert(payload) { calls.push({ table, operation: 'create', payload }); return query },
      update(payload) { calls.push({ table, operation: 'update', payload }); return query },
      delete() { calls.push({ table, operation: 'delete' }); return query },
      select() { return query },
      eq() { return query },
      limit: async () => ({ data: hasProtocols ? [{ id: 'child' }] : [], error: null }),
      single: async () => ({ data: error ? null : { id: 'saved', name: 'Closing' }, error }),
    }
    return query
  } }
  const dependency = new vm.SyntheticModule(['requireSupabase'], function () {
    this.setExport('requireSupabase', () => client)
  }, { context })
  const module = new vm.SourceTextModule(source, { context })
  await module.link(() => dependency)
  await module.evaluate()
  return { service: module.namespace, logs, calls }
}

test('department create and both entity updates persist trimmed names and diagnose success', async () => {
  for (const operation of ['createDepartment', 'updateDepartment', 'updateProtocol']) {
    const { service, logs, calls } = await setupEntities()
    if (operation === 'createDepartment') await service[operation]({ name: ' Closing ' })
    else await service[operation]('id', { name: ' Closing ' })
    assert.equal(calls[0].payload.name, 'Closing')
    assert.equal(logs.at(-1).event, 'entity_mutation_succeeded')
  }
})

test('both entity deletions verify a returned row and log success', async () => {
  for (const operation of ['deleteDepartment', 'deleteProtocol']) {
    const { service, logs, calls } = await setupEntities()
    await service[operation]('id')
    assert.equal(calls[0].operation, 'delete')
    assert.equal(logs.at(-1).event, 'entity_mutation_succeeded')
  }
})

test('department containing protocols cannot cascade-delete them', async () => {
  const { service, logs, calls } = await setupEntities({ hasProtocols: true })
  await assert.rejects(service.deleteDepartment('department'), /Delete the protocols/)
  assert.equal(calls.length, 0)
  assert.ok(logs.some((log) => log.event === 'entity_delete_dependency_result' && log.hasProtocols))
  assert.equal(logs.at(-1).event, 'entity_mutation_failed')
})

test('empty department name is rejected before database writes', async () => {
  const { service, logs, calls } = await setupEntities()
  await assert.rejects(service.createDepartment({ name: ' ' }), /Enter a name/)
  assert.equal(calls.length, 0)
  assert.ok(logs.some((log) => log.reason === 'missing_name'))
})

for (const [code, message] of [
  ['23505', /already exists/],
  ['23503', /categories or approval history/],
  ['42501', /permissions/],
  ['PGRST116', /no longer available/],
]) {
  test(`entity failure ${code} is actionable and logged`, async () => {
    const { service, logs } = await setupEntities({ error: { code, message: 'Database reason' } })
    await assert.rejects(service.deleteProtocol('protocol'), (error) => message.test(error.message))
    assert.equal(logs.at(-1).event, 'entity_mutation_failed')
    assert.equal(logs.at(-1).code, code)
    assert.equal(logs.at(-1).reason, 'Database reason')
  })
}

test('department reorder writes sequential positions and logs each result', async () => {
  const { service, logs, calls } = await setupEntities()
  await service.reorderDepartments(['second', 'first'])
  assert.deepEqual(calls.map((call) => call.payload.sort_order), [0, 1])
  assert.ok(calls.every((call) => call.table === 'departments'))
  assert.equal(logs.filter((log) => log.event === 'department_reorder_updated').length, 2)
  assert.equal(logs.at(-1).event, 'department_reorder_succeeded')
})

test('department reorder rejects duplicate IDs before writes', async () => {
  const { service, logs, calls } = await setupEntities()
  await assert.rejects(service.reorderDepartments(['same', 'same']), /unique department IDs/)
  assert.equal(calls.length, 0)
  assert.equal(logs.at(-1).event, 'department_reorder_failed')
})

test('department reorder stops and diagnoses a denied update', async () => {
  const { service, logs, calls } = await setupEntities({
    error: { code: '42501', message: 'Update denied by row security' },
  })
  await assert.rejects(service.reorderDepartments(['one', 'two']), /Update denied by row security/)
  assert.equal(calls.length, 1)
  assert.equal(logs.at(-1).event, 'department_reorder_failed')
  assert.equal(logs.at(-1).code, '42501')
})
