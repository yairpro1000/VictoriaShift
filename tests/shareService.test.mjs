import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFile } from 'node:fs/promises'
import * as shareSession from '../src/services/shareSession.js'
const source = await readFile(new URL('../src/services/shareService.js', import.meta.url), 'utf8')
const token = 'e'.repeat(64)
async function setup({ rpcResult, configured = true } = {}) {
  const logs = [], calls = []
  const client = {
    rpc: async (...args) => { calls.push(['rpc', ...args]); return rpcResult ?? { data: { ok: true, data: { token, protocol_id: 'protocol' }, error: null } } },

  }
  const context = vm.createContext({ URL, TextEncoder, console: { info: (...args) => logs.push(args), error: (...args) => logs.push(args) } })
  const dependency = new vm.SyntheticModule(['supabase','requireSupabase'], function () {
    this.setExport('supabase', configured ? client : null)
    this.setExport('requireSupabase', () => { if (!configured) throw new Error('Supabase environment variables are missing.'); return client })
  }, { context })
  const module = new vm.SourceTextModule(source,{context})
  const session = new vm.SyntheticModule(['getShareSession','setShareSession','clearShareSession'], function () {
    for (const name of ['getShareSession','setShareSession','clearShareSession']) this.setExport(name,shareSession[name])
  }, { context })
  await module.link((specifier) => specifier.endsWith('shareSession') ? session : dependency); await module.evaluate()
  return { api: module.namespace, logs, calls }
}
test('create returns a copyable link, normalizes email, and sends no invitation email', async () => {
  const { api, calls, logs } = await setup()
  assert.equal(await api.createProtocolShare('protocol',' PERSON@example.com ','a-share-password','https://app.example'), 'https://app.example/share/' + token)
  assert.equal(calls.length,1)
  assert.equal(calls[0][0],'rpc')
  assert.equal(calls[0][2].email,'person@example.com')
  assert.ok(!JSON.stringify(logs).includes(token))
  assert.ok(!JSON.stringify(logs).includes('person@example.com'))
})
test('invalid recipient is denied before backend call with a concrete diagnostic', async () => {
  const { api,calls,logs } = await setup()
  await assert.rejects(api.createProtocolShare('protocol','invalid','a-share-password','https://app.example'),/valid recipient/)
  assert.equal(calls.length,0)
  assert.equal(logs.at(-1)[1].reason,'invalid_protocol_or_email')
})
for (const code of ['invalid_share_credentials','share_password_required','share_session_expired','invalid_or_revoked_link','not_protocol_manager']) {
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
test('missing configuration fails closed and records evaluated config', async () => {
  const { api,logs } = await setup({configured:false})
  await assert.rejects(api.resolveProtocolShare(),/environment variables/)
  assert.equal(logs[0][1].configured,false)
  assert.equal(logs.at(-1)[0],'share_rpc_failed')
})

test('password unlock saves only the opaque session and logs no credentials', async () => {
  const sessionToken = 'f'.repeat(64)
  const { api, calls, logs } = await setup({ rpcResult: { data: { ok: true, data: { session_token: sessionToken, protocol_id: 'protocol', department_id: 'department' } } } })
  const access = await api.unlockProtocolShare(token, ' PERSON@example.com ', 'a-share-password')
  assert.equal(calls[0][1], 'unlock_protocol_share')
  assert.equal(calls[0][2].email, 'person@example.com')
  assert.equal(calls[0][2].password, 'a-share-password')
  assert.equal(shareSession.getShareSession(token), sessionToken)
  assert.equal(access.session_token, undefined)
  for (const secret of [token, sessionToken, 'person@example.com', 'a-share-password']) assert.ok(!JSON.stringify(logs).includes(secret))
})
test('password failure clears an earlier session and preserves the concrete server reason', async () => {
  shareSession.setShareSession(token, 'f'.repeat(64))
  const { api,logs } = await setup({ rpcResult: { data: { ok:false, error: { code:'invalid_share_credentials',message:'The email or password is incorrect.' } } } })
  await assert.rejects(api.unlockProtocolShare(token,'person@example.com','wrong-password'), error => error.code==='invalid_share_credentials')
  assert.equal(shareSession.getShareSession(token), null)
  assert.equal(logs.at(-1)[1].code, 'invalid_share_credentials')
})
test('password creation validates byte length and never truncates Unicode passwords', async () => {
  for (const password of ['short', 'é'.repeat(37)]) {
    const { api,calls,logs } = await setup()
    await assert.rejects(api.createProtocolShare('protocol','person@example.com',password,'https://app.example'), /8 characters/)
    assert.equal(calls.length,0)
    assert.equal(logs.at(-1)[1].reason,'invalid_password_length')
  }
})
test('malformed server session is rejected without storing it', async () => {
  const { api,logs } = await setup({rpcResult:{data:{ok:true,data:{session_token:'bad'}}}})
  await assert.rejects(api.unlockProtocolShare(token,'person@example.com','a-share-password'), /invalid shared session/)
  assert.equal(shareSession.getShareSession(token),null)
  assert.equal(logs.at(-1)[1].reason,'invalid_server_session')
})
