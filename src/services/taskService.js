import { requireSupabase } from './supabaseClient'

export async function fetchTasks() {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function updateTaskDoneState(taskId, done, completedAt) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('tasks')
    .update({
      done,
      completed_at: completedAt,
    })
    .eq('id', taskId)
    .select()
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

export function subscribeToTaskChanges({ onCategoryChange, onTaskChange }) {
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
    .subscribe()
}
