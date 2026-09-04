import { useEffect, useRef, useState } from 'react'
import { TaskColumn } from './TaskColumn'

export function Board({ tasksByStatus, onToggleTask, onSetTaskDone }) {
  const todoRef = useRef(null)
  const doneRef = useRef(null)
  const [isDoneVisible, setIsDoneVisible] = useState(false)
  const todoCount = tasksByStatus.todo.totalCount
  const doneCount = tasksByStatus.done.totalCount

  useEffect(() => {
    const doneElement = doneRef.current

    if (!doneElement || typeof IntersectionObserver === 'undefined') {
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsDoneVisible(entry.isIntersecting)
    }, { threshold: 0.2 })

    observer.observe(doneElement)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleJumpClick = () => {
    const target = isDoneVisible ? todoRef.current : doneRef.current

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <>
      <button className="board-jump-button" type="button" onClick={handleJumpClick}>
        {isDoneVisible ? `TO DO [${todoCount}] ↑↑` : `DONE [${doneCount}] ↓↓`}
      </button>
      <main className="board">
        <TaskColumn
          ref={todoRef}
          title="TO DO"
          helperText="Tap task to move to DONE."
          count={todoCount}
          categories={tasksByStatus.todo.categories}
          isDoneColumn={false}
          onToggleTask={onToggleTask}
          onSetTaskDone={onSetTaskDone}
        />
        <TaskColumn
          ref={doneRef}
          title="DONE"
          helperText="Tap task to send back to TO DO."
          count={doneCount}
          categories={tasksByStatus.done.categories}
          isDoneColumn
          onToggleTask={onToggleTask}
          onSetTaskDone={onSetTaskDone}
        />
      </main>
    </>
  )
}
