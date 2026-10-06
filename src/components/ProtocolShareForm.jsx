import { useRef, useState } from 'react'
import { createProtocolShare } from '../services/shareService'
export function ProtocolShareForm({ protocols, selectedProtocolId }) {
  const [protocolId, setProtocolId] = useState(selectedProtocolId ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [link, setLink] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  const submit = async (event) => {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setBusy(true); setStatus(''); setLink('')
    try {
      setLink(await createProtocolShare(protocolId, email, password))
      setPassword('')
      setStatus('Link created. Send the link and the password you chose to the recipient.')
    } catch (error) { setStatus(error.message) }
    finally { submitting.current = false; setBusy(false) }
  }
  return <section className="manager-panel">
    <h2>Share a protocol</h2>
    <p>The recipient enters this email and your password to open and edit this protocol. No confirmation email is sent. A new link for the same protocol and email replaces the previous link.</p>
    <form className="manager-form" onSubmit={submit}>
      <label>Protocol<select value={protocolId} disabled={busy} required onChange={(event) => { setProtocolId(event.target.value); setLink(''); setStatus('') }}>
        <option value="">Select protocol</option>
        {protocols.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
      </select></label>
      <label>Recipient email<input type="email" autoComplete="email" value={email} required disabled={busy} onChange={(event) => { setEmail(event.target.value); setLink(''); setStatus('') }} /></label>
      <label>Share password<input type="password" autoComplete="new-password" minLength={8} maxLength={72} value={password} required disabled={busy} onChange={(event) => { setPassword(event.target.value); setLink(''); setStatus('') }} /></label>
      <p>Choose a password with at least 8 characters. If it is forgotten, generate a replacement link with a new password.</p>
      <button className="primary-button" type="submit" disabled={busy || !protocolId}>{busy ? 'Creating…' : 'Generate share link'}</button>
    </form>
    {link ? <div className="manager-form">
      <label>Share link<input readOnly value={link} onFocus={(event) => event.target.select()} /></label>
      <button className="secondary-button" type="button" onClick={async () => {
        try { await navigator.clipboard.writeText(link); setStatus('Link copied.') }
        catch { setStatus('Select the link above and copy it manually.') }
      }}>Copy link</button>
    </div> : null}
    {status ? <p role="status">{status}</p> : null}
  </section>
}
