import { generateId, todayStr, nowIso, calculateHours } from './helpers'

export const KEYS = {
  EMPLOYEES: 'employees',
  TIME_LOGS: 'timeLogs',
  METRICS: 'metrics',
  REVIEWS: 'reviews',
  CURRENT_USER: 'currentUser',
  SETTINGS: 'appSettings',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ---------- Seeding ----------

export function seedData() {
  if (localStorage.getItem(KEYS.SETTINGS)) return
  seedDefaultData()
}

export function resetAllData() {
  localStorage.removeItem(KEYS.EMPLOYEES)
  localStorage.removeItem(KEYS.TIME_LOGS)
  localStorage.removeItem(KEYS.METRICS)
  localStorage.removeItem(KEYS.REVIEWS)
  localStorage.removeItem(KEYS.SETTINGS)
  seedDefaultData()
}

function seedDefaultData() {
  const employees = [
    {
      id: 'manager@company.com',
      email: 'manager@company.com',
      name: 'Alex Manager',
      role: 'manager',
      createdAt: nowIso(),
      lastAction: null,
    },
    {
      id: 'emp1@company.com',
      email: 'emp1@company.com',
      name: 'Jordan Smith',
      role: 'employee',
      createdAt: nowIso(),
      lastAction: null,
    },
    {
      id: 'emp2@company.com',
      email: 'emp2@company.com',
      name: 'Casey Lee',
      role: 'employee',
      createdAt: nowIso(),
      lastAction: null,
    },
    {
      id: 'emp3@company.com',
      email: 'emp3@company.com',
      name: 'Morgan Reyes',
      role: 'employee',
      createdAt: nowIso(),
      lastAction: null,
    },
  ]

  const timeLogs = []
  const metrics = []
  const reviews = []

  const employeeIds = ['emp1@company.com', 'emp2@company.com', 'emp3@company.com']

  employeeIds.forEach((employeeId, idx) => {
    for (let daysAgo = 2; daysAgo >= 1; daysAgo--) {
      const day = new Date()
      day.setDate(day.getDate() - daysAgo)
      const dateStr = day.toISOString().slice(0, 10)

      const clockIn = new Date(day)
      clockIn.setHours(9, 0, 0, 0)
      const clockOut = new Date(day)
      clockOut.setHours(17, 0, 0, 0)

      timeLogs.push({
        id: generateId(),
        employeeId,
        date: dateStr,
        clockIn: clockIn.toISOString(),
        clockOut: clockOut.toISOString(),
        totalHours: calculateHours(clockIn.toISOString(), clockOut.toISOString()),
      })

      metrics.push({
        id: generateId(),
        employeeId,
        date: dateStr,
        onlineOrders: 5 + idx * 2 + daysAgo,
        inStoreCustomers: 10 + idx * 3 + daysAgo,
      })
    }

    reviews.push({
      id: generateId(),
      employeeId,
      reviewerEmail: 'manager@company.com',
      rating: 4,
      comment: 'Solid performance this period. Keep up the good work.',
      date: nowIso(),
    })
  })

  write(KEYS.EMPLOYEES, employees)
  write(KEYS.TIME_LOGS, timeLogs)
  write(KEYS.METRICS, metrics)
  write(KEYS.REVIEWS, reviews)
  write(KEYS.SETTINGS, { version: 1, theme: 'system' })
}

// ---------- Employees ----------

export function getEmployees() {
  return read(KEYS.EMPLOYEES, [])
}

export function saveEmployees(employees) {
  write(KEYS.EMPLOYEES, employees)
}

export function getEmployeeByEmail(email) {
  return getEmployees().find((e) => e.email.toLowerCase() === email.toLowerCase())
}

export function addEmployee({ email, name, role = 'employee' }) {
  const employees = getEmployees()
  const employee = {
    id: email,
    email,
    name,
    role,
    createdAt: nowIso(),
    lastAction: null,
  }
  employees.push(employee)
  saveEmployees(employees)
  return employee
}

export function updateEmployee(id, updates) {
  const employees = getEmployees().map((e) => (e.id === id ? { ...e, ...updates } : e))
  saveEmployees(employees)
}

// Updates an employee's profile. If the email changes, cascades the new id
// across timeLogs/metrics/reviews since employeeId references email-as-id.
export function updateEmployeeProfile(oldId, { name, email }) {
  const newId = email.toLowerCase()
  const employees = getEmployees().map((e) =>
    e.id === oldId ? { ...e, id: newId, email: newId, name } : e
  )
  saveEmployees(employees)

  if (newId !== oldId) {
    saveTimeLogs(getTimeLogs().map((t) => (t.employeeId === oldId ? { ...t, employeeId: newId } : t)))
    saveMetrics(getMetrics().map((m) => (m.employeeId === oldId ? { ...m, employeeId: newId } : m)))
    saveReviews(getReviews().map((r) => (r.employeeId === oldId ? { ...r, employeeId: newId } : r)))
  }

  return employees.find((e) => e.id === newId)
}

export function deleteEmployee(id) {
  saveEmployees(getEmployees().filter((e) => e.id !== id))
  saveTimeLogs(getTimeLogs().filter((t) => t.employeeId !== id))
  saveMetrics(getMetrics().filter((m) => m.employeeId !== id))
  saveReviews(getReviews().filter((r) => r.employeeId !== id))
}

// ---------- Time Logs ----------

export function getTimeLogs() {
  return read(KEYS.TIME_LOGS, [])
}

export function saveTimeLogs(logs) {
  write(KEYS.TIME_LOGS, logs)
}

export function getTimeLogsForEmployee(employeeId) {
  return getTimeLogs()
    .filter((t) => t.employeeId === employeeId)
    .sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn))
}

export function getOpenTimeLog(employeeId) {
  return getTimeLogs().find((t) => t.employeeId === employeeId && t.clockIn && !t.clockOut)
}

// Usable by an employee for themselves, or by a manager on behalf of any employee.
export function clockIn(employeeId) {
  const logs = getTimeLogs()
  if (logs.find((t) => t.employeeId === employeeId && t.clockIn && !t.clockOut)) return
  const ts = nowIso()
  logs.push({
    id: generateId(),
    employeeId,
    date: todayStr(),
    clockIn: ts,
    clockOut: null,
    totalHours: 0,
  })
  saveTimeLogs(logs)
  updateEmployee(employeeId, { lastAction: `Clocked in at ${new Date(ts).toLocaleTimeString()}` })
}

export function clockOut(employeeId) {
  const logs = getTimeLogs()
  const openLog = logs.find((t) => t.employeeId === employeeId && t.clockIn && !t.clockOut)
  if (!openLog) return
  const ts = nowIso()
  openLog.clockOut = ts
  openLog.totalHours = calculateHours(openLog.clockIn, ts)
  saveTimeLogs(logs)
  updateEmployee(employeeId, { lastAction: `Clocked out at ${new Date(ts).toLocaleTimeString()}` })
}

export function updateTimeLog(id, updates) {
  const logs = getTimeLogs().map((t) => {
    if (t.id !== id) return t
    const merged = { ...t, ...updates }
    merged.totalHours = calculateHours(merged.clockIn, merged.clockOut)
    return merged
  })
  saveTimeLogs(logs)
}

export function deleteTimeLog(id) {
  saveTimeLogs(getTimeLogs().filter((t) => t.id !== id))
}

export function getTodayHours(employeeId) {
  const today = todayStr()
  return getTimeLogs()
    .filter((t) => t.employeeId === employeeId && t.date === today)
    .reduce((sum, t) => {
      if (t.clockOut) return sum + t.totalHours
      return sum + calculateHours(t.clockIn, nowIso())
    }, 0)
}

// ---------- Metrics ----------

export function getMetrics() {
  return read(KEYS.METRICS, [])
}

export function saveMetrics(metrics) {
  write(KEYS.METRICS, metrics)
}

export function getMetricsForEmployee(employeeId) {
  return getMetrics()
    .filter((m) => m.employeeId === employeeId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getOrCreateTodayMetric(employeeId) {
  const metrics = getMetrics()
  const today = todayStr()
  let entry = metrics.find((m) => m.employeeId === employeeId && m.date === today)
  if (!entry) {
    entry = {
      id: generateId(),
      employeeId,
      date: today,
      onlineOrders: 0,
      inStoreCustomers: 0,
    }
    metrics.push(entry)
    saveMetrics(metrics)
  }
  return entry
}

export function adjustMetric(employeeId, field, delta) {
  const metrics = getMetrics()
  const today = todayStr()
  let entry = metrics.find((m) => m.employeeId === employeeId && m.date === today)
  if (!entry) {
    entry = { id: generateId(), employeeId, date: today, onlineOrders: 0, inStoreCustomers: 0 }
    metrics.push(entry)
  }
  entry[field] = Math.max(0, (entry[field] || 0) + delta)
  saveMetrics(metrics)
  return entry
}

export function updateMetric(id, updates) {
  const metrics = getMetrics().map((m) => (m.id === id ? { ...m, ...updates } : m))
  saveMetrics(metrics)
}

export function deleteMetric(id) {
  saveMetrics(getMetrics().filter((m) => m.id !== id))
}

// ---------- Reviews ----------

export function getReviews() {
  return read(KEYS.REVIEWS, [])
}

export function saveReviews(reviews) {
  write(KEYS.REVIEWS, reviews)
}

export function getReviewsForEmployee(employeeId) {
  return getReviews()
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function addReview({ employeeId, reviewerEmail, rating, comment }) {
  const reviews = getReviews()
  reviews.push({
    id: generateId(),
    employeeId,
    reviewerEmail,
    rating,
    comment,
    date: nowIso(),
  })
  saveReviews(reviews)
}

export function deleteReview(id) {
  saveReviews(getReviews().filter((r) => r.id !== id))
}

// ---------- Current User ----------

export function getCurrentUser() {
  return read(KEYS.CURRENT_USER, null)
}

export function setCurrentUser(user) {
  write(KEYS.CURRENT_USER, user)
}

export function clearCurrentUser() {
  localStorage.removeItem(KEYS.CURRENT_USER)
}

// ---------- CSV Export ----------

export function exportToCSV(rows, columns, filename) {
  const header = columns.map((c) => c.label).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = c.value(row)
          const str = val === null || val === undefined ? '' : String(val)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        .join(',')
    )
    .join('\n')
  const csv = `${header}\n${body}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportAllEmployeesCSV() {
  const employees = getEmployees().filter((e) => e.role === 'employee')
  const rows = employees.map((emp) => {
    const openLog = getOpenTimeLog(emp.id)
    const logs = getTimeLogsForEmployee(emp.id)
    const metrics = getMetricsForEmployee(emp.id)
    const totalHours = logs.reduce((sum, l) => sum + l.totalHours, 0)
    const totalOrders = metrics.reduce((sum, m) => sum + m.onlineOrders, 0)
    const totalCustomers = metrics.reduce((sum, m) => sum + m.inStoreCustomers, 0)
    return {
      ...emp,
      status: openLog ? 'Clocked In' : 'Clocked Out',
      todayHours: getTodayHours(emp.id),
      totalHours,
      totalOrders,
      totalCustomers,
    }
  })

  exportToCSV(
    rows,
    [
      { label: 'Name', value: (r) => r.name },
      { label: 'Email', value: (r) => r.email },
      { label: 'Status', value: (r) => r.status },
      { label: 'Today Hours', value: (r) => r.todayHours.toFixed(2) },
      { label: 'Total Hours', value: (r) => r.totalHours.toFixed(2) },
      { label: 'Total Online Orders', value: (r) => r.totalOrders },
      { label: 'Total In-Store Customers', value: (r) => r.totalCustomers },
      { label: 'Last Action', value: (r) => r.lastAction || '' },
    ],
    `employee_report_${todayStr()}.csv`
  )
}
