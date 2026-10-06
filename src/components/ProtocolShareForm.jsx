import { useState } from 'react'
import { createProtocolShare } from '../services/shareService'
export function ProtocolShareForm({ protocols, selectedProtocolId }) {
  const [protocolId, setProtocolId] = useState(selectedProtocolId ?? '')
  const [email, setEmail] = useState('')
  const [link, setLink] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    setBusy(true); setStatus(''); setLink('')
    try {
      setLink(await createProtocolShare(protocolId, email))
      setStatus('Link created. Copy it and send it to the recipient.')
    } catch (error) { setStatus(error.message) }
    finally { setBusy(false) }
  }
  return <section className="manager-panel">
    <h2>Share a protocol</h2>
    <p>The recipient verifies this email to open and edit this protocol.</p>
    <form className="manager-form" onSubmit={submit}>
      <label>Protocol<select value={protocolId} disabled={busy} required onChange={(event) => { setProtocolId(event.target.value); setLink(''); setStatus('') }}>
        <option value="">Select protocol</option>
        {protocols.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
      </select></label>
      <label>Recipient email<input type="email" autoComplete="email" value={email} required disabled={busy} onChange={(event) => { setEmail(event.target.value); setLink(''); setStatus('') }} /></label>
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
