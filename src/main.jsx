import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider, useAuth } from './hooks/useAuth'
import './styles.css'
import { registerServiceWorker } from './services/registerServiceWorker'
import { TeardownDataProvider } from './hooks/useTeardownData.jsx'

function ScopedApp() {
  const { user } = useAuth()
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
