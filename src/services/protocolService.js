import { requireSupabase } from './supabaseClient'

export async function fetchDepartments() {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function fetchProtocols() {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('protocols')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}
