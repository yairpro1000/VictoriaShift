import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import { registerServiceWorker } from './services/registerServiceWorker'
import { TeardownDataProvider } from './hooks/useTeardownData.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TeardownDataProvider>
        <App />
      </TeardownDataProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

registerServiceWorker()
