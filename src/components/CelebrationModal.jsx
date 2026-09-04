import { useEffect, useState } from 'react'

const CONFETTI_COLORS = [
  '#d62828',
  '#ff8c42',
  '#ff7aa2',
  '#b084f5',
  '#9fd4ff',
  '#8fd14f',
  '#fffdf7',
]

export function CelebrationModal({
  isOpen,
  step,
  message,
  errorMessage,
  isSaving,
  isResetting,
  onSubmitName,
  onClose,
  onResetBoard,
}) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setName('')
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const didSave = await onSubmitName(name)

    if (didSave) {
      setName('')
    }
  }

  return (
    <div className="celebration-modal" role="presentation" onClick={onClose}>
      <div
        className="celebration-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-title"
        onClick={(event) => event.stopPropagation()}
      >
        {step === 'celebration' ? (
          <>
            <div className="celebration-modal__confetti" aria-hidden="true">
              {Array.from({ length: 28 }, (_, index) => (
                <span
                  key={index}
                  className="confetti-piece"
                  style={{
                    '--confetti-color': CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                    '--confetti-left': `${(index * 13) % 100}%`,
                    '--confetti-delay': `${(index % 7) * 70}ms`,
                    '--confetti-duration': `${2200 + (index % 6) * 180}ms`,
                    '--confetti-rotate': `${index % 2 === 0 ? 1 : -1}`,
                  }}
                />
              ))}
            </div>

            <p className="celebration-modal__eyebrow">Approved</p>
            <h2 id="approval-title">{message}</h2>
            {errorMessage ? <p className="celebration-modal__error">{errorMessage}</p> : null}
            <div className="celebration-modal__actions">
              <button
                className="secondary-button"
                type="button"
                onClick={onClose}
                disabled={isResetting}
              >
                Close
              </button>
              <button
                className="celebration-modal__close"
                type="button"
                onClick={onResetBoard}
                disabled={isResetting}
              >
                {isResetting ? 'Resetting…' : 'Reset board'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="celebration-modal__eyebrow">Approve Shift</p>
            <h2 id="approval-title">Who is approving this shift?</h2>
            <form className="celebration-modal__form" onSubmit={handleSubmit}>
              <label>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter name"
                  autoFocus
                  disabled={isSaving}
                  required
                />
              </label>
              {errorMessage ? <p className="celebration-modal__error">{errorMessage}</p> : null}
              <div className="celebration-modal__actions">
                <button className="secondary-button" type="button" onClick={onClose} disabled={isSaving}>
                  Close
                </button>
                <button className="celebration-modal__close" type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Approve'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
