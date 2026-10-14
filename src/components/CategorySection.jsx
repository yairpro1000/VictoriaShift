import { useState } from 'react'
import { useTeardownData } from '../hooks/useTeardownData'
import { PrivateTaskEditor } from './PrivateTaskEditor'
import { TaskCard } from './TaskCard'
import { getCategoryIcon } from './icons/taskIcons'

export function CategorySection({
  category,
  tasks,
  isDoneColumn,
  onToggleTask,
  onSetTaskDone,
}) {
  const { user, sharedAccess, canEditProtocol } = useTeardownData()
  const editable = canEditProtocol(category.protocol_id)
  const [adding, setAdding] = useState(false)
  const allDone = tasks.length > 0 && tasks.every((task) => task.done)
  const CategoryIcon = getCategoryIcon(category.id)

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
      className={`category-section${allDone ? ' category-section--complete' : ''}`}
      onDragOver={editable ? handleDragOver : undefined}
      onDrop={editable ? handleDrop : undefined}
      aria-label={category.name}
      style={{
        '--category-color': category.color,
      }}
    >
      <div className="category-section__header">
        <h3>
          {CategoryIcon ? (
            <span className="category-section__icon" aria-hidden="true">
              <CategoryIcon />
            </span>
          ) : null}
          {category.name}
        </h3>
        {(user || sharedAccess) && editable ? <button className="category-add-task" type="button" aria-label={`Add task to ${category.name}`} onClick={() => setAdding(true)}>+</button> : null}
        <span>{tasks.length}</span>
      </div>
      {adding && editable ? <PrivateTaskEditor category={category} onClose={() => setAdding(false)} /> : null}
      <div className="category-section__tasks">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            category={category}
            onToggle={onToggleTask}
            onSetTaskDone={onSetTaskDone}
          />
        ))}
      </div>
    </section>
  )
}
