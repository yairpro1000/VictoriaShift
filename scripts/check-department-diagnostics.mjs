import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const output = await readFile(process.argv[2], 'utf8')
const logs = output.split('\n').filter(line => line.includes('LOG:')).map(line => JSON.parse(line.slice(line.indexOf('{'))))
for (const reason of ['invalid_input','department_missing_or_not_owner','invalid_permission_shape','foreign_protocol_or_edit_without_view','empty_or_duplicate_permissions','recipient_cannot_reshare']) {
  assert.ok(logs.some(log => log.event==='department_share_create_denied' && log.reason===reason),`Missing denial: ${reason}`)
}
assert.ok(logs.some(log => log.event==='share_access_result' && log.reason==='manager_access_required' && log.is_manager===false))
assert.ok(logs.some(log => log.event==='shared_protocol_permission_result' && log.permission==='edit' && log.allowed===false && log.reason==='protocol_permission_missing'))
assert.ok(logs.some(log => log.event==='shared_protocol_permission_result' && log.permission==='view' && log.allowed===true))
assert.ok(logs.some(log => log.event==='department_share_create_succeeded' && log.is_manager===true && log.replaced_links===1))
assert.ok(logs.some(log => log.event==='department_share_create_failed' && log.reason==='database_error' && log.sqlstate==='P0001'))
assert.ok(!JSON.stringify(logs).includes('@example.com'))
assert.ok(!JSON.stringify(logs).includes('department-password'))
assert.ok(!/[0-9a-f]{64}/.test(JSON.stringify(logs)))
console.log('Department-sharing diagnostic assertions passed.')
