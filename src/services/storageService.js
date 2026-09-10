const STORAGE_KEY = 'victoria-shift-board-cache'
const CURRENT_EMPLOYEE_KEY = 'victoria-shift-current-employee-id'

export function loadCachedBoard() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveCachedBoard(board) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
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

export function loadBoardSelection() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(BOARD_SELECTION_KEY)
    const saved = raw ? JSON.parse(raw) : loadCachedBoard()
    return saved?.selectedDepartmentId ? {
      selectedDepartmentId: saved.selectedDepartmentId,
      selectedProtocolId: saved.selectedProtocolId ?? '',
    } : null
  } catch {
    return null
  }
}

export function saveBoardSelection(selection) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BOARD_SELECTION_KEY, JSON.stringify(selection))
}
