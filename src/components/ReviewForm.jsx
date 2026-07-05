import { useEffect, useState } from 'react'
import { getEmployees, getReviews, addReview, deleteReview } from '../utils/storage'
import { formatDateTime } from '../utils/helpers'

export default function ReviewForm({ reviewerEmail, onClose }) {
  const [employees, setEmployees] = useState([])
  const [employeeId, setEmployeeId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState([])

  function refreshReviews() {
    setReviews(getReviews().sort((a, b) => new Date(b.date) - new Date(a.date)))
  }

  useEffect(() => {
    const emps = getEmployees()
    setEmployees(emps)
    setEmployeeId(emps[0]?.id || '')
    refreshReviews()
  }, [])

  function employeeName(id) {
    return getEmployees().find((e) => e.id === id)?.name || id
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
    addReview({ employeeId, reviewerEmail, rating: Number(rating), comment: comment.trim() })
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
    <div className="card">
      <div className="section-header">
        <h3>Write a Review</h3>
        {onClose && (
          <button className="link-btn" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <div className="field">
          <label>Employee</label>
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.email})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Rating (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Comment</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write feedback for this employee..."
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary">
          Submit Review
        </button>
      </form>

      <div className="review-list">
        <h3>All Reviews</h3>
        {reviews.length === 0 && <p className="empty-text">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="review-item">
            <div className="review-item-header">
              <span className="employee-name">{employeeName(r.employeeId)}</span>
              <span className="subtitle">{formatDateTime(r.date)}</span>
            </div>
            <div className="rating-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
            <p>{r.comment}</p>
            <div className="review-item-footer">
              <span className="subtitle">by {r.reviewerEmail}</span>
              <button className="link-btn link-danger" onClick={() => handleDelete(r.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
