import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTeardownData } from '../hooks/useTeardownData'
export function PrivateTaskEditor({ task, category, onClose }) {
  const { currentCategories, currentTasks, saveTask, removeTask } = useTeardownData()
  const [mode, setMode] = useState(task ? 'actions' : 'edit')
  const [draft, setDraft] = useState(task ?? {
    name: '', action: '', category_id: category.id, done: false,
    sort_order: Math.max(0, ...currentTasks.filter((row) => row.category_id === category.id).map((row) => row.sort_order)) + 1,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'delete') await removeTask(task.id)
      else await saveTask({ ...draft, action: draft.action ?? '' }, task?.id)
      onClose()
    } catch (failure) { setError(failure.message || 'Task change could not be saved.') }
    finally { setBusy(false) }
  }
  // Escape the board columns’ backdrop-filter stacking contexts.
  return createPortal(<div className="manager-modal" role="dialog" aria-modal="true" aria-label={task ? 'Manage task' : 'Add task'}>
    <form className="manager-modal__card manager-form" onSubmit={submit}>
      <h2>{mode === 'delete' ? 'Delete task?' : task ? task.name : 'Add task'}</h2>
      {mode === 'edit' ? <>
        <label>Category<select value={draft.category_id} onChange={(event) => setDraft({ ...draft, category_id: event.target.value })} disabled={busy}>
          {currentCategories.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
        </select></label>
        <label>Name<input autoFocus required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} disabled={busy}/></label>
        <label>Action<textarea value={draft.action ?? ''} onChange={(event) => setDraft({ ...draft, action: event.target.value })} disabled={busy}/></label>
        <label>Order<input type="number" required value={draft.sort_order} onChange={(event) => setDraft({ ...draft, sort_order: event.target.value })} disabled={busy}/></label>
      </> : mode === 'delete' ? <p>Delete “{task.name}”?</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      <div className="manager-modal__actions">
        {mode === 'actions' ? <>
          <button className="secondary-button" type="button" onClick={() => setMode('edit')}>Edit</button>
          <button className="danger-button" type="button" onClick={() => setMode('delete')}>Delete</button>
        </> : <button className={mode === 'delete' ? 'danger-button' : 'primary-button'} type="submit" disabled={busy || (mode === 'edit' && !draft.name.trim())}>{busy ? 'Saving…' : mode === 'delete' ? 'Delete task' : task ? 'Save task' : 'Create task'}</button>}
        <button className="secondary-button" type="button" disabled={busy} onClick={onClose}>Cancel</button>
      </div>
    </form>
  </div>, document.body)
}
