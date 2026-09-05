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
  const handleDragStart = (event) => {
    event.dataTransfer.setData('text/plain', task.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleKeyDown = (event) => {
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
    <article
      className={`task-card${task.done ? ' task-card--done' : ''}`}
      draggable={interactive}
      onDragStart={interactive ? handleDragStart : undefined}
      onClick={interactive ? () => onToggle(task.id) : undefined}
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
      <div className="task-card__content">
        <p className="task-card__title">{task.name}</p>
        {task.action ? <p className="task-card__action">{task.action}</p> : null}
        {doneMeta ? <p className="task-card__meta">{doneMeta}</p> : null}
      </div>
    </article>
  )
}
