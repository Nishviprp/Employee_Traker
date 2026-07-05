export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function nowIso() {
  return new Date().toISOString()
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// DD/MM/YYYY HH:MM
export function formatDateTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// DD/MM/YYYY
export function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

// HH:MM
export function formatTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function calculateHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime()
  if (ms <= 0) return 0
  return Math.round((ms / 3600000) * 100) / 100
}

// Converts an ISO datetime string to the value expected by an
// <input type="datetime-local"> element (local time, no timezone/seconds).
export function toDatetimeLocalValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Converts an <input type="datetime-local"> value back to an ISO string.
export function fromDatetimeLocalValue(value) {
  if (!value) return null
  return new Date(value).toISOString()
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
}
