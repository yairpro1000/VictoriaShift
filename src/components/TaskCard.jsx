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
      </div>
    </article>
  )
}
