import { requireSupabase } from './supabaseClient'

const APPROVALS_TABLE = 'shift_approvals'

export async function createApprovalRecord(employeeId, approvedAt) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from(APPROVALS_TABLE)
    .insert({
      employee_id: employeeId,
      approved_at: approvedAt,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
