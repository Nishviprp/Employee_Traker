import { useEffect, useState } from 'react'
import { getEmployees, getReviews, addReview, deleteReview } from '../utils/storage'
import { formatDateTime } from '../utils/helpers'

export default function ReviewForm({ presetEmployeeId, reviewerEmail, onClose }) {
  const [employees, setEmployees] = useState([])
  const [employeeId, setEmployeeId] = useState(presetEmployeeId || '')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState([])

  function refreshReviews() {
    setReviews(getReviews().sort((a, b) => new Date(b.date) - new Date(a.date)))
  }

  useEffect(() => {
    const emps = getEmployees().filter((e) => e.role === 'employee')
    setEmployees(emps)
    setEmployeeId(presetEmployeeId || emps[0]?.id || '')
    refreshReviews()
  }, [presetEmployeeId])

  function employeeName(id) {
    return employees.find((e) => e.id === id)?.name || getEmployees().find((e) => e.id === id)?.name || id
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!employeeId) {
      setError('Please select an employee.')
      return
    }
    if (!comment.trim()) {
      setError('Please enter a comment.')
      return
    }
    addReview({ employeeId, reviewerEmail, rating, comment: comment.trim() })
    setComment('')
    setRating(5)
    setError('')
    refreshReviews()
  }

  function handleDelete(id) {
    deleteReview(id)
    refreshReviews()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Write a Review</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
          >
            Close
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Employee
          </label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl leading-none ${n <= rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                aria-label={`${n} star`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Write feedback for this employee..."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          Submit Review
        </button>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          All Reviews
        </h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="border border-gray-100 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {employeeName(r.employeeId)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatDateTime(r.date)}</span>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <span className="text-yellow-500 text-sm">
                  {'★'.repeat(r.rating)}
                  {'☆'.repeat(5 - r.rating)}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">by {r.reviewerEmail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
