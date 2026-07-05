import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getEmployeeByEmail,
  updateEmployeeProfile,
  getEmployees,
  setCurrentUser,
  resetAllData,
} from '../utils/storage'

export default function Profile({ user, onUserUpdate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const employee = getEmployeeByEmail(user.email)
    if (employee) {
      setName(employee.name)
      setEmail(employee.email)
    }
  }, [user.email])

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    if (!trimmedName || !trimmedEmail) {
      setError('Name and email are required.')
      return
    }

    const conflict = getEmployees().find(
      (emp) =>
        emp.email.toLowerCase() === trimmedEmail && emp.email.toLowerCase() !== user.email.toLowerCase()
    )
    if (conflict) {
      setError('Another account already uses that email.')
      return
    }

    // Cascades the new id across time logs, metrics, and reviews so history isn't lost.
    const updated = updateEmployeeProfile(user.email, { name: trimmedName, email: trimmedEmail })
    const newUser = { email: updated.email, role: updated.role }
    setCurrentUser(newUser)
    onUserUpdate(newUser)
    setMessage('Profile updated successfully.')

    if (updated.email !== user.email) {
      navigate(0)
    }
  }

  function handleReset() {
    if (
      !window.confirm(
        'Reset all data to the default demo dataset? This deletes every employee, time log, metric, and review.'
      )
    )
      return
    resetAllData()
    setCurrentUser(null)
    onUserUpdate(null)
    navigate('/login')
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Reset Demo Data
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Wipes all local data and restores the default sample employees, logs, metrics, and
          reviews.
        </p>
        <button
          onClick={handleReset}
          className="w-full rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 font-medium py-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          Reset All Data
        </button>
      </div>
    </div>
  )
}
