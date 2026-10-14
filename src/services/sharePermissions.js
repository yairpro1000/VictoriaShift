export function protocolChoices(protocols, choices = {}) {
  return protocols.map(({ id }) => ({ protocol_id: id, ...(choices[id] ?? { can_view: true, can_edit: true }) }))
}

export function changePermission(rows, protocolId, permission, checked) {
  return Object.fromEntries(rows.map(row => {
    const next = { can_view: row.can_view, can_edit: row.can_edit }
    if (protocolId === null || row.protocol_id === protocolId) {
      next[permission] = checked
      if (permission === 'can_edit' && checked) next.can_view = true
      if (permission === 'can_view' && !checked) next.can_edit = false
    }
    return [row.protocol_id, next]
  }))
}

export function accessProtocols(access) {
  if (Array.isArray(access?.protocols)) return access.protocols
  // Compatibility with the preceding single-protocol API during rollout.
  return access?.protocol_id ? [{ protocol_id: access.protocol_id, can_view: true, can_edit: true }] : []
}

export function mayEditProtocol(access, protocolId) {
  return !access || accessProtocols(access).some(row => row.protocol_id === protocolId && row.can_view && row.can_edit)
}
