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
  } = useTeardownData()

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
        isSaving={isApprovalSaving}
        isResetting={isBoardResetting}
        onSubmitName={submitApproval}
        onClose={dismissApproval}
        onResetBoard={resetBoard}
      />
    </div>
  )
}
