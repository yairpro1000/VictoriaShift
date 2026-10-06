import { supabase, requireSupabase } from './supabaseClient'
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
export async function createProtocolShare(protocolId, email, origin = window.location.origin) {
  const recipient = email.trim().toLowerCase()
  console.info('share_create_validation', { hasProtocol: Boolean(protocolId), validEmail: validEmail(recipient) })
  if (!protocolId || !validEmail(recipient)) {
    console.info('share_create_validation_denied', { reason: 'invalid_protocol_or_email' })
    throw new Error('Choose a protocol and enter a valid recipient email.')
  }
  const result = await shareRpc('create_protocol_share', { protocol: protocolId, email: recipient })
  if (!/^[0-9a-f]{64}$/.test(result.token)) throw new Error('The server returned an invalid share link.')
  return new URL(`/share/${result.token}`, origin).href
}
export const resolveProtocolShare = () => shareRpc('get_protocol_share', {})

export async function requestShareSignIn(email, redirectTo) {
  const recipient = email.trim().toLowerCase()
  console.info('share_email_signin_attempt', { configured: Boolean(supabase), validEmail: validEmail(recipient), method: 'verified_email_link_or_otp' })
  try {
    if (!validEmail(recipient)) throw new Error('Enter a valid email address.')
    const { error } = await requireSupabase().auth.signInWithOtp({
      email: recipient, options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
    })
    if (error) throw error
    console.info('share_email_signin_sent', { branch: 'await_email_verification' })
  } catch (error) {
    console.error('share_email_signin_failed', { reason: error.message, code: error.code ?? null, status: error.status ?? null })
    throw error
  }
}

export async function verifyShareCode(email, code) {
  console.info('share_email_verify_attempt', { configured: Boolean(supabase), hasCode: Boolean(code.trim()) })
  try {
    if (!code.trim()) throw new Error('Enter the code from your email.')
    const { error } = await requireSupabase().auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' })
    if (error) throw error
    console.info('share_email_verify_succeeded', { branch: 'session_verified_by_auth' })
  } catch (error) {
    console.error('share_email_verify_failed', { reason: error.message, code: error.code ?? null, status: error.status ?? null })
    throw error
  }
}
