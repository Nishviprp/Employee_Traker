import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clearCurrentUser } from '../utils/storage'

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const links =
    user.role === 'manager'
      ? [
          { to: '/manager', label: 'Team' },
          { to: '/dashboard', label: 'My Dashboard' },
          { to: '/profile', label: 'Profile' },
        ]
      : [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/profile', label: 'Profile' },
        ]

  function handleLogout() {
    clearCurrentUser()
    onLogout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">Employee Tracker</span>
            {user.role === 'manager' && (
              <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5">
                Manager
              </span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            <span className="text-sm text-gray-400 mx-2">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Logout
            </button>
          </div>

          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-3 space-y-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <div className="px-3 py-1 text-sm text-gray-400">{user.email}</div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
