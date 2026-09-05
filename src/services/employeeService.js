import { requireSupabase } from './supabaseClient'

export async function fetchEmployees() {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('first_name', { ascending: true })
    .order('last_name', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createEmployee(payload) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('employees')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateEmployee(employeeId, payload) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('employees')
    .update(payload)
    .eq('id', employeeId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteEmployee(employeeId) {
  const supabase = requireSupabase()
  const { error } = await supabase.from('employees').delete().eq('id', employeeId)

  if (error) {
    throw error
  }
}
