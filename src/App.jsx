import { Navigate, Route, Routes } from 'react-router-dom'
import { ChecklistPage } from './pages/ChecklistPage'
import { ManagerPage } from './pages/ManagerPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ChecklistPage />} />
      <Route path="/manager" element={<ManagerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
