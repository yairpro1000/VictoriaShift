import { Navigate, Route, Routes } from 'react-router-dom'
import { UserMenu } from './components/UserMenu'
import { InstallPrompt } from './components/InstallPrompt'
import { ChecklistPage } from './pages/ChecklistPage'
import { ManagerPage } from './pages/ManagerPage'
import { useTeardownData } from './hooks/useTeardownData'

export default function App() {
  const { sharedAccess } = useTeardownData()
  return (
    <>
      <InstallPrompt />
      {!sharedAccess ? <UserMenu /> : null}
      <Routes>
        <Route path="/" element={<ChecklistPage />} />
        <Route path="/share/:token" element={<ChecklistPage />} />
        <Route path="/share/:token/manager" element={<ManagerPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
