import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'
import { createApprovalRecord, fetchApprovalHistory } from '../services/approvalService'
import { createEmployee, deleteEmployee, fetchEmployees, updateEmployee } from '../services/employeeService'
import { fetchDepartments, fetchProtocols } from '../services/protocolService'
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

function sortByOrderThenName(rows) {
  return [...rows].sort((left, right) => {
    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order
    }

    return left.name.localeCompare(right.name)
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

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10)
}

function defaultHistoryFromDate() {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return toDateInputValue(date)
}

export function TeardownDataProvider({ children }) {
  const cachedBoard = loadCachedBoard()
  const [categories, setCategories] = useState(cachedBoard?.categories ?? [])
  const [tasks, setTasks] = useState(cachedBoard?.tasks ?? [])
  const [employees, setEmployees] = useState(cachedBoard?.employees ?? [])
  const [departments, setDepartments] = useState(cachedBoard?.departments ?? [])
  const [protocols, setProtocols] = useState(cachedBoard?.protocols ?? [])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(cachedBoard?.selectedDepartmentId ?? '')
  const [selectedProtocolId, setSelectedProtocolId] = useState(cachedBoard?.selectedProtocolId ?? '')
  const [currentEmployeeId, setCurrentEmployeeId] = useState(loadCurrentEmployeeId())
  const [historyFromDate, setHistoryFromDate] = useState(defaultHistoryFromDate)
  const [historyToDate, setHistoryToDate] = useState(() => toDateInputValue(new Date()))
  const [approvalHistory, setApprovalHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
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
        const [
          fetchedCategories,
          fetchedTasks,
          fetchedEmployees,
          fetchedDepartments,
          fetchedProtocols,
        ] = await Promise.all([
          fetchCategories(),
          fetchTasks(),
          fetchEmployees(),
          fetchDepartments(),
          fetchProtocols(),
        ])

        if (!isMounted) {
          return
        }

        const nextCategories = sortCategories(fetchedCategories)
        const nextTasks = sortTasks(fetchedTasks)
        const nextEmployees = sortEmployees(fetchedEmployees)
        const nextDepartments = sortByOrderThenName(fetchedDepartments)
        const nextProtocols = sortByOrderThenName(fetchedProtocols)
        const nextDepartmentId =
          selectedDepartmentId || nextDepartments[0]?.id || ''
        const nextProtocolId =
          selectedProtocolId ||
          nextProtocols.find((protocol) => protocol.department_id === nextDepartmentId && protocol.active)?.id ||
          ''

        setCategories(nextCategories)
        setTasks(nextTasks)
        setEmployees(nextEmployees)
        setDepartments(nextDepartments)
        setProtocols(nextProtocols)
        setSelectedDepartmentId(nextDepartmentId)
        setSelectedProtocolId(nextProtocolId)
        saveCachedBoard({
          categories: nextCategories,
          tasks: nextTasks,
          employees: nextEmployees,
          departments: nextDepartments,
          protocols: nextProtocols,
          selectedDepartmentId: nextDepartmentId,
          selectedProtocolId: nextProtocolId,
        })
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
    saveCachedBoard({
      categories,
      tasks,
      employees,
      departments,
      protocols,
      selectedDepartmentId,
      selectedProtocolId,
    })
  }, [categories, departments, employees, protocols, selectedDepartmentId, selectedProtocolId, tasks])

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
    if (
      selectedDepartmentId &&
      departments.some((department) => department.id === selectedDepartmentId)
    ) {
      return
    }

    setSelectedDepartmentId(departments[0]?.id ?? '')
  }, [departments, selectedDepartmentId])

  useEffect(() => {
    const departmentProtocols = protocols.filter(
      (protocol) => protocol.department_id === selectedDepartmentId && protocol.active,
    )

    if (
      selectedProtocolId &&
      departmentProtocols.some((protocol) => protocol.id === selectedProtocolId)
    ) {
      return
    }

    setSelectedProtocolId(departmentProtocols[0]?.id ?? '')
  }, [protocols, selectedDepartmentId, selectedProtocolId])

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
      onDepartmentChange(payload) {
        const row = payload.new ?? payload.old

        if (payload.eventType === 'DELETE') {
          setDepartments((current) => current.filter((item) => item.id !== row.id))
          return
        }

        setDepartments((current) => sortByOrderThenName(upsertRow(current, row)))
      },
      onProtocolChange(payload) {
        const row = payload.new ?? payload.old

        if (payload.eventType === 'DELETE') {
          setProtocols((current) => current.filter((item) => item.id !== row.id))
          return
        }

        setProtocols((current) => sortByOrderThenName(upsertRow(current, row)))
      },
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const selectedDepartment =
    departments.find((department) => department.id === selectedDepartmentId) ?? null
  const selectedProtocol =
    protocols.find((protocol) => protocol.id === selectedProtocolId) ?? null
  const departmentProtocols = useMemo(
    () => protocols.filter((protocol) => protocol.department_id === selectedDepartmentId && protocol.active),
    [protocols, selectedDepartmentId],
  )
  const currentCategories = useMemo(
    () => categories.filter((category) => !selectedProtocolId || category.protocol_id === selectedProtocolId),
    [categories, selectedProtocolId],
  )
  const currentCategoryIds = useMemo(
    () => new Set(currentCategories.map((category) => category.id)),
    [currentCategories],
  )
  const currentTasks = useMemo(
    () => tasks.filter((task) => currentCategoryIds.has(task.category_id)),
    [currentCategoryIds, tasks],
  )
  const tasksByStatus = useMemo(
    () => buildTasksByStatus(currentCategories, currentTasks, employees),
    [currentCategories, currentTasks, employees],
  )

  const areAllTasksDone = currentTasks.length > 0 && currentTasks.every((task) => task.done)

  const loadApprovalHistory = async () => {
    if (!selectedDepartmentId || !selectedProtocolId) {
      setApprovalHistory([])
      return
    }

    setHistoryLoading(true)
    setHistoryError('')

    try {
      const historyRows = await fetchApprovalHistory({
        fromDate: historyFromDate,
        toDate: historyToDate,
        departmentId: selectedDepartmentId,
        protocolId: selectedProtocolId,
      })
      setApprovalHistory(historyRows)
    } catch (error) {
      console.error('approval_history_load_failed', {
        reason: error?.message || 'Approval history could not be loaded.',
        code: error?.code ?? null,
        details: error?.details ?? null,
        hint: error?.hint ?? null,
        selectedDepartmentId,
        selectedProtocolId,
        historyFromDate,
        historyToDate,
      })
      setHistoryError('Approval history could not be loaded.')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadApprovalHistory()
  }, [selectedDepartmentId, selectedProtocolId, historyFromDate, historyToDate])

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
        departmentId: selectedDepartmentId || null,
        protocolId: selectedProtocolId || null,
        totalTasks: currentTasks.length,
        remainingTasks: currentTasks.filter((task) => !task.done).length,
      })
      return
    }

    console.info('approve_shift_opened', {
      departmentId: selectedDepartmentId || null,
      protocolId: selectedProtocolId || null,
      totalTasks: currentTasks.length,
      doneTasks: currentTasks.filter((task) => task.done).length,
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
      departmentId: selectedDepartmentId || null,
      protocolId: selectedProtocolId || null,
      totalTasks: currentTasks.length,
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

    if (!selectedDepartmentId || !selectedProtocolId) {
      setApprovalError('Choose a department and protocol before approving.')
      console.info('approval_submit_blocked', {
        reason: 'missing_department_or_protocol',
        selectedDepartmentId: selectedDepartmentId || null,
        selectedProtocolId: selectedProtocolId || null,
      })
      return false
    }

    if (!areAllTasksDone) {
      setApprovalError('All tasks must be done before approval.')
      console.info('approval_submit_blocked', {
        reason: 'tasks_not_done',
        remainingTasks: currentTasks.filter((task) => !task.done).length,
      })
      return false
    }

    const approvedAt = new Date().toISOString()
    const categoriesById = new Map(categories.map((category) => [category.id, category]))
    const employeesById = new Map(employees.map((employee) => [employee.id, employee]))
    const taskSnapshots = currentTasks.map((task) => {
      const category = categoriesById.get(task.category_id)
      const completedByEmployee = employeesById.get(task.completed_by)

      return {
        ...task,
        category_name: category?.name ?? 'Uncategorized',
        category_color: category?.color ?? '#ffd166',
        completed_by_first_name: completedByEmployee?.first_name ?? null,
        completed_by_last_name: completedByEmployee?.last_name ?? null,
      }
    })
    setIsApprovalSaving(true)
    setApprovalError('')

    try {
      await createApprovalRecord({
        employeeId,
        departmentId: selectedDepartmentId,
        protocolId: selectedProtocolId,
        approvedAt,
        taskSnapshots,
      })
      await loadApprovalHistory()
      console.info('approval_submit_succeeded', {
        employeeId,
        departmentId: selectedDepartmentId,
        protocolId: selectedProtocolId,
        approvedAt,
        snapshotTasks: taskSnapshots.length,
      })
      setApprovalStep('celebration')
      return true
    } catch (error) {
      const reason = error?.message || 'Approval could not be saved.'
      console.error('approval_submit_failed', {
        employeeId,
        departmentId: selectedDepartmentId || null,
        protocolId: selectedProtocolId || null,
        approvedAt,
        reason,
        code: error?.code ?? null,
        details: error?.details ?? null,
        hint: error?.hint ?? null,
      })
      setApprovalError(
        'Approval could not be saved. Confirm the approval history tables and insert policies are set up in Supabase, then try again.',
      )
      return false
    } finally {
      setIsApprovalSaving(false)
    }
  }

  const resetBoard = async () => {
    console.info('reset_board_attempt', {
      departmentId: selectedDepartmentId || null,
      protocolId: selectedProtocolId || null,
      totalTasks: currentTasks.length,
      doneTasks: currentTasks.filter((task) => task.done).length,
    })

    setIsBoardResetting(true)
    setSyncMessage('')

    try {
      const resetTasks = await resetAllTasksDoneState([...currentCategoryIds])
      const resetTasksById = new Map(resetTasks.map((task) => [task.id, task]))
      setTasks((current) =>
        sortTasks(current.map((task) => resetTasksById.get(task.id) ?? task)),
      )
      console.info('reset_board_succeeded', {
        protocolId: selectedProtocolId || null,
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
      protocol_id: draft.protocol_id || selectedProtocolId,
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
    currentCategories,
    currentEmployeeId,
    currentTasks,
    departmentProtocols,
    departments,
    employees,
    selectedDepartment,
    selectedDepartmentId,
    selectedProtocol,
    selectedProtocolId,
    protocols,
    tasks,
    tasksByStatus,
    approvalHistory,
    historyFromDate,
    historyToDate,
    historyLoading,
    historyError,
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
    setSelectedDepartmentId,
    setSelectedProtocolId,
    setHistoryFromDate,
    setHistoryToDate,
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
