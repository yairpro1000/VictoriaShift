import { useEffect, useRef, useState } from 'react'
import { useTeardownData } from '../hooks/useTeardownData'
import { PrivateTaskEditor } from './PrivateTaskEditor'
import { getTaskIcon } from './icons/taskIcons'

function formatEmployeeName(employee) {
  if (!employee) {
    return 'Unknown'
  }

  const lastInitial = employee.last_name ? `${employee.last_name.charAt(0)}.` : ''
  return [employee.first_name, lastInitial].filter(Boolean).join(' ')
}

function formatCompletedTime(completedAt) {
  if (!completedAt) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(completedAt))
}

export function TaskCard({ task, category, onToggle, interactive = true }) {
  const { user } = useTeardownData()
  const [managing, setManaging] = useState(false)
  const timer = useRef(null)
  const pointer = useRef(null)
  const suppressClick = useRef(false)
  const clearPress = () => { clearTimeout(timer.current); timer.current = null }
  useEffect(() => () => clearTimeout(timer.current), [])
  const privateMode = Boolean(user) && interactive
  const TaskIcon = getTaskIcon(task.id)

  const handleDragStart = (event) => {
    clearPress()
    event.dataTransfer.setData('text/plain', task.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleKeyDown = (event) => {
    if (privateMode && (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))) {
      event.preventDefault()
      setManaging(true)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggle(task.id)
    }
  }

  const completedTime = formatCompletedTime(task.completed_at)
  const doneMeta =
    task.done && task.completed_by
      ? `Done by ${formatEmployeeName(task.completed_by_employee)}${completedTime ? ` · ${completedTime}` : ''}`
      : ''

  return (
    <>
    <article
      className={`task-card${task.done ? ' task-card--done' : ''}`}
      draggable={interactive && !privateMode}
      onDragStart={interactive ? handleDragStart : undefined}
      onPointerDown={privateMode ? (event) => {
        if (event.button !== 0) return
        suppressClick.current = false
        pointer.current = { x: event.clientX, y: event.clientY }
        clearPress()
        timer.current = setTimeout(() => { suppressClick.current = true; setManaging(true) }, 550)
      } : undefined}
      onPointerMove={privateMode ? (event) => {
        if (pointer.current && Math.hypot(event.clientX - pointer.current.x, event.clientY - pointer.current.y) > 10) clearPress()
      } : undefined}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
      onContextMenu={privateMode ? (event) => { event.preventDefault(); clearPress(); suppressClick.current = true; setManaging(true) } : undefined}
      onClick={interactive ? () => { if (!suppressClick.current && !managing) onToggle(task.id); suppressClick.current = false } : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      tabIndex={interactive ? 0 : -1}
      role={interactive ? 'button' : undefined}
      aria-pressed={interactive ? task.done : undefined}
      aria-label={
        interactive
          ? `${task.name}. ${task.action || ''}. ${task.done ? 'Move back to to do' : 'Mark done'}`
          : undefined
      }
      style={{
        '--task-color': category.color,
      }}
    >
      {TaskIcon ? (
        <span className="task-card__icon" aria-hidden="true">
          <TaskIcon />
        </span>
      ) : null}
      <div className="task-card__content">
        <p className="task-card__title">{task.name}</p>
        {task.action ? <p className="task-card__action">{task.action}</p> : null}
        {doneMeta ? <p className="task-card__meta">{doneMeta}</p> : null}
      </div>
    </article>
    {managing ? <PrivateTaskEditor task={task} category={category} onClose={() => setManaging(false)} /> : null}
    </>
  )
}
