import { useEffect, useRef, useState } from 'react'
import { createDepartmentShare } from '../services/shareService'
import { protocolChoices, changePermission } from '../services/sharePermissions'

function PermissionCheckbox({ mixed = false, ...props }) {
  const input = useRef(null)
  useEffect(() => { input.current.indeterminate = mixed }, [mixed])
  return <input ref={input} type="checkbox" {...props} />
}

export function ProtocolShareForm({ protocols, department }) {
  const [choices, setChoices] = useState({})
  const [isManager, setIsManager] = useState(false)
  const permissions = protocolChoices(protocols, choices)
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
      setLink(await createDepartmentShare(department.id, email, password, permissions, isManager))
      setPassword('')
      setStatus('Link created. Send the link and the password you chose to the recipient.')
    } catch (error) { setStatus(error.message) }
    finally { submitting.current = false; setBusy(false) }
  }
  return <section className="manager-panel">
    <h2>Share department</h2>
    <p>Share {department?.name ?? 'this department'} using an email and password. A new link for the same department and email replaces previous links.</p>
    <form className="manager-form" onSubmit={submit}>
      <details className="share-permissions" open>
        <summary>Protocols to share ({permissions.filter(row => row.can_view).length} of {protocols.length})</summary>
        <p>Edit includes View. Protocols added later are not automatically shared.</p>
        <table>
          <thead><tr><th scope="col">Protocol</th><th scope="col">View</th><th scope="col">Edit</th></tr></thead>
          <tbody>
            <tr><th scope="row">All protocols</th>{['can_view', 'can_edit'].map(permission => {
              const count = permissions.filter(row => row[permission]).length
              return <td key={permission}><PermissionCheckbox aria-label={`Select all ${permission === 'can_view' ? 'View' : 'Edit'} permissions`} checked={count > 0 && count === protocols.length} mixed={count > 0 && count < protocols.length} disabled={busy || !protocols.length} onChange={event => {
                setChoices(changePermission(permissions, null, permission, event.target.checked)); setLink(''); setStatus('')
              }} /></td>
            })}</tr>
            {protocols.map((row, index) => <tr key={row.id}><th scope="row">{row.name}</th>{['can_view', 'can_edit'].map(permission => <td key={permission}><input type="checkbox" aria-label={`${permission === 'can_view' ? 'View' : 'Edit'} ${row.name}`} checked={permissions[index][permission]} disabled={busy} onChange={event => {
              setChoices(changePermission(permissions, row.id, permission, event.target.checked)); setLink(''); setStatus('')
            }} /></td>)}</tr>)}
          </tbody>
        </table>
        {!protocols.length ? <p>Create a protocol in this department before sharing.</p> : null}
      </details>
      <label className="share-manager-permission"><input type="checkbox" checked={isManager} disabled={busy} onChange={event => { setIsManager(event.target.checked); setLink(''); setStatus('') }} />Allow manager page access</label>
      <p>View and Edit permissions still apply on the manager page.</p>
      <label>Recipient email<input type="email" autoComplete="email" value={email} required disabled={busy} onChange={(event) => { setEmail(event.target.value); setLink(''); setStatus('') }} /></label>
      <label>Share password<input type="password" autoComplete="new-password" minLength={8} maxLength={72} value={password} required disabled={busy} onChange={(event) => { setPassword(event.target.value); setLink(''); setStatus('') }} /></label>
      <p>Choose a password with at least 8 characters. If it is forgotten, generate a replacement link with a new password.</p>
      <button className="primary-button" type="submit" disabled={busy || !department?.id || !permissions.some(row => row.can_view)}>{busy ? 'Creating…' : 'Generate share link'}</button>
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
