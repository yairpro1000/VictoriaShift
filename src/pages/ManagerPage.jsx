import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useTeardownData } from '../hooks/useTeardownData.jsx'
import { TaskCard } from '../components/TaskCard'

const EMPTY_CATEGORY = {
  name: '',
  color: '#ffd166',
  sort_order: '',
  urgent: false,
}

const EMPTY_TASK = {
  category_id: '',
  name: '',
  action: '',
  sort_order: '',
  done: false,
  completed_at: null,
}

const MANAGER_PASSWORD = 'papi3823'
const MANAGER_SESSION_KEY = 'victoria-shift-manager-unlocked'

function groupTasksByCategory(categories, tasks) {
  return categories
    .map((category) => ({
      category,
      tasks: tasks
        .filter((task) => task.category_id === category.id)
        .sort((left, right) => left.sort_order - right.sort_order),
    }))
    .filter(({ tasks }) => tasks.length > 0)
}

export function ManagerPage() {
  const {
    categories,
    tasks,
    loading,
    errorMessage,
    saveCategory,
    removeCategory,
    saveTask,
    removeTask,
  } = useTeardownData()
  const [categoryDraft, setCategoryDraft] = useState(EMPTY_CATEGORY)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [categoryStatus, setCategoryStatus] = useState('')
  const [newTaskDraft, setNewTaskDraft] = useState(EMPTY_TASK)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editingTaskDraft, setEditingTaskDraft] = useState(EMPTY_TASK)
  const [taskStatus, setTaskStatus] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)

  const orderedCategories = useMemo(
    () => [...categories].sort((left, right) => left.sort_order - right.sort_order),
    [categories],
  )

  const groupedTasks = useMemo(
    () => groupTasksByCategory(orderedCategories, tasks),
    [orderedCategories, tasks],
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setIsUnlocked(window.sessionStorage.getItem(MANAGER_SESSION_KEY) === 'true')
  }, [])

  const resetCategoryForm = () => {
    setCategoryDraft(EMPTY_CATEGORY)
    setEditingCategoryId(null)
  }

  const resetTaskForm = () => {
    setNewTaskDraft({
      ...EMPTY_TASK,
      category_id: orderedCategories[0]?.id ?? '',
    })
    setEditingTaskDraft(EMPTY_TASK)
    setEditingTaskId(null)
  }

  useEffect(() => {
    if (!newTaskDraft.category_id && orderedCategories.length > 0) {
      setNewTaskDraft((current) => ({
        ...current,
        category_id: orderedCategories[0].id,
      }))
    }
  }, [newTaskDraft.category_id, orderedCategories])

  const handleCategorySubmit = async (event) => {
    event.preventDefault()

    if (!categoryDraft.name.trim() || Number.isNaN(Number(categoryDraft.sort_order))) {
      setCategoryStatus('Category name and numeric order are required.')
      return
    }

    try {
      await saveCategory(categoryDraft, editingCategoryId)
      setCategoryStatus(editingCategoryId ? 'Category updated.' : 'Category created.')
      resetCategoryForm()
    } catch (error) {
      console.error('Failed to save category.', error)
      setCategoryStatus(error.message || 'Failed to save category.')
    }
  }

  const handleTaskSubmit = async (event) => {
    event.preventDefault()

    if (
      !newTaskDraft.category_id ||
      !newTaskDraft.name.trim() ||
      Number.isNaN(Number(newTaskDraft.sort_order))
    ) {
      setTaskStatus('Task category, name, and numeric order are required.')
      return
    }

    try {
      await saveTask(newTaskDraft)
      setTaskStatus('Task created.')
      setNewTaskDraft({
        ...EMPTY_TASK,
        category_id: newTaskDraft.category_id,
      })
    } catch (error) {
      console.error('Failed to save task.', error)
      setTaskStatus(error.message || 'Failed to save task.')
    }
  }

  const handlePasswordSubmit = (event) => {
    event.preventDefault()

    if (passwordValue !== MANAGER_PASSWORD) {
      setPasswordError('Wrong password.')
      return
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(MANAGER_SESSION_KEY, 'true')
    }

    setIsUnlocked(true)
    setPasswordError('')
    setPasswordValue('')
  }

  const startTaskEdit = (task) => {
    setEditingTaskId(task.id)
    setEditingTaskDraft({
      category_id: task.category_id,
      name: task.name,
      action: task.action ?? '',
      sort_order: String(task.sort_order),
      done: task.done,
      completed_at: task.completed_at,
    })
  }

  const saveEditingTask = async () => {
    if (
      !editingTaskDraft.category_id ||
      !editingTaskDraft.name.trim() ||
      Number.isNaN(Number(editingTaskDraft.sort_order))
    ) {
      setTaskStatus('Task category, name, and numeric order are required.')
      return
    }

    try {
      await saveTask(editingTaskDraft, editingTaskId)
      setTaskStatus('Task updated.')
      resetTaskForm()
    } catch (error) {
      console.error('Failed to save task.', error)
      setTaskStatus(error.message || 'Failed to save task.')
    }
  }

  return (
    <div className="manager-shell">
      {!isUnlocked ? (
        <div className="manager-lock">
          <form className="manager-lock__card" onSubmit={handlePasswordSubmit}>
            <p className="eyebrow">Restricted</p>
            <h2>Manager Password</h2>
            <label>
              Password
              <input
                type="password"
                value={passwordValue}
                onChange={(event) => {
                  setPasswordValue(event.target.value)
                  setPasswordError('')
                }}
                autoFocus
                required
              />
            </label>
            {passwordError ? (
              <p className="status-banner status-banner--warning">{passwordError}</p>
            ) : null}
            <button className="primary-button" type="submit">
              Unlock manager
            </button>
          </form>
        </div>
      ) : null}

      <header className="manager-header">
        <div className="app-header__row">
          <div>
            <p className="eyebrow">Internal Tools</p>
            <h1>Manager</h1>
          </div>
          <Link className="header-link" to="/">
            Back to board
          </Link>
        </div>
        <p className="intro">
          Update categories and tasks directly in Supabase. This route is not secure by URL alone.
        </p>
        {loading ? <p className="status-banner">Loading manager data…</p> : null}
        {errorMessage ? <p className="status-banner status-banner--warning">{errorMessage}</p> : null}
      </header>

      <main className={`manager-grid${!isUnlocked ? ' manager-grid--locked' : ''}`} aria-hidden={!isUnlocked}>
        <section className="manager-panel">
          <div className="manager-panel__header">
            <h2>Categories</h2>
            <button className="secondary-button" type="button" onClick={resetCategoryForm}>
              + Add category
            </button>
          </div>

          <form className="manager-form" onSubmit={handleCategorySubmit}>
            <label>
              Name
              <input
                type="text"
                value={categoryDraft.name}
                onChange={(event) =>
                  setCategoryDraft((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Color
              <div className="color-row">
                <input
                  type="color"
                  value={categoryDraft.color}
                  onChange={(event) =>
                    setCategoryDraft((current) => ({ ...current, color: event.target.value }))
                  }
                />
                <input
                  type="text"
                  value={categoryDraft.color}
                  onChange={(event) =>
                    setCategoryDraft((current) => ({ ...current, color: event.target.value }))
                  }
                  pattern="^#([A-Fa-f0-9]{6})$"
                  required
                />
              </div>
            </label>
            <label>
              Order
              <input
                type="number"
                value={categoryDraft.sort_order}
                onChange={(event) =>
                  setCategoryDraft((current) => ({ ...current, sort_order: event.target.value }))
                }
                required
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={categoryDraft.urgent}
                onChange={(event) =>
                  setCategoryDraft((current) => ({ ...current, urgent: event.target.checked }))
                }
              />
              Urgent
            </label>
            <div className="manager-form__actions">
              <button className="primary-button" type="submit">
                {editingCategoryId ? 'Save category' : 'Create category'}
              </button>
              {editingCategoryId ? (
                <button className="secondary-button" type="button" onClick={resetCategoryForm}>
                  Cancel
                </button>
              ) : null}
            </div>
            {categoryStatus ? <p className="manager-status">{categoryStatus}</p> : null}
          </form>

          <div className="manager-list">
            {orderedCategories.map((category) => (
              <article key={category.id} className="manager-item">
                <div>
                  <p className="manager-item__title">{category.name}</p>
                  <p className="manager-item__meta">
                    <span
                      className="color-swatch"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.color} · order {category.sort_order}
                    {category.urgent ? ' · urgent' : ''}
                  </p>
                </div>
                <div className="manager-item__actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => {
                      setEditingCategoryId(category.id)
                      setCategoryDraft({
                        name: category.name,
                        color: category.color,
                        sort_order: String(category.sort_order),
                        urgent: category.urgent,
                      })
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={async () => {
                      try {
                        await removeCategory(category.id)
                        setCategoryStatus('Category deleted.')
                      } catch (error) {
                        console.error('Failed to delete category.', error)
                        setCategoryStatus(error.message || 'Failed to delete category.')
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="manager-panel">
          <div className="manager-panel__header">
            <h2>Tasks</h2>
            <button className="secondary-button" type="button" onClick={resetTaskForm}>
              + Add task
            </button>
          </div>

          <form className="manager-form" onSubmit={handleTaskSubmit}>
            <label>
              Category
              <select
                value={newTaskDraft.category_id}
                onChange={(event) =>
                  setNewTaskDraft((current) => ({ ...current, category_id: event.target.value }))
                }
                required
              >
                <option value="">Select category</option>
                {orderedCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Name
              <input
                type="text"
                value={newTaskDraft.name}
                onChange={(event) =>
                  setNewTaskDraft((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Action
              <textarea
                rows="3"
                value={newTaskDraft.action}
                onChange={(event) =>
                  setNewTaskDraft((current) => ({ ...current, action: event.target.value }))
                }
              />
            </label>
            <label>
              Order
              <input
                type="number"
                value={newTaskDraft.sort_order}
                onChange={(event) =>
                  setNewTaskDraft((current) => ({ ...current, sort_order: event.target.value }))
                }
                required
              />
            </label>
            <div className="manager-form__actions">
              <button className="primary-button" type="submit">
                Create task
              </button>
            </div>
            {taskStatus ? <p className="manager-status">{taskStatus}</p> : null}
          </form>

          <div className="manager-task-groups">
            {groupedTasks.map(({ category, tasks: categoryTasks }) => (
              <section
                key={category.id}
                className={`category-section${category.urgent ? ' category-section--urgent' : ''}`}
                style={{ '--category-color': category.color }}
              >
                <div className="category-section__header">
                  <h3>{category.name}</h3>
                  <span>{categoryTasks.length}</span>
                </div>
                <div className="category-section__tasks">
                  {categoryTasks.map((task) => {
                    const isEditing = editingTaskId === task.id
                    const previewCategory =
                      orderedCategories.find(
                        (item) => item.id === (isEditing ? editingTaskDraft.category_id : task.category_id),
                      ) ?? category
                    const previewTask = isEditing
                      ? {
                          ...task,
                          name: editingTaskDraft.name || 'Untitled task',
                          action: editingTaskDraft.action,
                        }
                      : task

                    return (
                      <article
                        key={task.id}
                        className={`manager-task-card${isEditing ? ' manager-task-card--editing' : ''}`}
                      >
                        <div className="manager-task-card__preview">
                          <TaskCard
                            task={previewTask}
                            category={previewCategory}
                            onToggle={() => {}}
                            interactive={false}
                          />
                        </div>

                        {isEditing ? (
                          <div className="manager-task-card__editor">
                            <label>
                              Category
                              <select
                                value={editingTaskDraft.category_id}
                                onChange={(event) =>
                                  setEditingTaskDraft((current) => ({
                                    ...current,
                                    category_id: event.target.value,
                                  }))
                                }
                              >
                                {orderedCategories.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Name
                              <input
                                type="text"
                                value={editingTaskDraft.name}
                                onChange={(event) =>
                                  setEditingTaskDraft((current) => ({
                                    ...current,
                                    name: event.target.value,
                                  }))
                                }
                              />
                            </label>
                            <label>
                              Action
                              <textarea
                                rows="3"
                                value={editingTaskDraft.action}
                                onChange={(event) =>
                                  setEditingTaskDraft((current) => ({
                                    ...current,
                                    action: event.target.value,
                                  }))
                                }
                              />
                            </label>
                            <label>
                              Order
                              <input
                                type="number"
                                value={editingTaskDraft.sort_order}
                                onChange={(event) =>
                                  setEditingTaskDraft((current) => ({
                                    ...current,
                                    sort_order: event.target.value,
                                  }))
                                }
                              />
                            </label>
                            <div className="manager-task-card__actions">
                              <button
                                className="primary-button"
                                type="button"
                                onClick={saveEditingTask}
                              >
                                Save
                              </button>
                              <button
                                className="secondary-button"
                                type="button"
                                onClick={resetTaskForm}
                              >
                                Cancel
                              </button>
                              <button
                                className="danger-button"
                                type="button"
                                onClick={async () => {
                                  try {
                                    await removeTask(task.id)
                                    setTaskStatus('Task deleted.')
                                    resetTaskForm()
                                  } catch (error) {
                                    console.error('Failed to delete task.', error)
                                    setTaskStatus(error.message || 'Failed to delete task.')
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="manager-task-card__actions">
                            <span className="manager-task-card__meta">order {task.sort_order}</span>
                            <button
                              className="secondary-button"
                              type="button"
                              onClick={() => startTaskEdit(task)}
                            >
                              Edit
                            </button>
                            <button
                              className="danger-button"
                              type="button"
                              onClick={async () => {
                                try {
                                  await removeTask(task.id)
                                  setTaskStatus('Task deleted.')
                                } catch (error) {
                                  console.error('Failed to delete task.', error)
                                  setTaskStatus(error.message || 'Failed to delete task.')
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
