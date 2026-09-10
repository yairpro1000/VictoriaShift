const STORAGE_KEY = 'victoria-shift-board-cache'
const CURRENT_EMPLOYEE_KEY = 'victoria-shift-current-employee-id'

export function loadCachedBoard(scope = 'public') {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(scope === 'public' ? STORAGE_KEY : `${STORAGE_KEY}:${scope}`)

  if (!raw) {
    return null
  }

  try {
    const board = JSON.parse(raw)
    const expectedOwner = scope === 'public' ? null : scope
    if (board?.departments?.some((department) => (department.user_id ?? null) !== expectedOwner)) return null
    return board
  } catch {
    return null
  }
}

export function saveCachedBoard(board, scope = 'public') {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(scope === 'public' ? STORAGE_KEY : `${STORAGE_KEY}:${scope}`, JSON.stringify(board))
}

export function loadCurrentEmployeeId() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(CURRENT_EMPLOYEE_KEY) ?? ''
}

export function saveCurrentEmployeeId(employeeId) {
  if (typeof window === 'undefined') {
    return
  }

  if (!employeeId) {
    window.localStorage.removeItem(CURRENT_EMPLOYEE_KEY)
    return
  }

  window.localStorage.setItem(CURRENT_EMPLOYEE_KEY, employeeId)
}

const BOARD_SELECTION_KEY = 'victoria-shift-board-selection'

export function loadBoardSelection(scope = 'public') {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(scope === 'public' ? BOARD_SELECTION_KEY : `${BOARD_SELECTION_KEY}:${scope}`)
    const saved = raw ? JSON.parse(raw) : loadCachedBoard(scope)
    return saved?.selectedDepartmentId ? {
      selectedDepartmentId: saved.selectedDepartmentId,
      selectedProtocolId: saved.selectedProtocolId ?? '',
    } : null
  } catch {
    return null
  }
}

export function saveBoardSelection(selection, scope = 'public') {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(scope === 'public' ? BOARD_SELECTION_KEY : `${BOARD_SELECTION_KEY}:${scope}`, JSON.stringify(selection))
}
