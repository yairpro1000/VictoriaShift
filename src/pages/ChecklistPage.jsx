import { Link } from 'react-router-dom'
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

export function ChecklistPage() {
  const {
    employees,
    currentEmployeeId,
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
  } = useTeardownData()
  const activeEmployees = employees.filter((employee) => employee.active)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__row">
          <div>
            <p className="eyebrow">PASTA &amp; MORE</p>
            <h1>Shift Teardown</h1>
            <p className="header-date">{todayLabel}</p>
          </div>
          <Link className="header-link" to="/manager">
            Manager
          </Link>
        </div>
        {loading ? <p className="status-banner">Loading live board…</p> : null}
        {errorMessage ? <p className="status-banner status-banner--warning">{errorMessage}</p> : null}
        {syncMessage ? <p className="status-banner status-banner--muted">{syncMessage}</p> : null}
      </header>

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
