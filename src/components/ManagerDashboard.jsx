import { useEffect, useState } from 'react'
import {
  getEmployees,
  addEmployee,
  deleteEmployee,
  getOpenTimeLog,
  getTodayHours,
  getEmployeeByEmail,
  clockIn,
  clockOut,
  exportAllEmployeesCSV,
} from '../utils/storage'
import { formatTime } from '../utils/helpers'
import ManagerEditModal from './ManagerEditModal'
import ReviewForm from './ReviewForm'

export default function ManagerDashboard({ user }) {
  const [employees, setEmployees] = useState([])
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState('')
  const [reviewPanel, setReviewPanel] = useState(false)
  const [reviewPresetId, setReviewPresetId] = useState(null)

  function refresh() {
    setEmployees(getEmployees().filter((e) => e.role === 'employee'))
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [])

  function handleAddEmployee(e) {
    e.preventDefault()
    const email = newEmail.trim().toLowerCase()
    const name = newName.trim()
    if (!email || !name) {
      setError('Name and email are required.')
      return
    }
    if (getEmployeeByEmail(email)) {
      setError('An account with that email already exists.')
      return
    }
    addEmployee({ email, name, role: 'employee' })
    setNewName('')
    setNewEmail('')
    setError('')
    setShowAdd(false)
    refresh()
  }

  function handleDelete(employee) {
    if (
      !window.confirm(
        `Delete ${employee.name} (${employee.email})? This removes all their time logs, metrics, and reviews.`
      )
    )
      return
    deleteEmployee(employee.id)
    refresh()
  }

  function handleClockToggle(employee) {
    if (getOpenTimeLog(employee.id)) {
      clockOut(employee.id)
    } else {
      clockIn(employee.id)
    }
    refresh()
  }

  function openReviewFor(employeeId) {
    setReviewPresetId(employeeId)
    setReviewPanel(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Team Overview</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportAllEmployeesCSV}
            className="text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Export CSV
          </button>
          <button
            onClick={() => openReviewFor(employees[0]?.id ?? null)}
            className="text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Write Review
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAddEmployee}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2"
          >
            Create
          </button>
          {error && <p className="text-sm text-red-600 sm:col-span-3">{error}</p>}
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Today Hours</th>
                <th className="py-3 px-4">Last Action</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const openLog = getOpenTimeLog(emp.id)
                return (
                  <tr key={emp.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {emp.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{emp.email}</td>
                    <td className="py-3 px-4">
                      {openLog ? (
                        <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-full px-2.5 py-0.5 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Clocked In {formatTime(openLog.clockIn)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full px-2.5 py-0.5 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Clocked Out
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {getTodayHours(emp.id).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                      {emp.lastAction || '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-3">
                      <button
                        onClick={() => handleClockToggle(emp)}
                        className={`text-sm hover:underline ${openLog ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {openLog ? 'Clock Out' : 'Clock In'}
                      </button>
                      <button
                        onClick={() => setSelected(emp)}
                        className="text-indigo-600 hover:underline text-sm"
                      >
                        View / Edit
                      </button>
                      <button
                        onClick={() => openReviewFor(emp.id)}
                        className="text-indigo-600 hover:underline text-sm"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleDelete(emp)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">
                    No employees yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewPanel && (
        <ReviewForm
          presetEmployeeId={reviewPresetId}
          reviewerEmail={user.email}
          onClose={() => setReviewPanel(false)}
        />
      )}

      {selected && (
        <ManagerEditModal
          employee={selected}
          onClose={() => {
            setSelected(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}
