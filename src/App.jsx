import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { seedData, getCurrentUser } from './utils/storage'
import Login from './components/Login'
import Navbar from './components/Navbar'
import EmployeeDashboard from './components/EmployeeDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import Profile from './components/Profile'

function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireManager({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'manager') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    seedData()
    setUser(getCurrentUser())
    setLoaded(true)
  }, [])

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {user && <Navbar user={user} onLogout={() => setUser(null)} />}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.role === 'manager' ? '/manager' : '/dashboard'} replace />
              ) : (
                <Login onLogin={setUser} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth user={user}>
                <EmployeeDashboard employeeId={user?.email} />
              </RequireAuth>
            }
          />
          <Route
            path="/manager"
            element={
              <RequireManager user={user}>
                <ManagerDashboard user={user} />
              </RequireManager>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth user={user}>
                <Profile user={user} onUserUpdate={setUser} />
              </RequireAuth>
            }
          />
          <Route
            path="*"
            element={
              <Navigate
                to={user ? (user.role === 'manager' ? '/manager' : '/dashboard') : '/login'}
                replace
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}
