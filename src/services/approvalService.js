import { requireSupabase } from './supabaseClient'

const APPROVALS_TABLE = 'shift_approvals'

export async function createApprovalRecord({ employeeId, departmentId, protocolId, approvedAt, taskSnapshots }) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from(APPROVALS_TABLE)
    .insert({
      employee_id: employeeId,
      department_id: departmentId,
      protocol_id: protocolId,
      approved_at: approvedAt,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  if (taskSnapshots.length === 0) {
    return data
  }

  const { error: snapshotError } = await supabase
    .from('shift_approval_tasks')
    .insert(
      taskSnapshots.map((task) => ({
        approval_id: data.id,
        task_id: task.id,
        category_id: task.category_id,
        category_name: task.category_name,
        category_color: task.category_color,
        task_name: task.name,
        task_action: task.action,
        sort_order: task.sort_order,
        completed_by: task.completed_by,
        completed_by_first_name: task.completed_by_first_name,
        completed_by_last_name: task.completed_by_last_name,
        completed_at: task.completed_at,
      })),
    )

  if (snapshotError) {
    throw snapshotError
  }

  return data
}

export async function fetchApprovalHistory({ fromDate, toDate, departmentId, protocolId }) {
  const supabase = requireSupabase()
  const toDateEnd = new Date(`${toDate}T23:59:59.999`).toISOString()
  let query = supabase
    .from(APPROVALS_TABLE)
    .select(`
      id,
      approved_at,
      employee:employees!shift_approvals_employee_id_fkey(id, first_name, last_name),
      department:departments!shift_approvals_department_id_fkey(id, name),
      protocol:protocols!shift_approvals_protocol_id_fkey(id, name),
      tasks:shift_approval_tasks(
        id,
        task_id,
        category_id,
        category_name,
        category_color,
        task_name,
        task_action,
        sort_order,
        completed_by,
        completed_by_first_name,
        completed_by_last_name,
        completed_at
      )
    `)
    .gte('approved_at', `${fromDate}T00:00:00.000`)
    .lte('approved_at', toDateEnd)
    .order('approved_at', { ascending: false })

  if (departmentId) {
    query = query.eq('department_id', departmentId)
  }

  if (protocolId) {
    query = query.eq('protocol_id', protocolId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data ?? []
}
