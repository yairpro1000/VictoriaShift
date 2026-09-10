export function resolveBoardSelection(departments, protocols, saved) {
  const department = departments.find((row) => row.id === saved?.selectedDepartmentId)
    ?? departments.find((row) => row.name === 'Pasta & More')
    ?? departments[0]
  const available = protocols.filter((row) => row.department_id === department?.id && row.active)
  const protocol = available.find((row) => row.id === saved?.selectedProtocolId)
    ?? available.find((row) => row.name === 'Shift Teardown')
    ?? available[0]
  return {
    selectedDepartmentId: department?.id ?? '',
    selectedProtocolId: protocol?.id ?? '',
  }
}

export function categoriesForSelection(categories, protocols, departmentId, protocolId) {
  const validProtocol = protocols.some(
    (row) => row.id === protocolId && row.department_id === departmentId && row.active,
  )
  return validProtocol ? categories.filter((row) => row.protocol_id === protocolId) : []
}
