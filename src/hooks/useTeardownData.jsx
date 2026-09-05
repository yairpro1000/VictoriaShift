import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'
import { createEmployee, deleteEmployee, fetchEmployees, updateEmployee } from '../services/employeeService'
import { createApprovalRecord } from '../services/approvalService'
import {
  createTask,
  deleteTask,
  fetchTasks,
  resetAllTasksDoneState,
  subscribeToTaskChanges,
  updateTask,
  updateTaskDoneState,
} from '../services/taskService'
import {
  loadCachedBoard,
  loadCurrentEmployeeId,
  saveCachedBoard,
  saveCurrentEmployeeId,
} from '../services/storageService'
import { supabase } from '../services/supabaseClient'

const TeardownDataContext = createContext(null)

function sortCategories(categories) {
  return [...categories].sort((left, right) => left.sort_order - right.sort_order)
}

function sortTasks(tasks) {
  return [...tasks].sort((left, right) => {
    if (left.category_id !== right.category_id) {
      return left.category_id.localeCompare(right.category_id)
    }

    return left.sort_order - right.sort_order
  })
}

function sortEmployees(employees) {
  return [...employees].sort((left, right) => {
    const firstNameCompare = left.first_name.localeCompare(right.first_name)

    if (firstNameCompare !== 0) {
      return firstNameCompare
    }

    return left.last_name.localeCompare(right.last_name)
  })
}

function attachEmployee(task, employeesById) {
  return {
    ...task,
    completed_by_employee:
      task.completed_by_employee ?? employeesById.get(task.completed_by) ?? null,
  }
}

function buildTasksByStatus(categories, tasks, employees) {
  const employeesById = new Map(employees.map((employee) => [employee.id, employee]))

  const todoCategories = []
  const doneCategories = []

  sortCategories(categories).forEach((category) => {
    const categoryTasks = tasks
      .filter((task) => task.category_id === category.id)
      .map((task) => attachEmployee(task, employeesById))
      .sort((left, right) => left.sort_order - right.sort_order)

    const todoTasks = categoryTasks.filter((task) => !task.done)
    const doneTasks = categoryTasks
      .filter((task) => task.done)
      .sort(
        (left, right) =>
          new Date(right.completed_at ?? 0).getTime() -
          new Date(left.completed_at ?? 0).getTime(),
      )

    if (todoTasks.length > 0) {
      todoCategories.push({ category, tasks: todoTasks })
    }

    if (doneTasks.length > 0) {
      doneCategories.push({ category, tasks: doneTasks })
    }
  })

  doneCategories.sort((left, right) => {
    const leftLatest = new Date(left.tasks[0]?.completed_at ?? 0).getTime()
    const rightLatest = new Date(right.tasks[0]?.completed_at ?? 0).getTime()
    return rightLatest - leftLatest
  })

  return {
    todo: {
      categories: todoCategories,
      totalCount: tasks.filter((task) => !task.done).length,
    },
    done: {
      categories: doneCategories,
      totalCount: tasks.filter((task) => task.done).length,
    },
  }
}

function upsertRow(rows, row) {
  const existingIndex = rows.findIndex((item) => item.id === row.id)

  if (existingIndex === -1) {
    return [...rows, row]
  }

  const nextRows = [...rows]
  nextRows[existingIndex] = row
  return nextRows
}

export function TeardownDataProvider({ children }) {
  const cachedBoard = loadCachedBoard()
  const [categories, setCategories] = useState(cachedBoard?.categories ?? [])
  const [tasks, setTasks] = useState(cachedBoard?.tasks ?? [])
  const [employees, setEmployees] = useState(cachedBoard?.employees ?? [])
  const [currentEmployeeId, setCurrentEmployeeId] = useState(loadCurrentEmployeeId())
  const [loading, setLoading] = useState(!cachedBoard)
  const [errorMessage, setErrorMessage] = useState('')
  const [syncMessage, setSyncMessage] = useState('')
  const [approvalMessage, setApprovalMessage] = useState('')
  const [isApprovalOpen, setIsApprovalOpen] = useState(false)
  const [approvalStep, setApprovalStep] = useState('form')
  const [approvalError, setApprovalError] = useState('')
  const [isApprovalSaving, setIsApprovalSaving] = useState(false)
  const [isBoardResetting, setIsBoardResetting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadBoard() {
      setLoading(true)
      setErrorMessage('')

      try {
        const [fetchedCategories, fetchedTasks, fetchedEmployees] = await Promise.all([
          fetchCategories(),
          fetchTasks(),
          fetchEmployees(),
        ])

        if (!isMounted) {
          return
        }

        const nextCategories = sortCategories(fetchedCategories)
        const nextTasks = sortTasks(fetchedTasks)
        const nextEmployees = sortEmployees(fetchedEmployees)

        setCategories(nextCategories)
        setTasks(nextTasks)
        setEmployees(nextEmployees)
        saveCachedBoard({ categories: nextCategories, tasks: nextTasks, employees: nextEmployees })
      } catch (error) {
        console.error('Failed to load teardown board from Supabase.', error)

        if (!isMounted) {
          return
        }

        setErrorMessage('Using cached data. Live sync is currently unavailable.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadBoard()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    saveCachedBoard({ categories, tasks, employees })
  }, [categories, tasks, employees])

  useEffect(() => {
    const activeEmployees = employees.filter((employee) => employee.active)

    if (activeEmployees.some((employee) => employee.id === currentEmployeeId)) {
      saveCurrentEmployeeId(currentEmployeeId)
      return
    }

    const nextEmployeeId = activeEmployees[0]?.id ?? ''
    setCurrentEmployeeId(nextEmployeeId)
    saveCurrentEmployeeId(nextEmployeeId)
  }, [currentEmployeeId, employees])

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    const channel = subscribeToTaskChanges({
      onCategoryChange(payload) {
        const row = payload.new ?? payload.old

        if (payload.eventType === 'DELETE') {
          setCategories((current) => current.filter((item) => item.id !== row.id))
          return
        }

        setCategories((current) => sortCategories(upsertRow(current, row)))
      },
      onTaskChange(payload) {
        const row = payload.new ?? payload.old

        if (payload.eventType === 'DELETE') {
          setTasks((current) => current.filter((item) => item.id !== row.id))
          return
        }

        setTasks((current) => sortTasks(upsertRow(current, row)))
      },
      onEmployeeChange(payload) {
        const row = payload.new ?? payload.old

        if (payload.eventType === 'DELETE') {
          setEmployees((current) => current.filter((item) => item.id !== row.id))
          return
        }

        setEmployees((current) => sortEmployees(upsertRow(current, row)))
      },
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const tasksByStatus = useMemo(
    () => buildTasksByStatus(categories, tasks, employees),
    [categories, employees, tasks],
  )

  const areAllTasksDone = tasks.length > 0 && tasks.every((task) => task.done)

  const setTaskDone = async (taskId, done) => {
    const completedAt = done ? new Date().toISOString() : null
    const completedBy = done ? currentEmployeeId : null
    const completedByEmployee =
      employees.find((employee) => employee.id === completedBy) ?? null

    if (done && !completedBy) {
      console.info('task_done_blocked', {
        taskId,
        reason: 'missing_current_employee',
        activeEmployees: employees.filter((employee) => employee.active).length,
      })
      setSyncMessage('Choose a current employee before marking tasks done.')
      return
    }

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              done,
              completed_at: completedAt,
              completed_by: completedBy,
              completed_by_employee: completedByEmployee,
            }
          : task,
      ),
    )
    setApprovalMessage('')
    setIsApprovalOpen(false)
    setApprovalStep('form')
    setApprovalError('')
    setSyncMessage('')

    try {
      const updatedTask = await updateTaskDoneState(taskId, done, completedAt, completedBy)
      setTasks((current) => sortTasks(upsertRow(current, updatedTask)))
    } catch (error) {
      console.error('Failed to sync task state to Supabase.', {
        taskId,
        done,
        completedBy,
        error,
      })
      setSyncMessage('Last change is pending sync.')
    }
  }

  const toggleTask = async (taskId) => {
    const currentTask = tasks.find((task) => task.id === taskId)

    if (!currentTask) {
      return
    }

    await setTaskDone(taskId, !currentTask.done)
  }

  const approveShift = () => {
    if (!areAllTasksDone) {
      console.info('approve_shift_blocked', {
        reason: 'not_all_tasks_done',
        totalTasks: tasks.length,
        remainingTasks: tasks.filter((task) => !task.done).length,
      })
      return
    }

    console.info('approve_shift_opened', {
      totalTasks: tasks.length,
      doneTasks: tasks.filter((task) => task.done).length,
    })
    setApprovalMessage('Good, papi, good!')
    setApprovalStep('form')
    setApprovalError('')
    setIsApprovalOpen(true)
  }

  const dismissApproval = () => {
    if (isApprovalSaving || isBoardResetting) {
      return
    }

    setIsApprovalOpen(false)
    setApprovalStep('form')
    setApprovalError('')
  }

  const submitApproval = async (employeeId) => {
    const selectedEmployee = employees.find((employee) => employee.id === employeeId) ?? null

    console.info('approval_submit_attempt', {
      employeeId: employeeId || null,
      employeeFound: Boolean(selectedEmployee),
      totalTasks: tasks.length,
      allTasksDone: areAllTasksDone,
    })

    if (!employeeId || !selectedEmployee) {
      setApprovalError('Choose an employee before approving.')
      console.info('approval_submit_blocked', {
        reason: 'missing_employee',
        employeeId: employeeId || null,
      })
      return false
    }

    if (!areAllTasksDone) {
      setApprovalError('All tasks must be done before approval.')
      console.info('approval_submit_blocked', {
        reason: 'tasks_not_done',
        remainingTasks: tasks.filter((task) => !task.done).length,
      })
      return false
    }

    const approvedAt = new Date().toISOString()
    setIsApprovalSaving(true)
    setApprovalError('')

    try {
      await createApprovalRecord(employeeId, approvedAt)
      console.info('approval_submit_succeeded', {
        employeeId,
        approvedAt,
      })
      setApprovalStep('celebration')
      return true
    } catch (error) {
      const reason = error?.message || 'Approval could not be saved.'
      console.error('approval_submit_failed', {
        employeeId,
        approvedAt,
        reason,
        code: error?.code ?? null,
        details: error?.details ?? null,
        hint: error?.hint ?? null,
      })
      setApprovalError(
        'Approval could not be saved. Confirm the `shift_approvals.employee_id` column and insert policy are set up in Supabase, then try again.',
      )
      return false
    } finally {
      setIsApprovalSaving(false)
    }
  }

  const resetBoard = async () => {
    console.info('reset_board_attempt', {
      totalTasks: tasks.length,
      doneTasks: tasks.filter((task) => task.done).length,
    })

    setIsBoardResetting(true)
    setSyncMessage('')

    try {
      const resetTasks = await resetAllTasksDoneState()
      setTasks(sortTasks(resetTasks))
      console.info('reset_board_succeeded', {
        updatedTasks: resetTasks.length,
      })
      setIsApprovalOpen(false)
      setApprovalStep('form')
      setApprovalError('')
    } catch (error) {
      const reason = error?.message || 'Board reset failed.'
      console.error('reset_board_failed', {
        reason,
        code: error?.code ?? null,
        details: error?.details ?? null,
        hint: error?.hint ?? null,
      })
      setApprovalError('Board reset failed. Please try again.')
    } finally {
      setIsBoardResetting(false)
    }
  }

  const saveCategory = async (draft, categoryId) => {
    const payload = {
      name: draft.name.trim(),
      color: draft.color.trim(),
      sort_order: Number(draft.sort_order),
    }

    const savedCategory = categoryId
      ? await updateCategory(categoryId, payload)
      : await createCategory(payload)

    setCategories((current) => sortCategories(upsertRow(current, savedCategory)))
    return savedCategory
  }

  const removeCategory = async (categoryId) => {
    if (tasks.some((task) => task.category_id === categoryId)) {
      throw new Error('Delete the tasks in this category before removing it.')
    }

    await deleteCategory(categoryId)
    setCategories((current) => current.filter((category) => category.id !== categoryId))
  }

  const saveTask = async (draft, taskId) => {
    const payload = {
      category_id: draft.category_id,
      name: draft.name.trim(),
      action: draft.action.trim() || null,
      sort_order: Number(draft.sort_order),
      done: Boolean(draft.done),
      completed_at: draft.done ? draft.completed_at ?? new Date().toISOString() : null,
      completed_by: draft.done ? draft.completed_by ?? null : null,
    }

    const savedTask = taskId
      ? await updateTask(taskId, payload)
      : await createTask(payload)

    setTasks((current) => sortTasks(upsertRow(current, savedTask)))
    return savedTask
  }

  const removeTask = async (taskId) => {
    await deleteTask(taskId)
    setTasks((current) => current.filter((task) => task.id !== taskId))
  }

  const selectCurrentEmployee = (employeeId) => {
    setCurrentEmployeeId(employeeId)
    saveCurrentEmployeeId(employeeId)
  }

  const saveEmployee = async (draft, employeeId) => {
    const payload = {
      first_name: draft.first_name.trim(),
      last_name: draft.last_name.trim(),
      active: Boolean(draft.active),
    }

    const savedEmployee = employeeId
      ? await updateEmployee(employeeId, payload)
      : await createEmployee(payload)

    setEmployees((current) => sortEmployees(upsertRow(current, savedEmployee)))
    return savedEmployee
  }

  const removeEmployee = async (employeeId) => {
    await deleteEmployee(employeeId)
    setEmployees((current) => current.filter((employee) => employee.id !== employeeId))

    if (currentEmployeeId === employeeId) {
      selectCurrentEmployee('')
    }
  }

  const value = {
    categories,
    tasks,
    employees,
    currentEmployeeId,
    tasksByStatus,
    areAllTasksDone,
    loading,
    errorMessage,
    syncMessage,
    toggleTask,
    setTaskDone,
    approveShift,
    approvalMessage,
    isApprovalOpen,
    approvalStep,
    approvalError,
    isApprovalSaving,
    isBoardResetting,
    dismissApproval,
    submitApproval,
    resetBoard,
    selectCurrentEmployee,
    saveCategory,
    removeCategory,
    saveTask,
    removeTask,
    saveEmployee,
    removeEmployee,
  }

  return (
    <TeardownDataContext.Provider value={value}>
      {children}
    </TeardownDataContext.Provider>
  )
}

export function useTeardownData() {
  const context = useContext(TeardownDataContext)

  if (!context) {
    throw new Error('useTeardownData must be used within TeardownDataProvider')
  }

  return context
}
