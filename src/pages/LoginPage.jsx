import { useState } from 'react'
import { getEmployeeByEmail, addEmployee, setCurrentUser } from '../utils/storage'

const DEMO_ACCOUNTS = [
  { label: 'Manager', email: 'manager@company.com', role: 'manager' },
  { label: 'Employee 1', email: 'emp1@company.com', role: 'employee' },
  { label: 'Employee 2', email: 'emp2@company.com', role: 'employee' },
  { label: 'Employee 3', email: 'emp3@company.com', role: 'employee' },
]

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function login(rawEmail, role) {
    const trimmed = rawEmail.trim().toLowerCase()
    if (!trimmed) {
      setError('Please enter an email address.')
      return
    }

    let name
    if (role === 'employee') {
      let employee = getEmployeeByEmail(trimmed)
      if (!employee) {
        const prefix = trimmed.split('@')[0]
        employee = addEmployee({ email: trimmed, name: prefix.charAt(0).toUpperCase() + prefix.slice(1) })
      }
      name = employee.name
    } else {
      name = 'Manager'
    }

    const user = { email: trimmed, role, name }
    setCurrentUser(user)
    onLogin(user)
  }

  function handleSubmit(e) {
    e.preventDefault()
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Employee Tracker</h1>
        <p className="subtitle">Sign in with your email</p>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="you@company.com"
            autoFocus
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="login-buttons">
          <button type="button" className="btn btn-primary" onClick={() => login(email, 'manager')}>
            Login as Manager
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => login(email, 'employee')}>
            Login as Employee
          </button>
        </div>

        <div className="demo-section">
          <p className="demo-label">Quick demo login</p>
          <div className="demo-grid">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="btn btn-demo"
                onClick={() => login(acc.email, acc.role)}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
