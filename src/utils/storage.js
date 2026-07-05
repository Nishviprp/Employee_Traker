import { generateId, todayStr, nowIso, calculateHours } from './helpers'

const KEYS = {
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

// ---------- Seed / Reset ----------

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
    { id: 'emp1@company.com', email: 'emp1@company.com', name: 'Jordan Smith', createdAt: nowIso() },
    { id: 'emp2@company.com', email: 'emp2@company.com', name: 'Casey Lee', createdAt: nowIso() },
    { id: 'emp3@company.com', email: 'emp3@company.com', name: 'Morgan Reyes', createdAt: nowIso() },
  ]

  const timeLogs = []
  const metrics = []
  const reviews = []

  employees.forEach((emp, idx) => {
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
        employeeId: emp.id,
        date: dateStr,
        clockIn: clockIn.toISOString(),
        clockOut: clockOut.toISOString(),
        totalHours: calculateHours(clockIn.toISOString(), clockOut.toISOString()),
      })

      metrics.push({
        id: generateId(),
        employeeId: emp.id,
        date: dateStr,
        orders: 5 + idx * 2 + daysAgo,
        customers: 10 + idx * 3 + daysAgo,
      })
    }

    reviews.push({
      id: generateId(),
      employeeId: emp.id,
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
  write(KEYS.SETTINGS, { version: 1 })
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

export function addEmployee({ email, name }) {
  const employees = getEmployees()
  const employee = { id: email, email, name, createdAt: nowIso() }
  employees.push(employee)
  saveEmployees(employees)
  return employee
}

export function updateEmployee(id, updates) {
  saveEmployees(getEmployees().map((e) => (e.id === id ? { ...e, ...updates } : e)))
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

// Callable by an employee for themselves, or a manager on behalf of any employee.
export function clockIn(employeeId) {
  const logs = getTimeLogs()
  if (logs.find((t) => t.employeeId === employeeId && t.clockIn && !t.clockOut)) return
  logs.push({
    id: generateId(),
    employeeId,
    date: todayStr(),
    clockIn: nowIso(),
    clockOut: null,
    totalHours: 0,
  })
  saveTimeLogs(logs)
}

export function clockOut(employeeId) {
  const logs = getTimeLogs()
  const openLog = logs.find((t) => t.employeeId === employeeId && t.clockIn && !t.clockOut)
  if (!openLog) return
  const ts = nowIso()
  openLog.clockOut = ts
  openLog.totalHours = calculateHours(openLog.clockIn, ts)
  saveTimeLogs(logs)
}

export function updateTimeLog(id, updates) {
  saveTimeLogs(
    getTimeLogs().map((t) => {
      if (t.id !== id) return t
      const merged = { ...t, ...updates }
      merged.totalHours = calculateHours(merged.clockIn, merged.clockOut)
      return merged
    })
  )
}

export function deleteTimeLog(id) {
  saveTimeLogs(getTimeLogs().filter((t) => t.id !== id))
}

export function getTodayHours(employeeId) {
  const today = todayStr()
  return getTimeLogs()
    .filter((t) => t.employeeId === employeeId && t.date === today)
    .reduce((sum, t) => sum + (t.clockOut ? t.totalHours : calculateHours(t.clockIn, nowIso())), 0)
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
    entry = { id: generateId(), employeeId, date: today, orders: 0, customers: 0 }
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
    entry = { id: generateId(), employeeId, date: today, orders: 0, customers: 0 }
    metrics.push(entry)
  }
  entry[field] = Math.max(0, (entry[field] || 0) + delta)
  saveMetrics(metrics)
  return entry
}

export function updateMetric(id, updates) {
  saveMetrics(getMetrics().map((m) => (m.id === id ? { ...m, ...updates } : m)))
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
  reviews.push({ id: generateId(), employeeId, reviewerEmail, rating, comment, date: nowIso() })
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

function toCSV(rows, columns) {
  const header = columns.map((c) => c.label).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const str = String(c.value(row) ?? '')
          return /[,"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
        })
        .join(',')
    )
    .join('\n')
  return `${header}\n${body}`
}

function downloadCSV(csv, filename) {
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

export function exportEmployeesToCSV() {
  const employees = getEmployees()
  const rows = employees.map((emp) => {
    const openLog = getOpenTimeLog(emp.id)
    const logs = getTimeLogsForEmployee(emp.id)
    const metrics = getMetricsForEmployee(emp.id)
    return {
      ...emp,
      status: openLog ? 'Clocked In' : 'Clocked Out',
      todayHours: getTodayHours(emp.id),
      totalHours: logs.reduce((sum, l) => sum + l.totalHours, 0),
      totalOrders: metrics.reduce((sum, m) => sum + m.orders, 0),
      totalCustomers: metrics.reduce((sum, m) => sum + m.customers, 0),
    }
  })

  const csv = toCSV(rows, [
    { label: 'Name', value: (r) => r.name },
    { label: 'Email', value: (r) => r.email },
    { label: 'Status', value: (r) => r.status },
    { label: 'Today Hours', value: (r) => r.todayHours.toFixed(2) },
    { label: 'Total Hours', value: (r) => r.totalHours.toFixed(2) },
    { label: 'Total Orders', value: (r) => r.totalOrders },
    { label: 'Total Customers', value: (r) => r.totalCustomers },
  ])

  downloadCSV(csv, `employee_report_${todayStr()}.csv`)
}
