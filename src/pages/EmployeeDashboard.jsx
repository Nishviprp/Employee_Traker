import { useEffect, useState } from 'react'
import {
  getEmployeeByEmail,
  updateEmployee,
  getOpenTimeLog,
  clockIn,
  clockOut,
  getTodayHours,
  getOrCreateTodayMetric,
  adjustMetric,
  getReviewsForEmployee,
  clearCurrentUser,
  setCurrentUser,
  getEmployees,
} from '../utils/storage'
import { formatTime, formatDateTime } from '../utils/helpers'

export default function EmployeeDashboard({ user, onLogout, onUserUpdate }) {
  const [employee, setEmployee] = useState(() => getEmployeeByEmail(user.email))
  const [openLog, setOpenLog] = useState(null)
  const [todayHours, setTodayHours] = useState(0)
  const [metric, setMetric] = useState(null)
  const [reviews, setReviews] = useState([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function refresh() {
    const emp = getEmployeeByEmail(user.email)
    setEmployee(emp)
    setOpenLog(getOpenTimeLog(user.email))
    setTodayHours(getTodayHours(user.email))
    setMetric(getOrCreateTodayMetric(user.email))
    setReviews(getReviewsForEmployee(user.email))
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(() => {
      if (getOpenTimeLog(user.email)) setTodayHours(getTodayHours(user.email))
    }, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.email])

  function handleLogout() {
    clearCurrentUser()
    onLogout()
  }

  function handleClockToggle() {
    if (openLog) {
      clockOut(user.email)
    } else {
      clockIn(user.email)
    }
    refresh()
  }

  function handleAdjust(field, delta) {
    adjustMetric(user.email, field, delta)
    refresh()
  }

  function openProfileEditor() {
    setName(employee?.name || '')
    setEmail(employee?.email || '')
    setError('')
    setEditingProfile(true)
  }

  function handleSaveProfile(e) {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedName || !trimmedEmail) {
      setError('Name and email are required.')
      return
    }
    const conflict = getEmployees().find(
      (e) => e.email.toLowerCase() === trimmedEmail && e.id !== employee.id
    )
    if (conflict) {
      setError('Another employee already uses that email.')
      return
    }
    updateEmployee(employee.id, { name: trimmedName, email: trimmedEmail })
    const updatedUser = { ...user, email: trimmedEmail, name: trimmedName }
    setCurrentUser(updatedUser)
    onUserUpdate(updatedUser)
    setEditingProfile(false)
  }

  if (!employee) {
    return <p className="empty-text">Loading...</p>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{employee.name}</h1>
          <p className="subtitle">{employee.email}</p>
        </div>
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="card">
        <div className="section-header">
          <h3>Time Clock</h3>
          <button className="link-btn" onClick={openProfileEditor}>
            Edit Profile
          </button>
        </div>
        <p className="hours-display">
          Today's hours: <strong>{todayHours.toFixed(2)}</strong>
        </p>
        {openLog && <p className="clocked-in-note">Clocked in at {formatTime(openLog.clockIn)}</p>}
        <button
          className={`btn ${openLog ? 'btn-danger' : 'btn-success'} btn-block`}
          onClick={handleClockToggle}
        >
          {openLog ? 'Clock Out' : 'Clock In'}
        </button>
      </div>

      {editingProfile && (
        <form className="card" onSubmit={handleSaveProfile}>
          <h3>Edit Profile</h3>
          <div className="field">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="toolbar">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setEditingProfile(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <h3>Today's Metrics</h3>
        <div className="metric-grid">
          <div className="metric-box">
            <p className="subtitle">Orders</p>
            <p className="metric-value">{metric?.orders ?? 0}</p>
            <div className="counter-buttons">
              <button className="btn btn-outline btn-sm" onClick={() => handleAdjust('orders', -1)}>
                −
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleAdjust('orders', 1)}>
                +
              </button>
            </div>
          </div>
          <div className="metric-box">
            <p className="subtitle">Customers</p>
            <p className="metric-value">{metric?.customers ?? 0}</p>
            <div className="counter-buttons">
              <button className="btn btn-outline btn-sm" onClick={() => handleAdjust('customers', -1)}>
                −
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleAdjust('customers', 1)}>
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>My Reviews</h3>
        {reviews.length === 0 && <p className="empty-text">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="review-item">
            <div className="rating-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
            <p>{r.comment}</p>
            <p className="subtitle">
              {formatDateTime(r.date)} — by {r.reviewerEmail}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
