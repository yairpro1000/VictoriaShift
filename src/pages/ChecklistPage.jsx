import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ApproveFooter } from '../components/ApproveFooter'
import { Board } from '../components/Board'
import { CelebrationModal } from '../components/CelebrationModal'
import { useTeardownData } from '../hooks/useTeardownData.jsx'

const todayLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}).format(new Date())

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatEmployeeName(employee) {
  if (!employee) {
    return 'Unknown'
  }

  return `${employee.first_name} ${employee.last_name}`
}

function formatCompactEmployeeName(employee) {
  if (!employee?.first_name) {
    return 'Unknown'
  }

  const lastInitial = employee.last_name ? `${employee.last_name.charAt(0)}.` : ''
  return [employee.first_name, lastInitial].filter(Boolean).join(' ')
}

function formatCompletedTime(completedAt) {
  if (!completedAt) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(completedAt))
}

function buildHistoryGroups(tasks) {
  const groupsByCategory = new Map()

  ;[...tasks]
    .sort((left, right) => left.sort_order - right.sort_order)
    .forEach((task) => {
      if (!groupsByCategory.has(task.category_id)) {
        groupsByCategory.set(task.category_id, {
          category: {
            id: task.category_id,
            name: task.category_name,
            color: task.category_color,
          },
          tasks: [],
        })
      }

      groupsByCategory.get(task.category_id).tasks.push({
        id: task.task_id,
        name: task.task_name,
        action: task.task_action,
        done: true,
        completed_at: task.completed_at,
        completed_by: task.completed_by,
        completed_by_employee: {
          id: task.completed_by,
          first_name: task.completed_by_first_name,
          last_name: task.completed_by_last_name,
        },
      })
    })

  return [...groupsByCategory.values()]
}

export function ChecklistPage() {
  const {
    approvalHistory,
    currentCategories,
    currentEmployeeId,
    departmentProtocols,
    departments,
    employees,
    historyError,
    historyFromDate,
    historyLoading,
    historyToDate,
    selectedDepartment,
    selectedDepartmentId,
    selectedProtocol,
    selectedProtocolId,
    tasksByStatus,
    toggleTask,
    setTaskDone,
    approveShift,
    approvalMessage,
    isApprovalOpen,
    approvalStep,
    approvalError,
    isApprovalSaving,
    isBoardResetting,
    dismissApproval,
    submitApproval,
    resetBoard,
    areAllTasksDone,
    loading,
    errorMessage,
    syncMessage,
    selectCurrentEmployee,
    setHistoryFromDate,
    setHistoryToDate,
    setSelectedDepartmentId,
    setSelectedProtocolId,
  } = useTeardownData()
  const activeEmployees = employees.filter((employee) => employee.active)
  const [activeTab, setActiveTab] = useState('current')
  const [expandedApprovalId, setExpandedApprovalId] = useState(null)
  const [isProtocolPickerOpen, setIsProtocolPickerOpen] = useState(false)
  const [selectedHistoryCategoryId, setSelectedHistoryCategoryId] = useState('')
  const historyCategoryOptions = useMemo(
    () => [...currentCategories].sort((left, right) => left.sort_order - right.sort_order),
    [currentCategories],
  )
  const filteredApprovalHistory = useMemo(
    () =>
      approvalHistory
        .map((approval) => ({
          ...approval,
          tasks: selectedHistoryCategoryId
            ? (approval.tasks ?? []).filter((task) => task.category_id === selectedHistoryCategoryId)
            : approval.tasks ?? [],
        }))
        .filter((approval) => !selectedHistoryCategoryId || approval.tasks.length > 0),
    [approvalHistory, selectedHistoryCategoryId],
  )

  useEffect(() => {
    if (
      selectedHistoryCategoryId &&
      !historyCategoryOptions.some((category) => category.id === selectedHistoryCategoryId)
    ) {
      setSelectedHistoryCategoryId('')
    }
  }, [historyCategoryOptions, selectedHistoryCategoryId])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__row">
          <div>
            <div className="department-tabs" role="tablist" aria-label="Departments">
              {departments.map((department) => (
                <button
                  key={department.id}
                  type="button"
                  className={`department-tab${department.id === selectedDepartmentId ? ' department-tab--active' : ''}`}
                  onClick={() => setSelectedDepartmentId(department.id)}
                >
                  {department.name}
                </button>
              ))}
            </div>
            <div className="protocol-heading">
              <h1>{selectedProtocol?.name ?? 'Select protocol'}</h1>
              <button
                type="button"
                className="protocol-change-button"
                onClick={() => setIsProtocolPickerOpen((current) => !current)}
                aria-label="Change protocol"
              >
                ✎
              </button>
            </div>
            {isProtocolPickerOpen ? (
              <select
                className="protocol-select"
                value={selectedProtocolId}
                onChange={(event) => {
                  setSelectedProtocolId(event.target.value)
                  setIsProtocolPickerOpen(false)
                }}
              >
                {departmentProtocols.map((protocol) => (
                  <option key={protocol.id} value={protocol.id}>
                    {protocol.name}
                  </option>
                ))}
              </select>
            ) : null}
            <p className="header-date">{todayLabel}</p>
          </div>
          <Link className="header-link" to="/manager">
            Manager
          </Link>
        </div>
        <div className="view-tabs" role="tablist" aria-label="Checklist views">
          <button
            type="button"
            className={`view-tab${activeTab === 'current' ? ' view-tab--active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Current
          </button>
          <button
            type="button"
            className={`view-tab${activeTab === 'history' ? ' view-tab--active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
        {loading ? <p className="status-banner">Loading live board…</p> : null}
        {errorMessage ? <p className="status-banner status-banner--warning">{errorMessage}</p> : null}
        {syncMessage ? <p className="status-banner status-banner--muted">{syncMessage}</p> : null}
      </header>

      {activeTab === 'current' ? (
        <>
          <div className="employee-picker" role="region" aria-label="Current employee">
            <label>
              Current employee
              <select
                value={currentEmployeeId}
                onChange={(event) => selectCurrentEmployee(event.target.value)}
              >
                <option value="">Who are you?</option>
                {activeEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Board
            tasksByStatus={tasksByStatus}
            onToggleTask={toggleTask}
            onSetTaskDone={setTaskDone}
          />

          <ApproveFooter disabled={!areAllTasksDone} onApprove={approveShift} />
        </>
      ) : (
        <main className="history-view">
          <div className="history-filters">
            <label>
              From
              <input
                type="date"
                value={historyFromDate}
                onChange={(event) => setHistoryFromDate(event.target.value)}
              />
            </label>
            <label>
              To
              <input
                type="date"
                value={historyToDate}
                onChange={(event) => setHistoryToDate(event.target.value)}
              />
            </label>
            <label>
              Category
              <select
                value={selectedHistoryCategoryId}
                onChange={(event) => setSelectedHistoryCategoryId(event.target.value)}
              >
                <option value="">All categories</option>
                {historyCategoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {historyLoading ? <p className="status-banner">Loading approval history…</p> : null}
          {historyError ? <p className="status-banner status-banner--warning">{historyError}</p> : null}
          {!historyLoading && filteredApprovalHistory.length === 0 ? (
            <p className="task-column__empty">No approval history in this date range.</p>
          ) : null}
          <div className="history-list">
            {filteredApprovalHistory.map((approval) => {
              const historyGroups = buildHistoryGroups(approval.tasks ?? [])
              const snapshotTaskCount = historyGroups.reduce(
                (total, group) => total + group.tasks.length,
                0,
              )
              const isExpanded = expandedApprovalId === approval.id

              return (
              <article key={approval.id} className="history-entry">
                <button
                  type="button"
                  className="history-entry__summary"
                  onClick={() => setExpandedApprovalId(isExpanded ? null : approval.id)}
                  aria-expanded={isExpanded}
                >
                  <span>
                    <span className="eyebrow">{selectedDepartment?.name}</span>
                    <strong>{approval.protocol?.name ?? selectedProtocol?.name}</strong>
                  </span>
                  <span>
                    Approved by {formatEmployeeName(approval.employee)} ·{' '}
                    {dateTimeFormatter.format(new Date(approval.approved_at))}
                  </span>
                </button>
                {isExpanded ? (
                  <section className="history-snapshot" aria-label="Done snapshot">
                    <header className="task-column__header">
                      <h2>
                        DONE <span>&middot; {snapshotTaskCount}</span>
                      </h2>
                      <p className="task-column__hint">Snapshot from approval.</p>
                    </header>
                    {snapshotTaskCount === 0 ? (
                      <p className="task-column__empty">No task snapshot was saved for this approval.</p>
                    ) : (
                      <div className="history-entry__groups">
                        {historyGroups.map(({ category, tasks }) => (
                          <section
                            key={category.id}
                            className="category-section category-section--complete"
                            style={{ '--category-color': category.color }}
                          >
                            <div className="category-section__header">
                              <h3>{category.name}</h3>
                              <span>{tasks.length}</span>
                            </div>
                            <div className="history-snapshot__tasks">
                              {tasks.map((task) => (
                                <article
                                  key={`${approval.id}-${task.id}`}
                                  className="history-task-card"
                                >
                                  <div>
                                    <p className="history-task-card__title">{task.name}</p>
                                    {task.action ? (
                                      <p className="history-task-card__action">{task.action}</p>
                                    ) : null}
                                  </div>
                                  <p className="history-task-card__meta">
                                    {formatCompactEmployeeName(task.completed_by_employee)}
                                    {task.completed_at ? ` · ${formatCompletedTime(task.completed_at)}` : ''}
                                  </p>
                                </article>
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>
                    )}
                  </section>
                ) : null}
              </article>
              )
            })}
          </div>
        </main>
      )}

      <CelebrationModal
        isOpen={isApprovalOpen}
        step={approvalStep}
        message={approvalMessage}
        errorMessage={approvalError}
        employees={activeEmployees}
        currentEmployeeId={currentEmployeeId}
        isSaving={isApprovalSaving}
        isResetting={isBoardResetting}
        onSubmitEmployee={submitApproval}
        onClose={dismissApproval}
        onResetBoard={resetBoard}
      />
    </div>
  )
}
