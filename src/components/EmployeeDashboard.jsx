import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getOpenTimeLog,
  clockIn,
  clockOut,
  getTodayHours,
  getTimeLogsForEmployee,
  getOrCreateTodayMetric,
  adjustMetric,
  getReviewsForEmployee,
} from '../utils/storage'
import { formatDate, formatDateTime, formatTime } from '../utils/helpers'

export default function EmployeeDashboard({ employeeId, readOnly = false }) {
  const [openLog, setOpenLog] = useState(null)
  const [todayHours, setTodayHours] = useState(0)
  const [logs, setLogs] = useState([])
  const [todayMetric, setTodayMetric] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  function refresh() {
    setOpenLog(getOpenTimeLog(employeeId) || null)
    setTodayHours(getTodayHours(employeeId))
    setLogs(getTimeLogsForEmployee(employeeId).slice(0, 10))
    setTodayMetric(getOrCreateTodayMetric(employeeId))
    setReviews(getReviewsForEmployee(employeeId))
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(() => {
      if (getOpenTimeLog(employeeId)) setTodayHours(getTodayHours(employeeId))
    }, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId])

  function handleClockToggle() {
    if (openLog) {
      clockOut(employeeId)
    } else {
      clockIn(employeeId)
    }
    refresh()
  }

  function handleAdjust(field, delta) {
    adjustMetric(employeeId, field, delta)
    refresh()
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Loading...</p>
  }

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex justify-end">
          <Link to="/profile" className="text-sm text-indigo-600 hover:underline">
            Edit Profile
          </Link>
        </div>
      )}

      {/* Clock In/Out */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Time Clock</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Today's hours:{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {todayHours.toFixed(2)}
              </span>
            </p>
            {openLog && (
              <p className="text-xs text-green-600 mt-1">
                Clocked in at {formatTime(openLog.clockIn)}
              </p>
            )}
          </div>
          {!readOnly && (
            <button
              onClick={handleClockToggle}
              className={`px-5 py-2.5 rounded-lg font-medium text-white transition-colors ${
                openLog ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {openLog ? 'Clock Out' : 'Clock In'}
            </button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today's Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCounter
            label="Online Orders Taken"
            value={todayMetric?.onlineOrders ?? 0}
            onIncrement={() => handleAdjust('onlineOrders', 1)}
            onDecrement={() => handleAdjust('onlineOrders', -1)}
            readOnly={readOnly}
          />
          <MetricCounter
            label="In-Store Customers Served"
            value={todayMetric?.inStoreCustomers ?? 0}
            onIncrement={() => handleAdjust('inStoreCustomers', 1)}
            onDecrement={() => handleAdjust('inStoreCustomers', -1)}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Recent Time Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Time Logs
        </h2>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400">No time logs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Clock In</th>
                  <th className="py-2 pr-4">Clock Out</th>
                  <th className="py-2 pr-4">Hours</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {formatDate(log.clockIn)}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {formatTime(log.clockIn)}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {log.clockOut ? formatTime(log.clockOut) : '—'}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {log.totalHours.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Reviews
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
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
                  <span className="text-xs text-gray-400">{formatDateTime(r.date)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">by {r.reviewerEmail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCounter({ label, value, onIncrement, onDecrement, readOnly }) {
  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
      {!readOnly && (
        <div className="flex items-center gap-2">
          <button
            onClick={onDecrement}
            className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            −
          </button>
          <button
            onClick={onIncrement}
            className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}
