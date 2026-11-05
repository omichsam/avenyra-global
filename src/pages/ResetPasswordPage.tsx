import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, resetPassword } from '../lib/api'
import { usePageMeta } from '../lib/usePageMeta'

export default function ResetPasswordPage() {
  usePageMeta({ title: 'Choose a new password', noindex: true })
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setBusy(true)
    try {
      await resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (requestError) {
      // Covers both "invalid" and "expired" — the backend intentionally
      // doesn't distinguish, since a token can go from valid to expired
      // between the click and the submit.
      setError(requestError instanceof ApiError ? requestError.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="form-page">
      <section className="form-card">
        <Link to="/" className="form-brand">Avenyra Global</Link>
        {!token ? <>
          <h1>Reset link incomplete</h1>
          <p>This reset link is missing its token. Please request a new one.</p>
          <Link to="/forgot-password">Request a new link</Link>
        </> : done ? <>
          <h1>Password reset</h1>
          <p className="form-message" role="status">Your password has been updated. Redirecting you to log in…</p>
          <Link to="/login">Go to log in</Link>
        </> : <>
          <h1>Choose a new password</h1>
          <p>Use at least 8 characters.</p>
          <form onSubmit={submit}>
            <label>New password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete="new-password" required /></label>
            <label>Confirm new password<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} autoComplete="new-password" required /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" disabled={busy}>{busy ? 'Resetting…' : 'Reset password'}</button>
          </form>
          <Link to="/login">Back to log in</Link>
        </>}
      </section>
    </main>
  )
}
