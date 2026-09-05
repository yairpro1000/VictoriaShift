import { useEffect, useState } from 'react'

function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [installHint, setInstallHint] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    setIsInstalled(isStandaloneMode())

    const mediaQuery = window.matchMedia('(display-mode: standalone)')

    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setDeferredPrompt(event)
      setInstallHint('')
    }

    function handleInstalled() {
      setDeferredPrompt(null)
      setIsInstalled(true)
      setInstallHint('Installed. You can launch Victoria Shift from your home screen.')
    }

    function handleStandaloneChange(event) {
      setIsInstalled(event.matches)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    mediaQuery.addEventListener('change', handleStandaloneChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      mediaQuery.removeEventListener('change', handleStandaloneChange)
    }
  }, [])

  async function handleInstallClick() {
    if (!deferredPrompt) {
      setInstallHint('Open the browser menu and choose Add to Home screen if Chrome does not show Install.')
      return
    }

    setIsInstalling(true)

    try {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
    } finally {
      setIsInstalling(false)
    }
  }

  if (isInstalled) {
    return null
  }

  if (isCollapsed) {
    return (
      <div className="install-prompt install-prompt--compact" role="region" aria-label="Install app">
        <button
          type="button"
          className="install-prompt__button"
          onClick={handleInstallClick}
          disabled={isInstalling}
        >
          {isInstalling ? 'Opening…' : 'Install app'}
        </button>
      </div>
    )
  }

  return (
    <div className="install-prompt" role="region" aria-label="Install app">
      <div>
        <p className="install-prompt__eyebrow">Install App</p>
        <p className="install-prompt__text">
          Add Victoria Shift to your home screen for a faster, full-screen launch.
        </p>
        {installHint ? <p className="install-prompt__hint">{installHint}</p> : null}
      </div>
      <button
        type="button"
        className="install-prompt__button"
        onClick={handleInstallClick}
        disabled={isInstalling}
      >
        {isInstalling ? 'Opening…' : 'Install app'}
      </button>
      <button
        type="button"
        className="install-prompt__close"
        onClick={() => setIsCollapsed(true)}
        aria-label="Shrink install prompt"
      >
        ×
      </button>
    </div>
  )
}
