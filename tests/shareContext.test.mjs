import test from 'node:test'
import assert from 'node:assert/strict'
import { shareRoute, shareAwareFetch } from '../src/services/shareContext.js'
const token = 'a'.repeat(64)
test('share route recognizes board and manager while malformed routes fail closed', () => {
  assert.equal(shareRoute('/'), null)
  assert.equal(shareRoute('/manager'), null)
  assert.equal(shareRoute('/share/' + token).token, token)
  assert.equal(shareRoute('/share/' + token + '/manager').basePath, '/share/' + token)
  assert.equal(shareRoute('/share/invalid').token, null)
  assert.equal(shareRoute('/share/' + token + '/unexpected').token, null)
})
test('share header is request-local, preserves authorization and clears on normal navigation', async () => {
  let path = '/share/' + token
  const requests = []
  const scopedFetch = shareAwareFetch(async (url, options) => requests.push(options.headers), () => path)
  await scopedFetch('https://example.com/rest/v1/tasks', { headers: { authorization: 'Bearer test' } })
  path = '/share/invalid'
  await scopedFetch('https://example.com/rest/v1/tasks')
  path = '/'
  await scopedFetch('https://example.com/rest/v1/tasks', { headers: { 'x-protocol-share': token } })
  assert.equal(requests[0].get('x-protocol-share'), token)
  assert.equal(requests[0].get('authorization'), 'Bearer test')
  assert.equal(requests[1].get('x-protocol-share'), 'invalid')
  assert.equal(requests[2].get('x-protocol-share'), null)
})
