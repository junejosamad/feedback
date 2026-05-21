import { useEffect, useMemo, useState } from 'react'
import { FeedbackItem } from './FeedbackItem.jsx'
import { supabase } from '../supabaseClient.js'

const allCategory = 'All categories'
const allStatuses = 'All statuses'

export function AdminDashboard({ session }) {
  const [feedback, setFeedback] = useState([])
  const [categoryFilter, setCategoryFilter] = useState(allCategory)
  const [statusFilter, setStatusFilter] = useState(allStatuses)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchFeedback() {
    const { data, error: fetchError } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setFeedback(data ?? [])
      setError('')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFeedback()

    const channel = supabase
      .channel('feedback-admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        fetchFeedback()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const categories = useMemo(() => {
    return [allCategory, ...Array.from(new Set(feedback.map((item) => item.category))).sort()]
  }, [feedback])

  const filteredFeedback = feedback.filter((item) => {
    const matchesCategory = categoryFilter === allCategory || item.category === categoryFilter
    const matchesStatus =
      statusFilter === allStatuses ||
      (statusFilter === 'Reviewed' && item.is_reviewed) ||
      (statusFilter === 'Pending' && !item.is_reviewed)

    return matchesCategory && matchesStatus
  })

  async function signOut() {
    await supabase.auth.signOut()
  }

  function updateLocalItem(nextItem) {
    setFeedback((items) => items.map((item) => (item.id === nextItem.id ? nextItem : item)))
  }

  function removeLocalItem(id) {
    setFeedback((items) => items.filter((item) => item.id !== id))
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Feedback Inbox</h1>
          <p className="muted">Signed in as {session.user.email}</p>
        </div>
        <button className="secondary-button" type="button" onClick={signOut}>
          Sign out
        </button>
      </header>

      <section className="toolbar" aria-label="Feedback filters">
        <label>
          Category
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {[allStatuses, 'Pending', 'Reviewed'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error && <p className="error-message">{error}</p>}
      {loading && <p className="muted">Loading feedback...</p>}

      {!loading && (
        <section className="feedback-list" aria-label="Submitted feedback">
          {filteredFeedback.length === 0 ? (
            <div className="empty-state">No feedback matches the selected filters.</div>
          ) : (
            filteredFeedback.map((item) => (
              <FeedbackItem
                key={item.id}
                item={item}
                onUpdate={updateLocalItem}
                onDelete={removeLocalItem}
              />
            ))
          )}
        </section>
      )}
    </main>
  )
}
