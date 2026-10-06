const sessions = new Map()
const valid = (value) => /^[0-9a-f]{64}$/.test(value ?? '')
const key = (token) => `victoria-share-session-v1:${token}`

export function getShareSession(token) {
  if (!valid(token)) return null
  if (sessions.has(token)) return sessions.get(token)
  try {
    const value = window.sessionStorage.getItem(key(token))
    if (valid(value)) { sessions.set(token, value); return value }
  } catch { /* In-memory access works when browser storage is disabled. */ }
  return null
}
export function setShareSession(token, session) {
  if (!valid(token) || !valid(session)) throw new Error('Invalid shared session.')
  sessions.set(token, session)
  try { window.sessionStorage.setItem(key(token), session) } catch { /* memory fallback */ }
}
export function clearShareSession(token) {
  sessions.delete(token)
  try { window.sessionStorage.removeItem(key(token)) } catch { /* memory fallback */ }
}
