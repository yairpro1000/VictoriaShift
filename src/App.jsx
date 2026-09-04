import { Navigate, Route, Routes } from 'react-router-dom'
import { InstallPrompt } from './components/InstallPrompt'
import { ChecklistPage } from './pages/ChecklistPage'
import { ManagerPage } from './pages/ManagerPage'

export default function App() {
  return (
    <>
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<ChecklistPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
