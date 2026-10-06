import { useRef, useState } from 'react'

export function NamedEntityManager({ title, entityName, rows, onSave, onDelete, onReorder, allowCreate = true, disabled = false }) {
  const drag = useRef(null)
  const [dropTarget, setDropTarget] = useState(null)
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

  const moveRow = async (fromId, toId) => {
    if (busy || disabled || fromId === toId) return
    const ids = rows.map((row) => row.id)
    const from = ids.indexOf(fromId)
    const to = ids.indexOf(toId)
    if (from < 0 || to < 0) return
    ids.splice(to, 0, ids.splice(from, 1)[0])
    setBusy(true)
    setStatus('Saving department order…')
    try {
      await onReorder(ids)
      setStatus('Department order saved.')
    } catch (error) {
      setStatus(error.message || 'Department order could not be saved.')
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
        {allowCreate ? <button className="secondary-button" type="button" onClick={reset} disabled={busy || disabled}>+ Add {entityName.toLowerCase()}</button> : null}
      </div>
      {!editingId && allowCreate ? form : null}
      {status ? <p className="manager-status" role="status">{status}</p> : null}
      <div className="manager-list">
        {rows.map((row, index) => (
          <article key={row.id} data-reorder-id={onReorder ? row.id : undefined} className={`manager-item${editingId === row.id ? ' manager-item--editing' : ''}${dropTarget === row.id ? ' manager-item--drop-target' : ''}`}>
            {onReorder ? (
              <button
                className="department-drag-handle"
                type="button"
                aria-label={`Reorder ${row.name}. Drag or use up and down arrow keys.`}
                title="Drag to reorder, or use ↑ and ↓"
                disabled={busy || disabled || Boolean(editingId)}
                onPointerDown={(event) => {
                  if (event.button !== 0) return
                  drag.current = { from: row.id, to: row.id }
                  event.currentTarget.setPointerCapture(event.pointerId)
                }}
                onPointerMove={(event) => {
                  if (!drag.current) return
                  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-reorder-id]')
                  const id = target?.getAttribute('data-reorder-id')
                  if (id && rows.some((item) => item.id === id)) {
                    drag.current.to = id
                    setDropTarget(id)
                  }
                }}
                onPointerUp={() => {
                  const current = drag.current
                  drag.current = null
                  setDropTarget(null)
                  if (current) moveRow(current.from, current.to)
                }}
                onPointerCancel={() => { drag.current = null; setDropTarget(null) }}
                onLostPointerCapture={() => { drag.current = null; setDropTarget(null) }}
                onKeyDown={(event) => {
                  if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
                  event.preventDefault()
                  const target = rows[index + (event.key === 'ArrowUp' ? -1 : 1)]
                  if (target) moveRow(row.id, target.id)
                }}
              >⠿</button>
            ) : null}
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
