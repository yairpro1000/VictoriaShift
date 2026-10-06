import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { TeardownDataProvider } from '../hooks/useTeardownData'
import { requestShareSignIn, resolveProtocolShare, verifyShareCode } from '../services/shareService'

export function SharedProtocolEntry({ route, children }) {
  const { user, logout } = useAuth()
  const [grant, setGrant] = useState(null)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(Boolean(user))
  const [error, setError] = useState('')
  const denied = useCallback((failure) => {
    setGrant(null)
    setError(failure.message || 'Shared access could not be verified.')
  }, [])

  useEffect(() => {
    let active = true
    setGrant(null); setError('')
    if (!route.token || !user) { setChecking(false); return }
    const check = async () => {
      try {
        const access = await resolveProtocolShare()
        if (active) { setGrant({ ...access, userId: user.id, basePath: route.basePath }); setError('') }
      } catch (failure) { if (active) denied(failure) }
      finally { if (active) setChecking(false) }
    }
    setChecking(true)
    check()
    const interval = setInterval(check, 30000)
    window.addEventListener('focus', check)
    return () => { active = false; clearInterval(interval); window.removeEventListener('focus', check) }
  }, [route.token, route.basePath, user?.id, denied])

  if (grant?.userId === user?.id && grant?.basePath === route.basePath && user) {
    return <TeardownDataProvider key={`${user.id}:${route.token}`} user={user} sharedAccess={grant} onShareDenied={denied}>{children}</TeardownDataProvider>
  }
  const submit = async (event) => {
    event.preventDefault()
    setBusy(true); setError('')
    try {
      if (sent) await verifyShareCode(email, code)
      else {
        await requestShareSignIn(email, new URL(route.basePath, window.location.origin).href)
        setSent(true)
      }
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }
  return <main className="share-entry manager-panel">
    <h1>Shared protocol</h1>
    {!route.token ? <p role="alert">This share link is invalid.</p> : checking ? <p role="status">Checking shared access…</p> : user ? <>
      <p>Signed in as {user.email}.</p>
      {error ? <p role="alert">{error}</p> : null}
      <button className="secondary-button" disabled={busy} type="button" onClick={async () => {
        setBusy(true)
        try { await logout(); setError(''); setSent(false); setCode('') }
        catch (failure) { setError(failure.message) }
        finally { setBusy(false) }
      }}>Use a different email</button>
    </> : <form className="manager-form" onSubmit={submit}>
      <p>Use the email address the manager shared this protocol with. We’ll send a sign-in link to verify it.</p>
      <label>Email<input type="email" value={email} required autoComplete="email" disabled={busy || sent} onChange={(event) => setEmail(event.target.value)} /></label>
      {sent ? <>
        <p role="status">Check your inbox and open the sign-in link. If your email contains a code, you can enter it here.</p>
        <label>Email verification code<input value={code} required autoComplete="one-time-code" disabled={busy} onChange={(event) => setCode(event.target.value)} /></label>
        <button className="secondary-button" type="button" disabled={busy} onClick={() => { setSent(false); setCode('') }}>Change email or resend</button>
      </> : null}
      {error ? <p role="alert">{error}</p> : null}
      <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Working…' : sent ? 'Verify code' : 'Send sign-in link'}</button>
    </form>}
  </main>
}
