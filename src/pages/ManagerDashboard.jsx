import { useEffect, useState } from 'react'
import {
  getEmployees,
  addEmployee,
  deleteEmployee,
  getEmployeeByEmail,
  getOpenTimeLog,
  getTodayHours,
  clockIn,
  clockOut,
  clearCurrentUser,
  exportEmployeesToCSV,
} from '../utils/storage'
import { formatTime } from '../utils/helpers'
import EditEmployeeModal from '../components/EditEmployeeModal'
import ReviewForm from '../components/ReviewForm'

export default function ManagerDashboard({ user, onLogout }) {
  const [employees, setEmployees] = useState([])
  const [editing, setEditing] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState('')

  function refresh() {
    setEmployees(getEmployees())
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [])

  function handleLogout() {
    clearCurrentUser()
    onLogout()
  }

  function handleAddEmployee(e) {
    e.preventDefault()
    const email = newEmail.trim().toLowerCase()
    const name = newName.trim()
    if (!email || !name) {
      setError('Name and email are required.')
      return
    }
    if (getEmployeeByEmail(email)) {
      setError('An employee with that email already exists.')
      return
    }
    addEmployee({ email, name })
    setNewName('')
    setNewEmail('')
    setError('')
    setShowAdd(false)
    refresh()
  }

  function handleDelete(employee) {
    if (!window.confirm(`Delete ${employee.name}? This removes their logs, metrics, and reviews.`)) return
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard</h1>
          <p className="subtitle">Signed in as {user.email}</p>
        </div>
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="toolbar">
        <button className="btn btn-secondary" onClick={exportEmployeesToCSV}>
          Export CSV
        </button>
        <button className="btn btn-secondary" onClick={() => setShowReviews(!showReviews)}>
          Reviews
        </button>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          + Add Employee
        </button>
      </div>

      {showAdd && (
        <form className="card add-employee-form" onSubmit={handleAddEmployee}>
          <div className="field">
            <label>Name</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      )}

      <div className="card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Today's Hours</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const openLog = getOpenTimeLog(emp.id)
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="employee-name">{emp.name}</div>
                      <div className="employee-email">{emp.email}</div>
                    </td>
                    <td>
                      {openLog ? (
                        <span className="badge badge-in">Clocked In {formatTime(openLog.clockIn)}</span>
                      ) : (
                        <span className="badge badge-out">Clocked Out</span>
                      )}
                    </td>
                    <td>{getTodayHours(emp.id).toFixed(2)}</td>
                    <td className="row-actions">
                      <button
                        className={`link-btn ${openLog ? 'link-danger' : 'link-success'}`}
                        onClick={() => handleClockToggle(emp)}
                      >
                        {openLog ? 'Clock Out' : 'Clock In'}
                      </button>
                      <button className="link-btn" onClick={() => setEditing(emp)}>
                        View / Edit
                      </button>
                      <button className="link-btn link-danger" onClick={() => handleDelete(emp)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-row">
                    No employees yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showReviews && (
        <ReviewForm reviewerEmail={user.email} onClose={() => setShowReviews(false)} />
      )}

      {editing && (
        <EditEmployeeModal
          employee={editing}
          onClose={() => {
            setEditing(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}
