import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, forgotPassword } from '../lib/api'
import { usePageMeta } from '../lib/usePageMeta'

export default function ForgotPasswordPage() {
  usePageMeta({ title: 'Reset your password', noindex: true })
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const result = await forgotPassword(email)
      setMessage(result.message || 'If an account exists for this email, password reset instructions will be sent.')
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to request a reset. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="form-page">
      <section className="form-card">
        <Link to="/" className="form-brand">Avenyra Global</Link>
        <h1>Reset your password</h1>
        <p>Enter the email address associated with your account.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="form-message" role="status">{message}</p>}
          <button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
        <Link to="/login">Back to log in</Link>
      </section>
    </main>
  )
}
