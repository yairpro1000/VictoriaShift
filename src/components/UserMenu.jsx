import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
export function UserMenu() {
  const { user, login, logout, authError } = useAuth()
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (user) await logout()
      else await login(username, password)
      setPassword('')
      setOpen(false)
    } catch (failure) {
      setError(failure.message)
    } finally { setBusy(false) }
  }
  return <>
    <div className="user-toolbar">
      <button className="user-button" aria-label={user ? 'User account' : 'Sign in'} type="button" onClick={() => setOpen(true)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg>
        {user ? 'yair' : null}
      </button>
    </div>
    {open ? <div className="manager-modal" role="dialog" aria-modal="true" aria-label={user ? 'User account' : 'Sign in'}>
      <form className="manager-modal__card manager-form" onSubmit={submit}>
        <h2>{user ? 'Signed in as yair' : 'Sign in'}</h2>
        {!user ? <>
          <label>Username<input autoFocus autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} disabled={busy} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} required /></label>
        </> : null}
        {error || authError ? <p role="alert">{error || authError}</p> : null}
        <div className="manager-modal__actions">
          <button className="secondary-button" type="button" disabled={busy} onClick={() => { setOpen(false); setPassword(''); setError('') }}>Cancel</button>
          <button className="primary-button" disabled={busy} type="submit">{busy ? 'Working…' : user ? 'Sign out' : 'Sign in'}</button>
        </div>
      </form>
    </div> : null}
  </>
}
