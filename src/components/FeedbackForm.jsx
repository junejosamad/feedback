import { useState } from 'react'
import { supabase } from '../supabaseClient.js'

const categories = ['Course Content', 'Lab Work', 'Teaching', 'Assessment', 'Other']

export function FeedbackForm() {
  const [category, setCategory] = useState(categories[0])
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState({ type: '', text: '' })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', text: '' })
    setSubmitting(true)

    const { error } = await supabase.from('feedback').insert({
      category,
      message: message.trim(),
    })

    if (error) {
      setStatus({ type: 'error', text: error.message })
    } else {
      setMessage('')
      setCategory(categories[0])
      setStatus({ type: 'success', text: 'Feedback submitted anonymously.' })
    }

    setSubmitting(false)
  }

  return (
    <section className="form-panel">
      <div className="section-heading">
        <p className="eyebrow">Public form</p>
        <h2>Submit Feedback</h2>
      </div>

      <form className="feedback-form" onSubmit={handleSubmit}>
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          Message
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            minLength={8}
            maxLength={800}
            placeholder="Write your feedback here..."
            required
          />
        </label>

        <div className="form-footer">
          {status.text && <p className={`status-message ${status.type}`}>{status.text}</p>}
          <button className="primary-button" type="submit" disabled={submitting || !message.trim()}>
            {submitting ? 'Submitting...' : 'Submit anonymously'}
          </button>
        </div>
      </form>
    </section>
  )
}
