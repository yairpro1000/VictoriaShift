import { forwardRef } from 'react'
import { CategorySection } from './CategorySection'

export const TaskColumn = forwardRef(function TaskColumn({
  title,
  helperText,
  count,
  categories,
  isDoneColumn,
  onToggleTask,
  onSetTaskDone,
}, ref) {
  const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')

    if (!taskId) {
      return
    }

    onSetTaskDone(taskId, isDoneColumn)
  }

  return (
    <section
      ref={ref}
      className={`task-column${isDoneColumn ? ' task-column--done' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <header className="task-column__header">
        <h2>
          {title} <span>&middot; {count}</span>
        </h2>
        {helperText ? <p className="task-column__hint">{helperText}</p> : null}
      </header>
      <div className="task-column__content">
        {categories.length ? (
          categories.map(({ category, tasks }) => (
            <CategorySection
              key={category.id}
              category={category}
              tasks={tasks}
              isDoneColumn={isDoneColumn}
              onToggleTask={onToggleTask}
              onSetTaskDone={onSetTaskDone}
            />
          ))
        ) : (
          <p className="task-column__empty">
            {isDoneColumn ? 'Nothing done yet.' : 'All clear here.'}
          </p>
        )}
      </div>
    </section>
  )
})
