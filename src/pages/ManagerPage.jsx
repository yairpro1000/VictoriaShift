import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useTeardownData } from '../hooks/useTeardownData.jsx'
import { TaskCard } from '../components/TaskCard'

const EMPTY_CATEGORY = {
  name: '',
  color: '#ffd166',
  sort_order: '',
}

const EMPTY_TASK = {
  category_id: '',
  name: '',
  action: '',
  sort_order: '',
  done: false,
  completed_at: null,
  completed_by: null,
}

const EMPTY_EMPLOYEE = {
  first_name: '',
  last_name: '',
  active: true,
}

const MANAGER_PASSWORD = 'papi3823'
const MANAGER_SESSION_KEY = 'victoria-shift-manager-unlocked'
const EMPTY_DIALOG = {
  title: '',
  message: '',
  confirmLabel: '',
  tone: 'default',
  onConfirm: null,
}

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
    employees,
    tasks,
    loading,
    errorMessage,
    saveCategory,
    removeCategory,
    saveTask,
    removeTask,
    saveEmployee,
    removeEmployee,
  } = useTeardownData()
  const [employeeDraft, setEmployeeDraft] = useState(EMPTY_EMPLOYEE)
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)
  const [employeeStatus, setEmployeeStatus] = useState('')
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
  const [dialogState, setDialogState] = useState(EMPTY_DIALOG)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDialogBusy, setIsDialogBusy] = useState(false)

  const orderedCategories = useMemo(
    () => [...categories].sort((left, right) => left.sort_order - right.sort_order),
    [categories],
  )

  const groupedTasks = useMemo(
    () => groupTasksByCategory(orderedCategories, tasks),
    [orderedCategories, tasks],
  )

  const orderedEmployees = useMemo(
    () =>
      [...employees].sort((left, right) => {
        const firstNameCompare = left.first_name.localeCompare(right.first_name)

        if (firstNameCompare !== 0) {
          return firstNameCompare
        }

        return left.last_name.localeCompare(right.last_name)
      }),
    [employees],
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

  const resetEmployeeForm = () => {
    setEmployeeDraft(EMPTY_EMPLOYEE)
    setEditingEmployeeId(null)
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

  const closeDialog = () => {
    if (isDialogBusy) {
      return
    }

    setIsDialogOpen(false)
    setDialogState(EMPTY_DIALOG)
  }

  const openNoticeDialog = ({ title, message, tone = 'default' }) => {
    setDialogState({
      title,
      message,
      confirmLabel: '',
      tone,
      onConfirm: null,
    })
    setIsDialogBusy(false)
    setIsDialogOpen(true)
  }

  const openConfirmDialog = ({ title, message, confirmLabel, tone = 'danger', onConfirm }) => {
    setDialogState({
      title,
      message,
      confirmLabel,
      tone,
      onConfirm,
    })
    setIsDialogBusy(false)
    setIsDialogOpen(true)
  }

  const handleDialogConfirm = async () => {
    if (!dialogState.onConfirm) {
      closeDialog()
      return
    }

    setIsDialogBusy(true)

    try {
      await dialogState.onConfirm()
      setIsDialogOpen(false)
      setDialogState(EMPTY_DIALOG)
    } finally {
      setIsDialogBusy(false)
    }
  }

  const submitCategoryDraft = async (categoryId = null) => {
    if (!categoryDraft.name.trim() || Number.isNaN(Number(categoryDraft.sort_order))) {
      setCategoryStatus('Category name and numeric order are required.')
      return false
    }

    try {
      await saveCategory(categoryDraft, categoryId)
      setCategoryStatus(categoryId ? 'Category updated.' : 'Category created.')
      resetCategoryForm()
      return true
    } catch (error) {
      console.error('Failed to save category.', error)
      setCategoryStatus(error.message || 'Failed to save category.')
      return false
    }
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()
    await submitCategoryDraft()
  }

  const submitEmployeeDraft = async (employeeId = null) => {
    if (!employeeDraft.first_name.trim() || !employeeDraft.last_name.trim()) {
      setEmployeeStatus('First and last name are required.')
      return false
    }

    try {
      await saveEmployee(employeeDraft, employeeId)
      setEmployeeStatus(employeeId ? 'Employee updated.' : 'Employee created.')
      resetEmployeeForm()
      return true
    } catch (error) {
      console.error('Failed to save employee.', error)
      setEmployeeStatus(error.message || 'Failed to save employee.')
      return false
    }
  }

  const handleEmployeeSubmit = async (event) => {
    event.preventDefault()
    await submitEmployeeDraft()
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
      completed_by: task.completed_by,
    })
  }

  const startEmployeeEdit = (employee) => {
    setEditingEmployeeId(employee.id)
    setEmployeeDraft({
      first_name: employee.first_name,
      last_name: employee.last_name,
      active: employee.active,
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

  const startCategoryEdit = (category) => {
    setEditingCategoryId(category.id)
    setCategoryDraft({
      name: category.name,
      color: category.color,
      sort_order: String(category.sort_order),
    })
  }

  const confirmDeleteCategory = (category) => {
    const taskCount = tasks.filter((task) => task.category_id === category.id).length

    if (taskCount > 0) {
      openNoticeDialog({
        title: 'Category still has tasks',
        message: `"${category.name}" still has ${taskCount} task${taskCount === 1 ? '' : 's'}. Delete those tasks first or move them to another category, then try again.`,
        tone: 'warning',
      })
      return
    }

    openConfirmDialog({
      title: 'Delete category?',
      message: `Are you sure you want to delete category "${category.name}"?`,
      confirmLabel: 'Delete category',
      onConfirm: async () => {
        try {
          await removeCategory(category.id)
          setCategoryStatus('Category deleted.')
          if (editingCategoryId === category.id) {
            resetCategoryForm()
          }
        } catch (error) {
          openNoticeDialog({
            title: 'Category could not be deleted',
            message: error.message || 'Failed to delete category.',
            tone: 'warning',
          })
        }
      },
    })
  }

  const confirmDeleteTask = (task) => {
    openConfirmDialog({
      title: 'Delete task?',
      message: `Are you sure you want to delete task "${task.name}"?`,
      confirmLabel: 'Delete task',
      onConfirm: async () => {
        try {
          await removeTask(task.id)
          setTaskStatus('Task deleted.')
          if (editingTaskId === task.id) {
            resetTaskForm()
          }
        } catch (error) {
          console.error('Failed to delete task.', error)
          openNoticeDialog({
            title: 'Task could not be deleted',
            message: error.message || 'Failed to delete task.',
            tone: 'warning',
          })
        }
      },
    })
  }

  const confirmDeleteEmployee = (employee) => {
    openConfirmDialog({
      title: 'Delete employee?',
      message: `Are you sure you want to delete employee "${employee.first_name} ${employee.last_name}"? Existing completed tasks will keep their timestamp but lose the employee link.`,
      confirmLabel: 'Delete employee',
      onConfirm: async () => {
        try {
          await removeEmployee(employee.id)
          setEmployeeStatus('Employee deleted.')
          if (editingEmployeeId === employee.id) {
            resetEmployeeForm()
          }
        } catch (error) {
          console.error('Failed to delete employee.', error)
          openNoticeDialog({
            title: 'Employee could not be deleted',
            message: error.message || 'Failed to delete employee.',
            tone: 'warning',
          })
        }
      },
    })
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
            <h2>Employees</h2>
            <button className="secondary-button" type="button" onClick={resetEmployeeForm}>
              + Add employee
            </button>
          </div>

          {!editingEmployeeId ? (
            <form className="manager-form" onSubmit={handleEmployeeSubmit}>
              <label>
                First name
                <input
                  type="text"
                  value={employeeDraft.first_name}
                  onChange={(event) =>
                    setEmployeeDraft((current) => ({ ...current, first_name: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Last name
                <input
                  type="text"
                  value={employeeDraft.last_name}
                  onChange={(event) =>
                    setEmployeeDraft((current) => ({ ...current, last_name: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={employeeDraft.active}
                  onChange={(event) =>
                    setEmployeeDraft((current) => ({ ...current, active: event.target.checked }))
                  }
                />
                Active
              </label>
              <div className="manager-form__actions">
                <button className="primary-button" type="submit">
                  Create employee
                </button>
              </div>
              {employeeStatus ? <p className="manager-status">{employeeStatus}</p> : null}
            </form>
          ) : (
            employeeStatus ? <p className="manager-status">{employeeStatus}</p> : null
          )}

          <div className="manager-list">
            {orderedEmployees.map((employee) => (
              <article
                key={employee.id}
                className={`manager-item${editingEmployeeId === employee.id ? ' manager-item--editing' : ''}`}
              >
                <div>
                  <p className="manager-item__title">
                    {employee.first_name} {employee.last_name}
                  </p>
                  <p className="manager-item__meta">{employee.active ? 'Active' : 'Inactive'}</p>
                </div>

                {editingEmployeeId === employee.id ? (
                  <div className="manager-item__editor">
                    <label>
                      First name
                      <input
                        type="text"
                        value={employeeDraft.first_name}
                        onChange={(event) =>
                          setEmployeeDraft((current) => ({ ...current, first_name: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Last name
                      <input
                        type="text"
                        value={employeeDraft.last_name}
                        onChange={(event) =>
                          setEmployeeDraft((current) => ({ ...current, last_name: event.target.value }))
                        }
                      />
                    </label>
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={employeeDraft.active}
                        onChange={(event) =>
                          setEmployeeDraft((current) => ({ ...current, active: event.target.checked }))
                        }
                      />
                      Active
                    </label>
                    <div className="manager-item__actions">
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => submitEmployeeDraft(employee.id)}
                      >
                        Save employee
                      </button>
                      <button className="secondary-button" type="button" onClick={resetEmployeeForm}>
                        Cancel
                      </button>
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => confirmDeleteEmployee(employee)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="manager-item__actions">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => startEmployeeEdit(employee)}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => confirmDeleteEmployee(employee)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="manager-panel">
          <div className="manager-panel__header">
            <h2>Categories</h2>
            <button className="secondary-button" type="button" onClick={resetCategoryForm}>
              + Add category
            </button>
          </div>

          {!editingCategoryId ? (
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
              <div className="manager-form__actions">
                <button className="primary-button" type="submit">
                  Create category
                </button>
              </div>
              {categoryStatus ? <p className="manager-status">{categoryStatus}</p> : null}
            </form>
          ) : (
            categoryStatus ? <p className="manager-status">{categoryStatus}</p> : null
          )}

          <div className="manager-list">
            {orderedCategories.map((category) => (
              <article
                key={category.id}
                className={`manager-item${editingCategoryId === category.id ? ' manager-item--editing' : ''}`}
              >
                <div>
                  <p className="manager-item__title">{category.name}</p>
                  <p className="manager-item__meta">
                    <span
                      className="color-swatch"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.color} · order {category.sort_order}
                  </p>
                </div>

                {editingCategoryId === category.id ? (
                  <div className="manager-item__editor">
                    <label>
                      Name
                      <input
                        type="text"
                        value={categoryDraft.name}
                        onChange={(event) =>
                          setCategoryDraft((current) => ({ ...current, name: event.target.value }))
                        }
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
                      />
                    </label>
                    <div className="manager-item__actions">
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => submitCategoryDraft(category.id)}
                      >
                        Save category
                      </button>
                      <button className="secondary-button" type="button" onClick={resetCategoryForm}>
                        Cancel
                      </button>
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => confirmDeleteCategory(category)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="manager-item__actions">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => startCategoryEdit(category)}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => confirmDeleteCategory(category)}
                    >
                      Delete
                    </button>
                  </div>
                )}
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
                className="category-section"
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
                                onClick={() => confirmDeleteTask(task)}
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
                              onClick={() => confirmDeleteTask(task)}
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

      {isDialogOpen ? (
        <div className="manager-modal" role="dialog" aria-modal="true" aria-labelledby="manager-dialog-title">
          <div className={`manager-modal__card manager-modal__card--${dialogState.tone}`}>
            <h2 id="manager-dialog-title">{dialogState.title}</h2>
            <p>{dialogState.message}</p>
            <div className="manager-modal__actions">
              {dialogState.onConfirm ? (
                <>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={closeDialog}
                    disabled={isDialogBusy}
                  >
                    Cancel
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={handleDialogConfirm}
                    disabled={isDialogBusy}
                  >
                    {isDialogBusy ? 'Working…' : dialogState.confirmLabel}
                  </button>
                </>
              ) : (
                <button className="primary-button" type="button" onClick={closeDialog}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
