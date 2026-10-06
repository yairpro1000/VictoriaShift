import test from 'node:test'
import assert from 'node:assert/strict'
import { getShareSession, setShareSession, clearShareSession } from '../src/services/shareSession.js'
test('sessions remain isolated by link and work when browser storage is unavailable', () => {
  const token = '1'.repeat(64), other = '2'.repeat(64), session = '3'.repeat(64)
  setShareSession(token,session)
  assert.equal(getShareSession(token),session)
  assert.equal(getShareSession(other),null)
  clearShareSession(token)
  assert.equal(getShareSession(token),null)
  assert.throws(() => setShareSession(token,'invalid'), /Invalid/)
  assert.equal(getShareSession('invalid'),null)
})
