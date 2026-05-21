import { useState } from 'react'
import { supabase } from '../supabaseClient.js'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function FeedbackItem({ item, onUpdate, onDelete }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function toggleReviewed() {
    setBusy(true)
    setError('')

    const { data, error: updateError } = await supabase
      .from('feedback')
      .update({ is_reviewed: !item.is_reviewed })
      .eq('id', item.id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
    } else {
      onUpdate(data)
    }

    setBusy(false)
  }

  async function deleteFeedback() {
    const confirmed = window.confirm('Permanently delete this feedback item?')
    if (!confirmed) return

    setBusy(true)
    setError('')

    const { error: deleteError } = await supabase.from('feedback').delete().eq('id', item.id)

    if (deleteError) {
      setError(deleteError.message)
      setBusy(false)
    } else {
      onDelete(item.id)
    }
  }

  return (
    <article className={`feedback-item ${item.is_reviewed ? 'reviewed' : ''}`}>
      <div className="item-header">
        <span className="category-pill">{item.category}</span>
        <span className={`status-pill ${item.is_reviewed ? 'done' : 'pending'}`}>
          {item.is_reviewed ? 'Reviewed' : 'Pending'}
        </span>
      </div>

      <p className="feedback-message">{item.message}</p>
      <time className="muted" dateTime={item.created_at}>
        {dateFormatter.format(new Date(item.created_at))}
      </time>

      {error && <p className="error-message">{error}</p>}

      <div className="item-actions">
        <button className="secondary-button" type="button" onClick={toggleReviewed} disabled={busy}>
          {item.is_reviewed ? 'Mark pending' : 'Mark reviewed'}
        </button>
        <button className="danger-button" type="button" onClick={deleteFeedback} disabled={busy}>
          Delete
        </button>
      </div>
    </article>
  )
}
