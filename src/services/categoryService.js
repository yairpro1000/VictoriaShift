import { requireSupabase } from './supabaseClient'

export async function fetchCategories() {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('protocol_id', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createCategory(payload) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateCategory(categoryId, payload) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', categoryId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteCategory(categoryId) {
  const supabase = requireSupabase()
  const { error } = await supabase.from('categories').delete().eq('id', categoryId)

  if (error) {
    throw error
  }
}
