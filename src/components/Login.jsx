import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEmployeeByEmail, setCurrentUser } from '../utils/storage'

const DEMO_ACCOUNTS = [
  { label: 'Manager', email: 'manager@company.com' },
  { label: 'Employee 1', email: 'emp1@company.com' },
  { label: 'Employee 2', email: 'emp2@company.com' },
  { label: 'Employee 3', email: 'emp3@company.com' },
]

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function login(loginEmail) {
    const trimmed = loginEmail.trim().toLowerCase()
    if (!trimmed) {
      setError('Please enter an email address.')
      return
    }
    // Auto-detect role: manager@company.com is always manager, everyone else is employee.
    const employee = getEmployeeByEmail(trimmed)
    if (!employee) {
      setError('No account found with that email.')
      return
    }
    const user = { email: employee.email, role: employee.role }
    setCurrentUser(user)
    onLogin(user)
    navigate(employee.role === 'manager' ? '/manager' : '/dashboard')
  }

  function handleSubmit(e) {
    e.preventDefault()
    login(email)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1 text-center">
          Employee Tracker
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          Sign in with your work email
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 transition-colors"
          >
            Login
          </button>
        </form>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2 text-center">
            Quick demo login
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => login(acc.email)}
                className="text-xs rounded-lg border border-gray-200 dark:border-gray-600 py-2 px-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
