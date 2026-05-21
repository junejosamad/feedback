import { useEffect, useState } from 'react'
import { AdminDashboard } from './components/AdminDashboard.jsx'
import { AdminLogin } from './components/AdminLogin.jsx'
import { FeedbackForm } from './components/FeedbackForm.jsx'
import { supabase } from './supabaseClient.js'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession) setShowLogin(false)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <main className="app-shell">
        <div className="loading-panel">Loading...</div>
      </main>
    )
  }

  if (session) {
    return <AdminDashboard session={session} />
  }

  return (
    <main className="public-page">
      <section className="public-hero">
        <div className="hero-copy">
          <p className="eyebrow">BSE-6 Anonymous Feedback</p>
          <h1>Anonymous Feedback Box</h1>
          <p>
            Share course feedback without signing in. Messages go straight to the private admin dashboard.
          </p>
        </div>
        <button className="text-button" type="button" onClick={() => setShowLogin(true)}>
          Admin login
        </button>
      </section>

      <FeedbackForm />

      {showLogin && <AdminLogin onClose={() => setShowLogin(false)} />}
    </main>
  )
}
