import { requireSupabase } from './supabaseClient'

export async function fetchTasks() {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('tasks')
    .select('*, completed_by_employee:employees!tasks_completed_by_fkey(id, first_name, last_name, active)')
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function updateTaskDoneState(taskId, done, completedAt, completedBy) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('tasks')
    .update({
      done,
      completed_at: completedAt,
      completed_by: completedBy,
    })
    .eq('id', taskId)
    .select('*, completed_by_employee:employees!tasks_completed_by_fkey(id, first_name, last_name, active)')
    .single()

  if (error) {
    throw error
  }

  return data
}

async function createTaskRequest(payload) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

async function updateTaskRequest(taskId, payload) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

async function deleteTaskRequest(taskId) {
  const supabase = requireSupabase()
  const { error } = await supabase.from('tasks').delete().eq('id', taskId).select('id').single()

  if (error) {
    throw error
  }
}

export async function resetAllTasksDoneState(categoryIds) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('tasks')
    .update({
      done: false,
      completed_at: null,
      completed_by: null,
    })
    .in('category_id', categoryIds)
    .select('*, completed_by_employee:employees!tasks_completed_by_fkey(id, first_name, last_name, active)')

  if (error) {
    throw error
  }

  return data ?? []
}

export function subscribeToTaskChanges({
  onCategoryChange,
  onTaskChange,
  onEmployeeChange,
  onDepartmentChange,
  onProtocolChange,
}) {
  const supabase = requireSupabase()

  return supabase
    .channel('victoria-shift-live-data')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories' },
      onCategoryChange,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks' },
      onTaskChange,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'employees' },
      onEmployeeChange,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'departments' },
      onDepartmentChange,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'protocols' },
      onProtocolChange,
    )
    .subscribe()
}

async function taskMutation(operation, request, args) {
  console.info('task_mutation_attempt', { operation, taskId: typeof args[0] === 'string' ? args[0] : null })
  try {
    const data = await request(...args)
    console.info('task_mutation_succeeded', { operation, taskId: data?.id ?? args[0]?.id ?? null })
    return data
  } catch (error) {
    console.error('task_mutation_failed', { operation, reason: error.message, code: error.code ?? null, details: error.details ?? null })
    throw new Error(error.code === '42501' || error.code === 'PGRST116'
      ? 'This task is unavailable or your session does not have permission to change it.'
      : error.message)
  }
}
export const createTask = (...args) => taskMutation('create', createTaskRequest, args)
export const updateTask = (...args) => taskMutation('update', updateTaskRequest, args)
export const deleteTask = (...args) => taskMutation('delete', deleteTaskRequest, args)
