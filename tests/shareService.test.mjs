import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFile } from 'node:fs/promises'
const source = await readFile(new URL('../src/services/shareService.js', import.meta.url), 'utf8')
const token = 'e'.repeat(64)
async function setup({ rpcResult, authError, configured = true } = {}) {
  const logs = [], calls = []
  const client = {
    rpc: async (...args) => { calls.push(['rpc', ...args]); return rpcResult ?? { data: { ok: true, data: { token, protocol_id: 'protocol' }, error: null } } },
    auth: {
      signInWithOtp: async (args) => { calls.push(['send',args]); return { error: authError } },
      verifyOtp: async (args) => { calls.push(['verify',args]); return { error: authError } },
    },
  }
  const context = vm.createContext({ URL, console: { info: (...args) => logs.push(args), error: (...args) => logs.push(args) } })
  const dependency = new vm.SyntheticModule(['supabase','requireSupabase'], function () {
    this.setExport('supabase', configured ? client : null)
    this.setExport('requireSupabase', () => { if (!configured) throw new Error('Supabase environment variables are missing.'); return client })
  }, { context })
  const module = new vm.SourceTextModule(source,{context})
  await module.link(() => dependency); await module.evaluate()
  return { api: module.namespace, logs, calls }
}
test('create returns a copyable link, normalizes email, and sends no invitation email', async () => {
  const { api, calls, logs } = await setup()
  assert.equal(await api.createProtocolShare('protocol',' PERSON@example.com ','https://app.example'), 'https://app.example/share/' + token)
  assert.equal(calls.length,1)
  assert.equal(calls[0][0],'rpc')
  assert.equal(calls[0][2].email,'person@example.com')
  assert.ok(!JSON.stringify(logs).includes(token))
  assert.ok(!JSON.stringify(logs).includes('person@example.com'))
})
test('invalid recipient is denied before backend call with a concrete diagnostic', async () => {
  const { api,calls,logs } = await setup()
  await assert.rejects(api.createProtocolShare('protocol','invalid','https://app.example'),/valid recipient/)
  assert.equal(calls.length,0)
  assert.equal(logs.at(-1)[1].reason,'invalid_protocol_or_email')
})
for (const code of ['recipient_email_mismatch','sign_in_required','verified_email_required','invalid_or_revoked_link','not_protocol_manager']) {
  test(`RPC denial ${code} retains diagnostics and error code`, async () => {
    const { api,logs } = await setup({ rpcResult: { error: { code,message:'Access denied for test reason' } } })
    await assert.rejects(api.resolveProtocolShare(), (error) => error.code === code)
    assert.equal(logs.at(-1)[0],'share_rpc_failed')
    assert.equal(logs.at(-1)[1].code,code)
  })
}
test('application-level error envelope is also rejected', async () => {
  const { api } = await setup({ rpcResult: { data: { ok:false,data:null,error:{code:'denied',message:'Denied'} } } })
  await assert.rejects(api.resolveProtocolShare(), (error) => error.code==='denied')
})
test('requesting verification creates no session and sends to the entered email through Supabase Auth', async () => {
  const { api,calls,logs } = await setup()
  await api.requestShareSignIn(' PERSON@example.com ','https://app.example/share/' + token)
  assert.equal(calls[0][1].email,'person@example.com')
  assert.equal(calls[0][1].options.emailRedirectTo,'https://app.example/share/' + token)
  assert.equal(logs.at(-1)[1].branch,'await_email_verification')
  assert.ok(!JSON.stringify(logs).includes(token))
})
test('OTP verification uses provider email verification, never a local boolean', async () => {
  const { api,calls,logs } = await setup()
  await api.verifyShareCode('person@example.com','123456')
  assert.equal(calls[0][0],'verify')
  assert.equal(calls[0][1].type,'email')
  assert.equal(calls[0][1].token,'123456')
  assert.ok(!JSON.stringify(logs).includes('123456'))
})
for (const [method,event] of [['requestShareSignIn','share_email_signin_failed'],['verifyShareCode','share_email_verify_failed']]) {
  test(`${method} reports provider configuration and verification failures`, async () => {
    const { api,logs } = await setup({ authError:{code:'otp_expired',message:'Expired or invalid verification',status:403} })
    await assert.rejects(api[method]('person@example.com','123456'))
    assert.equal(logs.at(-1)[0],event)
    assert.equal(logs.at(-1)[1].code,'otp_expired')
  })
}
test('missing configuration fails closed and records evaluated config', async () => {
  const { api,logs } = await setup({configured:false})
  await assert.rejects(api.resolveProtocolShare(),/environment variables/)
  assert.equal(logs[0][1].configured,false)
  assert.equal(logs.at(-1)[0],'share_rpc_failed')
})
