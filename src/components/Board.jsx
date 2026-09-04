import { TaskColumn } from './TaskColumn'

export function Board({ tasksByStatus, onToggleTask, onSetTaskDone }) {
  return (
    <main className="board">
      <TaskColumn
        title="TO DO"
        count={tasksByStatus.todo.totalCount}
        categories={tasksByStatus.todo.categories}
        isDoneColumn={false}
        onToggleTask={onToggleTask}
        onSetTaskDone={onSetTaskDone}
      />
      <TaskColumn
        title="DONE"
        count={tasksByStatus.done.totalCount}
        categories={tasksByStatus.done.categories}
        isDoneColumn
        onToggleTask={onToggleTask}
        onSetTaskDone={onSetTaskDone}
      />
    </main>
  )
}
