import { TaskCard } from './TaskCard'
import { getCategoryIcon } from './icons/taskIcons'

export function CategorySection({
  category,
  tasks,
  isDoneColumn,
  onToggleTask,
  onSetTaskDone,
}) {
  const allDone = tasks.every((task) => task.done)
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
      onDragOver={handleDragOver}
      onDrop={handleDrop}
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
        <span>{tasks.length}</span>
      </div>
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
