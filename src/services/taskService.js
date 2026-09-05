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

export async function createTask(payload) {
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

export async function updateTask(taskId, payload) {
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

export async function deleteTask(taskId) {
  const supabase = requireSupabase()
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)

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
