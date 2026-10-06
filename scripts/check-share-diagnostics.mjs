import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const output = await readFile(process.argv[2], 'utf8')
const logs = output.split('\n').filter(line => line.includes('LOG:')).map(line => JSON.parse(line.slice(line.indexOf('{'))))
for (const [event, reason] of [
  ['share_unlock_denied','recipient_email_mismatch'], ['share_unlock_denied','password_mismatch'],
  ['share_unlock_denied','share_rate_limited'], ['share_unlock_denied','invalid_or_revoked_link'],
  ['share_access_result','share_password_required'], ['share_access_result','share_session_expired'],
  ['share_create_denied','invalid_protocol_email_or_password'], ['share_create_denied','recipient_cannot_reshare'],
  ['share_create_failed','database_error'], ['share_unlock_failed','database_error'],
]) assert.ok(logs.some(log => log.event===event && log.reason===reason), `${event}: ${reason} missing`)
assert.ok(logs.some(log => log.event==='share_unlock_attempt' && log.max_attempts===5 && log.session_hours===24))
assert.ok(logs.some(log => log.event==='share_create_succeeded' && log.replaced_links===1 && log.password_hash_algorithm==='bcrypt'))
assert.ok(logs.some(log => log.event==='share_unlock_succeeded' && log.branch==='session_issued'))
assert.ok(logs.some(log => log.event==='share_access_result' && log.branch==='password_session_allowed'))
assert.ok(!JSON.stringify(logs).includes('@example.com'))
assert.ok(!JSON.stringify(logs).includes('test-share-password'))
assert.ok(!JSON.stringify(logs).includes('replacement-password'))
assert.ok(!/[0-9a-f]{64}/.test(JSON.stringify(logs)), 'raw token or hash in logs')
console.log('Password-sharing diagnostic assertions passed.')
