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

export async function createProtocol(draft) {
  const payload = {
    department_id: draft.department_id,
    name: draft.name?.trim() ?? '',
    active: true,
  }
  console.info('protocol_create_attempt', {
    departmentId: payload.department_id || null,
    hasName: Boolean(payload.name),
  })

  try {
    if (!payload.department_id || !payload.name) {
      console.info('protocol_create_blocked', { reason: 'missing_department_or_name' })
      throw new Error('Choose a department and enter a protocol name.')
    }

    const supabase = requireSupabase()
    console.info('protocol_create_insert', { departmentId: payload.department_id, active: payload.active })
    const { data, error } = await supabase.from('protocols').insert(payload).select('*').single()
    if (error) throw error

    console.info('protocol_create_succeeded', { protocolId: data.id, departmentId: data.department_id })
    return data
  } catch (error) {
    console.error('protocol_create_failed', {
      departmentId: payload.department_id || null,
      reason: error.message,
      code: error.code ?? null,
      details: error.details ?? null,
      hint: error.hint ?? null,
    })
    if (error.code === '23505') {
      throw new Error('A protocol with this name already exists in this department.')
    }
    if (error.code === '42501') {
      throw new Error('Protocol creation was denied by the database permissions for this session.')
    }
    throw error
  }
}

async function mutateNamedEntity(table, operation, id, draft) {
  const context = { table, operation, id: id ?? null }
  console.info('entity_mutation_attempt', context)
  try {
    const payload = { name: draft?.name?.trim() ?? '' }
    if (operation !== 'delete' && !payload.name) {
      console.info('entity_mutation_blocked', { ...context, reason: 'missing_name' })
      throw new Error('Enter a name.')
    }
    const supabase = requireSupabase()
    if (table === 'departments' && operation === 'delete') {
      console.info('entity_delete_dependency_check', { ...context, dependency: 'protocols' })
      const { data, error } = await supabase.from('protocols').select('id').eq('department_id', id).limit(1)
      if (error) throw error
      console.info('entity_delete_dependency_result', { ...context, hasProtocols: Boolean(data?.length) })
      if (data?.length) {
        throw new Error('Delete the protocols in this department before deleting the department.')
      }
    }
    console.info('entity_mutation_execute', context)
    const query = operation === 'create'
      ? supabase.from(table).insert(payload)
      : operation === 'update'
        ? supabase.from(table).update(payload).eq('id', id)
        : supabase.from(table).delete().eq('id', id)
    const { data, error } = await query.select('*').single()
    if (error) throw error
    console.info('entity_mutation_succeeded', { ...context, id: data.id })
    return data
  } catch (error) {
    console.error('entity_mutation_failed', {
      ...context, reason: error.message, code: error.code ?? null,
      details: error.details ?? null, hint: error.hint ?? null,
    })
    if (error.code === '23505') throw new Error('This name already exists. Choose another name.')
    if (error.code === '23503') throw new Error('This item is still used by categories or approval history and cannot be deleted.')
    if (error.code === '42501') throw new Error('The database permissions for this session denied this change.')
    if (error.code === 'PGRST116') throw new Error('This item is no longer available or this session does not have permission to change it. Refresh and try again.')
    throw error
  }
}

export const createDepartment = (draft) => mutateNamedEntity('departments', 'create', null, draft)
export const updateDepartment = (id, draft) => mutateNamedEntity('departments', 'update', id, draft)
export const deleteDepartment = (id) => mutateNamedEntity('departments', 'delete', id)
export const updateProtocol = (id, draft) => mutateNamedEntity('protocols', 'update', id, draft)
export const deleteProtocol = (id) => mutateNamedEntity('protocols', 'delete', id)
