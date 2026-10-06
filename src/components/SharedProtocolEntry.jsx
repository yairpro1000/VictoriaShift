import { useCallback, useEffect, useRef, useState } from 'react'
import { TeardownDataProvider } from '../hooks/useTeardownData'
import { resolveProtocolShare, unlockProtocolShare } from '../services/shareService'
import { clearShareSession, getShareSession } from '../services/shareSession'

export function SharedProtocolEntry({ route, children }) {
  const [grant, setGrant] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(Boolean(getShareSession(route.token)))
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const denied = useCallback((failure) => {
    clearShareSession(route.token)
    setGrant(null)
    setError(failure.message || 'Shared access could not be verified.')
  }, [route.token])

  useEffect(() => {
    let active = true
    let inFlight = false
    const check = async () => {
      if (!route.token || !getShareSession(route.token) || inFlight) { setChecking(false); return }
      inFlight = true
      try {
        const access = await resolveProtocolShare()
        if (active) { setGrant({ ...access, basePath: route.basePath }); setError('') }
      } catch (failure) { if (active) denied(failure) }
      finally { inFlight = false; if (active) setChecking(false) }
    }
    check()
    const interval = setInterval(check, 30000)
    window.addEventListener('focus', check)
    return () => { active = false; clearInterval(interval); window.removeEventListener('focus', check) }
  }, [route.token, route.basePath, denied])

  const submit = async (event) => {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setBusy(true); setError('')
    try {
      const access = await unlockProtocolShare(route.token, email, password)
      setPassword('')
      setGrant({ ...access, basePath: route.basePath })
    } catch (failure) { denied(failure) }
    finally { submitting.current = false; setBusy(false) }
  }
  if (grant?.basePath === route.basePath) {
    return <TeardownDataProvider key={route.token} sharedAccess={grant} onShareDenied={denied}>{children}</TeardownDataProvider>
  }
  return <main className="share-entry manager-panel">
    <h1>Shared protocol</h1>
    {!route.token ? <p role="alert">This share link is invalid.</p> : checking ? <p role="status">Checking shared access…</p> : <form className="manager-form" onSubmit={submit}>
      <p>Enter the email address this protocol was shared with and the password the manager gave you.</p>
      <label>Email<input type="email" value={email} required autoComplete="username" disabled={busy} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Share password<input type="password" value={password} required autoComplete="current-password" disabled={busy} onChange={(event) => setPassword(event.target.value)} /></label>
      {error ? <p role="alert">{error}</p> : null}
      <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Open shared protocol'}</button>
      <p>Forgot the password? Ask the manager for a new link and password.</p>
    </form>}
  </main>
}
