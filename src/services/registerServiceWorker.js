export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) {
    return
  }

  let hasReloadedForUpdate = false

  const activateWaitingWorker = (worker) => {
    worker?.postMessage({ type: 'SKIP_WAITING' })
  }

  const watchInstallingWorker = (worker) => {
    if (!worker) {
      return
    }

    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        activateWaitingWorker(worker)
      }
    })
  }

  const checkForUpdate = (registration) => {
    registration.update().catch(() => {})
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        watchInstallingWorker(registration.installing)
        activateWaitingWorker(registration.waiting)

        registration.addEventListener('updatefound', () => {
          watchInstallingWorker(registration.installing)
        })

        checkForUpdate(registration)

        window.addEventListener('focus', () => {
          checkForUpdate(registration)
        })

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            checkForUpdate(registration)
          }
        })
      })
      .catch(() => {})
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloadedForUpdate) {
      return
    }

    hasReloadedForUpdate = true
    window.location.reload()
  })
}
