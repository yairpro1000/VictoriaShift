import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'
import {
  createTask,
  deleteTask,
  fetchTasks,
  subscribeToTaskChanges,
  updateTask,
  updateTaskDoneState,
} from '../services/taskService'
import { loadCachedBoard, saveCachedBoard } from '../services/storageService'
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

function buildTasksByStatus(categories, tasks) {
  const todoCategories = []
  const doneCategories = []

  sortCategories(categories).forEach((category) => {
    const categoryTasks = tasks
      .filter((task) => task.category_id === category.id)
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
  const [loading, setLoading] = useState(!cachedBoard)
  const [errorMessage, setErrorMessage] = useState('')
  const [syncMessage, setSyncMessage] = useState('')
  const [approvalMessage, setApprovalMessage] = useState('')
  const [isApprovalOpen, setIsApprovalOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadBoard() {
      setLoading(true)
      setErrorMessage('')

      try {
        const [fetchedCategories, fetchedTasks] = await Promise.all([
          fetchCategories(),
          fetchTasks(),
        ])

        if (!isMounted) {
          return
        }

        const nextCategories = sortCategories(fetchedCategories)
        const nextTasks = sortTasks(fetchedTasks)

        setCategories(nextCategories)
        setTasks(nextTasks)
        saveCachedBoard({ categories: nextCategories, tasks: nextTasks })
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
    saveCachedBoard({ categories, tasks })
  }, [categories, tasks])

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
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const tasksByStatus = useMemo(
    () => buildTasksByStatus(categories, tasks),
    [categories, tasks],
  )

  const areAllTasksDone = tasks.length > 0 && tasks.every((task) => task.done)

  const setTaskDone = async (taskId, done) => {
    const completedAt = done ? new Date().toISOString() : null

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, done, completed_at: completedAt } : task,
      ),
    )
    setApprovalMessage('')
    setIsApprovalOpen(false)
    setSyncMessage('')

    try {
      const updatedTask = await updateTaskDoneState(taskId, done, completedAt)
      setTasks((current) => sortTasks(upsertRow(current, updatedTask)))
    } catch (error) {
      console.error('Failed to sync task state to Supabase.', {
        taskId,
        done,
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
      return
    }

    setApprovalMessage('Good, papi, good!')
    setIsApprovalOpen(true)
  }

  const dismissApproval = () => {
    setIsApprovalOpen(false)
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

  const value = {
    categories,
    tasks,
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
    dismissApproval,
    saveCategory,
    removeCategory,
    saveTask,
    removeTask,
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
