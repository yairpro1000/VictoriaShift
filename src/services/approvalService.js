import { requireSupabase } from './supabaseClient'

const APPROVALS_TABLE = 'shift_approvals'

export async function createApprovalRecord(name, approvedAt) {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from(APPROVALS_TABLE)
    .insert({
      name,
      approved_at: approvedAt,
    })

  if (error) {
    throw error
  }

  return {
    name,
    approved_at: approvedAt,
  }
}
