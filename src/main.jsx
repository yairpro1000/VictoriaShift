import React from 'react'
import ReactDOM from 'react-dom/client'
import { SharedProtocolEntry } from './components/SharedProtocolEntry'
import { shareRoute } from './services/shareContext'
import { BrowserRouter, useLocation } from 'react-router-dom'
import App from './App'
import { AuthProvider, useAuth } from './hooks/useAuth'
import './styles.css'
import { registerServiceWorker } from './services/registerServiceWorker'
import { TeardownDataProvider } from './hooks/useTeardownData.jsx'

function ScopedApp() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const shared = shareRoute(pathname)
  if (shared) return <SharedProtocolEntry key={shared.token ?? 'invalid'} route={shared}><App /></SharedProtocolEntry>
  return <TeardownDataProvider key={user?.id ?? 'public'} user={user}><App /></TeardownDataProvider>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider><ScopedApp /></AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

registerServiceWorker()
