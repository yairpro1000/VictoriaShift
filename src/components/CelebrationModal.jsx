import { useEffect } from 'react'

const CONFETTI_COLORS = [
  '#d62828',
  '#ff8c42',
  '#ff7aa2',
  '#b084f5',
  '#9fd4ff',
  '#8fd14f',
  '#fffdf7',
]

export function CelebrationModal({ isOpen, message, onClose }) {
  useEffect(() => {
    if (!isOpen) {
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

  return (
    <div className="celebration-modal" role="presentation" onClick={onClose}>
      <div
        className="celebration-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-title"
        onClick={(event) => event.stopPropagation()}
      >
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
        <button className="celebration-modal__close" type="button" onClick={onClose}>
          Nice
        </button>
      </div>
    </div>
  )
}
