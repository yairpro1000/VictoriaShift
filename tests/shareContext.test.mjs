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
test('session secret is tied to one link and stripped from ordinary and malformed routes', async () => {
  let path = '/share/' + token
  const requests = []
  const session = 'b'.repeat(64)
  const fetcher = shareAwareFetch(async (url, options) => requests.push(options.headers), () => path, link => link === token ? session : null)
  await fetcher('https://example.com/rest/v1/tasks')
  path += '/manager'
  await fetcher('https://example.com/rest/v1/tasks')
  for (const next of ['/share/' + 'c'.repeat(64), '/share/invalid', '/']) {
    path = next
    await fetcher('https://example.com/rest/v1/tasks', { headers: { 'x-protocol-session': session } })
  }
  assert.equal(requests[0].get('x-protocol-session'),session)
  assert.equal(requests[1].get('x-protocol-session'),session)
  for (const request of requests.slice(2)) assert.equal(request.get('x-protocol-session'),null)
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
