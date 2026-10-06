import test from 'node:test'
import assert from 'node:assert/strict'
const base = process.env.SHARE_TEST_API_URL
// Opt-in against the disposable local PostgREST fixture only.
test('password sharing HTTP envelopes, CORS, replacement and persisted rate limiting', { skip: !base }, async () => {
  assert.equal(new URL(base).hostname,'127.0.0.1')
  const origin = 'http://127.0.0.1:4175'
  const protocol = '30000000-0000-4000-8000-000000000003'
  const email = 'http-test@example.com', password = 'http-test-password'
  async function rpc(name, body, token, session, status=200, code) {
    const headers = {'Content-Type':'application/json', Origin:origin}
    if (token) headers['x-protocol-share']=token
    if (session) headers['x-protocol-session']=session
    const response = await fetch(`${base}/rpc/${name}`, {method:'POST',headers,body:JSON.stringify(body)})
    const data = await response.json()
    assert.equal(response.status,status,JSON.stringify(data))
    assert.ok(['*',origin].includes(response.headers.get('access-control-allow-origin')))
    assert.equal(data.ok,status===200)
    if (code) { assert.equal(data.error.code,code); assert.equal(data.data,null) }
    return data.data
  }
  await rpc('create_protocol_share',{protocol,email,password:'short'},null,null,422,'invalid_input')
  await rpc('unlock_protocol_share',{email,password},null,null,404,'invalid_link')
  const {token} = await rpc('create_protocol_share',{protocol,email,password})
  const preflight = await fetch(`${base}/rpc/unlock_protocol_share`,{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type,x-protocol-share,x-protocol-session'}})
  assert.ok(preflight.ok)
  assert.match(preflight.headers.get('access-control-allow-headers'),/x-protocol-session/i)
  await rpc('get_protocol_share',{},token,null,403,'share_password_required')
  await rpc('unlock_protocol_share',{email,password:'wrong'},token,null,403,'invalid_share_credentials')
  const {session_token} = await rpc('unlock_protocol_share',{email,password},token)
  assert.equal((await rpc('get_protocol_share',{},token,session_token)).protocol_id,protocol)
  const replacement = await rpc('create_protocol_share',{protocol,email,password:'new-http-test-password'})
  await rpc('get_protocol_share',{},token,session_token,403,'invalid_or_revoked_link')
  await rpc('get_protocol_share',{},replacement.token,session_token,403,'share_session_expired')
  for(let n=0;n<5;n++) await rpc('unlock_protocol_share',{email,password:'wrong'},replacement.token,null,403,'invalid_share_credentials')
  await rpc('unlock_protocol_share',{email,password:'new-http-test-password'},replacement.token,null,429,'share_rate_limited')
})
