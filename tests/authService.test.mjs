import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { readFile } from 'node:fs/promises'
const source = await readFile(new URL('../src/services/authService.js', import.meta.url), 'utf8')
for (const scenario of ['success','unknown_username','wrong_password','missing_configuration']) {
  test(`login ${scenario} reports its diagnostic outcome without logging passwords`, async () => {
    const logs = []
    let calls = 0
    const context = vm.createContext({ console: {
      info: (...args) => logs.push(args), error: (...args) => logs.push(args),
    } })
    const client = scenario === 'missing_configuration' ? null : { auth: {
      signInWithPassword: async (credentials) => {
        calls++
        assert.equal(credentials.email, 'yair@users.victoriashift.invalid')
        return scenario === 'wrong_password'
          ? { error: { code: 'invalid_credentials', message: 'Invalid login credentials', status: 400 } }
          : { data: { user: { id: 'owner' } } }
      },
    } }
    const dependency = new vm.SyntheticModule(['supabase'], function () { this.setExport('supabase', client) }, { context })
    const module = new vm.SourceTextModule(source, { context })
    await module.link(() => dependency)
    await module.evaluate()
    const promise = module.namespace.login(scenario === 'unknown_username' ? 'unknown' : 'yair', 'secret-test-password')
    if (scenario === 'success') {
      await promise
      assert.equal(logs.at(-1)[0], 'login_succeeded')
    } else {
      await assert.rejects(promise)
      assert.equal(logs.at(-1)[0], 'login_failed')
      assert.ok(logs.at(-1)[1].reason)
    }
    if (scenario === 'unknown_username' || scenario === 'missing_configuration') assert.equal(calls, 0)
    assert.ok(!JSON.stringify(logs).includes('secret-test-password'))
  })
}
