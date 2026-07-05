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
} from '../utils/storage'
import { toDatetimeLocalValue, fromDatetimeLocalValue, generateId, todayStr } from '../utils/helpers'

export default function EditEmployeeModal({ employee, onClose }) {
  const [logs, setLogs] = useState(() => getTimeLogsForEmployee(employee.id))
  const [metrics, setMetrics] = useState(() => getMetricsForEmployee(employee.id))

  function refreshLogs() {
    setLogs(getTimeLogsForEmployee(employee.id))
  }
  function refreshMetrics() {
    setMetrics(getMetricsForEmployee(employee.id))
  }

  function handleLogChange(id, field, value) {
    updateTimeLog(id, { [field]: fromDatetimeLocalValue(value) })
    refreshLogs()
  }

  function handleAddLog() {
    const all = getTimeLogs()
    all.push({
      id: generateId(),
      employeeId: employee.id,
      date: todayStr(),
      clockIn: new Date().toISOString(),
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
    updateMetric(id, { [field]: Math.max(0, Number(value) || 0) })
    refreshMetrics()
  }

  function handleAddMetric() {
    const all = getMetrics()
    all.push({ id: generateId(), employeeId: employee.id, date: todayStr(), orders: 0, customers: 0 })
    saveMetrics(all)
    refreshMetrics()
  }

  function handleDeleteMetric(id) {
    deleteMetric(id)
    refreshMetrics()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{employee.name}</h2>
            <p className="subtitle">{employee.email}</p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <section className="modal-section">
            <div className="section-header">
              <h3>Clock Times</h3>
              <button className="btn btn-secondary btn-sm" onClick={handleAddLog}>
                + Add Entry
              </button>
            </div>
            {logs.length === 0 && <p className="empty-text">No time logs yet.</p>}
            {logs.map((log) => (
              <div key={log.id} className="edit-row">
                <div className="field">
                  <label>Clock In</label>
                  <input
                    type="datetime-local"
                    value={toDatetimeLocalValue(log.clockIn)}
                    onChange={(e) => handleLogChange(log.id, 'clockIn', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Clock Out</label>
                  <input
                    type="datetime-local"
                    value={toDatetimeLocalValue(log.clockOut)}
                    onChange={(e) => handleLogChange(log.id, 'clockOut', e.target.value)}
                  />
                </div>
                <div className="edit-row-footer">
                  <span>{log.totalHours.toFixed(2)} hrs</span>
                  <button className="link-btn link-danger" onClick={() => handleDeleteLog(log.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="modal-section">
            <div className="section-header">
              <h3>Work Metrics</h3>
              <button className="btn btn-secondary btn-sm" onClick={handleAddMetric}>
                + Add Entry
              </button>
            </div>
            {metrics.length === 0 && <p className="empty-text">No metrics yet.</p>}
            {metrics.map((m) => (
              <div key={m.id} className="edit-row">
                <div className="field">
                  <label>Date</label>
                  <p className="static-value">{m.date}</p>
                </div>
                <div className="field">
                  <label>Orders</label>
                  <input
                    type="number"
                    min="0"
                    value={m.orders}
                    onChange={(e) => handleMetricChange(m.id, 'orders', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Customers</label>
                  <input
                    type="number"
                    min="0"
                    value={m.customers}
                    onChange={(e) => handleMetricChange(m.id, 'customers', e.target.value)}
                  />
                </div>
                <div className="edit-row-footer">
                  <button className="link-btn link-danger" onClick={() => handleDeleteMetric(m.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  )
}
