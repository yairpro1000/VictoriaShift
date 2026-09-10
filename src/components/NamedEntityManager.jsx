import { useState } from 'react'

export function NamedEntityManager({ title, entityName, rows, onSave, onDelete, disabled = false }) {
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [deletingRow, setDeletingRow] = useState(null)

  const reset = () => {
    setName('')
    setEditingId(null)
    setStatus('')
  }

  const save = async (event) => {
    event.preventDefault()
    setBusy(true)
    setStatus('')
    try {
      await onSave({ name }, editingId)
      reset()
      setStatus(`${entityName} ${editingId ? 'updated' : 'created'}.`)
    } catch (error) {
      setStatus(error.message || `${entityName} could not be saved.`)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    setStatus('')
    try {
      await onDelete(deletingRow.id)
      if (editingId === deletingRow.id) reset()
      setDeletingRow(null)
      setStatus(`${entityName} deleted.`)
    } catch (error) {
      setStatus(error.message || `${entityName} could not be deleted.`)
      setDeletingRow(null)
    } finally {
      setBusy(false)
    }
  }

  const form = (
    <form className="manager-form" onSubmit={save}>
      <label>
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} required disabled={busy || disabled} />
      </label>
      <div className="manager-form__actions">
        <button className="primary-button" type="submit" disabled={busy || disabled || !name.trim()}>
          {busy ? 'Saving…' : `${editingId ? 'Save' : 'Create'} ${entityName.toLowerCase()}`}
        </button>
        {editingId ? <button className="secondary-button" type="button" onClick={reset} disabled={busy}>Cancel</button> : null}
      </div>
    </form>
  )

  return (
    <section className="manager-panel">
      <div className="manager-panel__header">
        <h2>{title}</h2>
        <button className="secondary-button" type="button" onClick={reset} disabled={busy || disabled}>+ Add {entityName.toLowerCase()}</button>
      </div>
      {!editingId ? form : null}
      {status ? <p className="manager-status" role="status">{status}</p> : null}
      <div className="manager-list">
        {rows.map((row) => (
          <article key={row.id} className={`manager-item${editingId === row.id ? ' manager-item--editing' : ''}`}>
            <p className="manager-item__title">{row.name}</p>
            {editingId === row.id ? form : null}
            <div className="manager-item__actions">
              {editingId !== row.id ? (
                <button className="secondary-button" type="button" disabled={busy} onClick={() => { setEditingId(row.id); setName(row.name); setStatus('') }}>Edit</button>
              ) : null}
              <button className="danger-button" type="button" disabled={busy} onClick={() => setDeletingRow(row)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
      {deletingRow ? (
        <div className="manager-modal" role="dialog" aria-modal="true" aria-label={`Delete ${entityName.toLowerCase()}?`}>
          <div className="manager-modal__card manager-modal__card--danger">
            <h2>Delete {entityName.toLowerCase()}?</h2>
            <p>Are you sure you want to delete “{deletingRow.name}”?</p>
            <div className="manager-modal__actions">
              <button className="secondary-button" type="button" disabled={busy} onClick={() => setDeletingRow(null)}>Cancel</button>
              <button className="danger-button" type="button" disabled={busy} onClick={remove}>{busy ? 'Deleting…' : `Delete ${entityName.toLowerCase()}`}</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
