import { useEffect, useState } from 'react'
import { seedData, getCurrentUser } from './utils/storage'
import LoginPage from './pages/LoginPage'
import ManagerDashboard from './pages/ManagerDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'

export default function App() {
  const [user, setUser] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    seedData()
    setUser(getCurrentUser())
    setLoaded(true)
  }, [])

  if (!loaded) return null

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  if (user.role === 'manager') {
    return <ManagerDashboard user={user} onLogout={() => setUser(null)} />
  }

  return <EmployeeDashboard user={user} onLogout={() => setUser(null)} onUserUpdate={setUser} />
}
