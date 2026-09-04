export function ApproveFooter({ disabled, onApprove }) {
  return (
    <footer className="approve-footer">
      <div className="approve-footer__inner">
        <button
          className="approve-button"
          type="button"
          onClick={onApprove}
          disabled={disabled}
        >
          Approve
        </button>
      </div>
    </footer>
  )
}
