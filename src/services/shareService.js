import { supabase, requireSupabase } from './supabaseClient'
import { getShareSession, setShareSession, clearShareSession } from './shareSession'
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254

function failure(error, fallback) {
  const result = new Error(error?.message || fallback)
  result.code = error?.code ?? 'share_request_failed'
  return result
}
async function shareRpc(name, args) {
  console.info('share_rpc_attempt', { operation: name, configured: Boolean(supabase) })
  try {
    const { data, error } = await requireSupabase().rpc(name, args)
    if (error) throw failure(error, 'Sharing is unavailable.')
    if (!data?.ok) throw failure(data?.error, 'Shared access was denied.')
    console.info('share_rpc_succeeded', { operation: name, protocolId: data.data?.protocol_id })
    return data.data
  } catch (error) {
    console.error('share_rpc_failed', { operation: name, reason: error.message, code: error.code ?? null })
    throw error
  }
}
export async function createProtocolShare(protocolId, email, password, origin = window.location.origin) {
  const recipient = email.trim().toLowerCase()
  console.info('share_create_validation', { hasProtocol: Boolean(protocolId), validEmail: validEmail(recipient) })
  if (!protocolId || !validEmail(recipient)) {
    console.info('share_create_validation_denied', { reason: 'invalid_protocol_or_email' })
    throw new Error('Choose a protocol and enter a valid recipient email.')
  }
  if (!password || password.length < 8 || new TextEncoder().encode(password).length > 72) {
    console.info('share_create_validation_denied', { reason: 'invalid_password_length' })
    throw new Error('Use a password of at least 8 characters (up to 72 bytes).')
  }
  const result = await shareRpc('create_protocol_share', { protocol: protocolId, email: recipient, password })
  if (!/^[0-9a-f]{64}$/.test(result.token)) throw new Error('The server returned an invalid share link.')
  return new URL(`/share/${result.token}`, origin).href
}
export const resolveProtocolShare = () => shareRpc('get_protocol_share', {})

export async function createDepartmentShare(departmentId, email, password, permissions, isManager = false, origin = window.location.origin) {
  const recipient = email.trim().toLowerCase()
  console.info('department_share_validation_attempt', { hasDepartment: Boolean(departmentId), validEmail: validEmail(recipient), isManager, protocolCount: permissions?.length })
  if (!departmentId || !validEmail(recipient) || !password || password.length < 8 || new TextEncoder().encode(password).length > 72
    || typeof isManager !== 'boolean' || !Array.isArray(permissions) || !permissions.some(row => row.can_view)
    || permissions.some(row => typeof row.can_view !== 'boolean' || typeof row.can_edit !== 'boolean' || (row.can_edit && !row.can_view))) {
    console.info('department_share_validation_denied', { reason: 'invalid_department_credentials_or_permissions' })
    throw new Error('Choose a department, valid email, password of at least 8 characters (up to 72 bytes), and at least one View permission.')
  }
  const result = await shareRpc('create_department_share', { department: departmentId, email: recipient, password, permissions, is_manager: isManager })
  if (!/^[0-9a-f]{64}$/.test(result.token)) throw new Error('The server returned an invalid share link.')
  return new URL(`/share/${result.token}`, origin).href
}

export async function unlockProtocolShare(token, email, password) {
  const recipient = email.trim().toLowerCase()
  console.info('share_unlock_validation', { validEmail: validEmail(recipient), hasPassword: Boolean(password), hasLink: /^[0-9a-f]{64}$/.test(token) })
  if (!validEmail(recipient) || !password || !/^[0-9a-f]{64}$/.test(token)) {
    console.info('share_unlock_validation_denied', { reason: 'missing_or_invalid_credentials' })
    throw new Error('Enter the authorized email and share password.')
  }
  clearShareSession(token)
  const result = await shareRpc('unlock_protocol_share', { email: recipient, password })
  if (!/^[0-9a-f]{64}$/.test(result.session_token)) {
    console.error('share_unlock_failed', { reason: 'invalid_server_session' })
    throw new Error('The server returned an invalid shared session.')
  }
  setShareSession(token, result.session_token)
  // Only the opaque session is kept; passwords and email are never persisted.
  console.info('share_unlock_session_saved', { branch: getShareSession(token) ? 'session_available' : 'session_missing' })
  return { protocol_id: result.protocol_id, department_id: result.department_id, protocols: result.protocols, is_manager: result.is_manager }
}
