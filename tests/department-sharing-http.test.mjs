import test from 'node:test'
import assert from 'node:assert/strict'
const base = process.env.DEPARTMENT_TEST_API_URL
// Requires tests/fixtures/department-browser.sql in a disposable local database.
test('department HTTP manager gate preserves envelopes and CORS', { skip: !base }, async () => {
  assert.equal(new URL(base).hostname, '127.0.0.1')
  const origin = 'http://127.0.0.1:4175'
  const email = 'department-http@example.com', password = 'department-http-password'
  const permissions = [{protocol_id:'30000000-0000-4000-8000-000000000011',can_view:true,can_edit:false}]
  async function rpc(name, body, headers = {}, status = 200, code) {
    const response = await fetch(`${base}/rpc/${name}`, {method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...headers},body:JSON.stringify(body)})
    const result = await response.json()
    assert.equal(response.status,status,JSON.stringify(result))
    assert.ok(['*',origin].includes(response.headers.get('access-control-allow-origin')))
    assert.equal(result.ok,status===200)
    if(code) { assert.equal(result.error.code,code); assert.equal(result.data,null) }
    return result.data
  }
  const input = {department:'20000000-0000-4000-8000-000000000003',email,password,permissions,is_manager:false}
  await rpc('create_department_share',{...input,permissions:[]},{},422,'invalid_permissions')
  const {token} = await rpc('create_department_share',input)
  const headers = {'x-protocol-share':token}
  const {session_token} = await rpc('unlock_protocol_share',{email,password},headers)
  headers['x-protocol-session']=session_token
  const access = await rpc('get_protocol_share',{},headers)
  assert.equal(access.is_manager,false)
  assert.deepEqual(access.protocols,permissions)
  await rpc('get_protocol_share',{}, {...headers,'x-protocol-manager':'true'},403,'manager_access_required')
  const preflight = await fetch(`${base}/rpc/get_protocol_share`,{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type,x-protocol-share,x-protocol-session,x-protocol-manager'}})
  assert.ok(preflight.ok)
  assert.match(preflight.headers.get('access-control-allow-headers'),/x-protocol-manager/i)
  const replacement = await rpc('create_department_share',{...input,is_manager:true})
  await rpc('get_protocol_share',{},headers,403,'invalid_or_revoked_link')
  const nextHeaders = {'x-protocol-share':replacement.token,'x-protocol-manager':'true'}
  const next = await rpc('unlock_protocol_share',{email,password},nextHeaders)
  nextHeaders['x-protocol-session']=next.session_token
  const manager = await rpc('get_protocol_share',{},nextHeaders)
  assert.equal(manager.is_manager,true)
  assert.equal(manager.protocols[0].can_edit,false)
})
