import { useState } from 'react'
import {
  getTimeLogsForEmployee,
  updateTimeLog,
  deleteTimeLog,
  getTimeLogs,
  saveTimeLogs,
  getMetricsForEmployee,
  updateMetric,
  deleteMetric,
  getMetrics,
  saveMetrics,
  getReviewsForEmployee,
  deleteReview,
} from '../utils/storage'
import {
  toDatetimeLocalValue,
  fromDatetimeLocalValue,
  formatDateTime,
  generateId,
  todayStr,
} from '../utils/helpers'

const TABS = ['Clock Times', 'Work Metrics', 'Reviews']

export default function ManagerEditModal({ employee, onClose }) {
  const [tab, setTab] = useState('Clock Times')
  const [logs, setLogs] = useState(() => getTimeLogsForEmployee(employee.id))
  const [metrics, setMetrics] = useState(() => getMetricsForEmployee(employee.id))
  const [reviews, setReviews] = useState(() => getReviewsForEmployee(employee.id))

  function refreshLogs() {
    setLogs(getTimeLogsForEmployee(employee.id))
  }
  function refreshMetrics() {
    setMetrics(getMetricsForEmployee(employee.id))
  }
  function refreshReviews() {
    setReviews(getReviewsForEmployee(employee.id))
  }

  function handleLogChange(id, field, value) {
    updateTimeLog(id, { [field]: fromDatetimeLocalValue(value) })
    refreshLogs()
  }

  function handleAddLog() {
    const all = getTimeLogs()
    const now = new Date().toISOString()
    all.push({
      id: generateId(),
      employeeId: employee.id,
      date: todayStr(),
      clockIn: now,
      clockOut: null,
      totalHours: 0,
    })
    saveTimeLogs(all)
    refreshLogs()
  }

  function handleDeleteLog(id) {
    deleteTimeLog(id)
    refreshLogs()
  }

  function handleMetricChange(id, field, value) {
    const num = Math.max(0, Number(value) || 0)
    updateMetric(id, { [field]: num })
    refreshMetrics()
  }

  function handleAddMetric() {
    const all = getMetrics()
    all.push({
      id: generateId(),
      employeeId: employee.id,
      date: todayStr(),
      onlineOrders: 0,
      inStoreCustomers: 0,
    })
    saveMetrics(all)
    refreshMetrics()
  }

  function handleDeleteMetric(id) {
    deleteMetric(id)
    refreshMetrics()
  }

  function handleDeleteReview(id) {
    deleteReview(id)
    refreshReviews()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {employee.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                tab === t
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {tab === 'Clock Times' && (
            <div>
              <div className="flex justify-end mb-3">
                <button
                  onClick={handleAddLog}
                  className="text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5"
                >
                  + Add Entry
                </button>
              </div>
              <div className="space-y-3">
                {logs.length === 0 && (
                  <p className="text-sm text-gray-400">No time logs for this employee.</p>
                )}
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
                  >
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Clock In
                      </label>
                      <input
                        type="datetime-local"
                        value={toDatetimeLocalValue(log.clockIn)}
                        onChange={(e) => handleLogChange(log.id, 'clockIn', e.target.value)}
                        className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Clock Out
                      </label>
                      <input
                        type="datetime-local"
                        value={toDatetimeLocalValue(log.clockOut)}
                        onChange={(e) => handleLogChange(log.id, 'clockOut', e.target.value)}
                        className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {log.totalHours.toFixed(2)} hrs
                      </span>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Work Metrics' && (
            <div>
              <div className="flex justify-end mb-3">
                <button
                  onClick={handleAddMetric}
                  className="text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5"
                >
                  + Add Entry
                </button>
              </div>
              <div className="space-y-3">
                {metrics.length === 0 && (
                  <p className="text-sm text-gray-400">No metrics for this employee.</p>
                )}
                {metrics.map((m) => (
                  <div
                    key={m.id}
                    className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                  >
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Date
                      </label>
                      <p className="text-sm text-gray-700 dark:text-gray-300 py-1.5">{m.date}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Online Orders
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={m.onlineOrders}
                        onChange={(e) => handleMetricChange(m.id, 'onlineOrders', e.target.value)}
                        className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        In-Store Customers
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={m.inStoreCustomers}
                        onChange={(e) =>
                          handleMetricChange(m.id, 'inStoreCustomers', e.target.value)
                        }
                        className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteMetric(m.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Reviews' && (
            <div className="space-y-3">
              {reviews.length === 0 && <p className="text-sm text-gray-400">No reviews yet.</p>}
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="border border-gray-100 dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-yellow-500">
                      {'★'.repeat(r.rating)}
                      {'☆'.repeat(5 - r.rating)}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{formatDateTime(r.date)}</span>
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">by {r.reviewerEmail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
