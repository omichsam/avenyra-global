import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError, getCurrentUser, login, register } from '../lib/api'
import { usePageMeta } from '../lib/usePageMeta'

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login: saveSession } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>(
    (location.state as { mode?: 'login' | 'signup' } | null)?.mode ?? 'login',
  )
  usePageMeta({ title: mode === 'login' ? 'Log in' : 'Create an applicant account', noindex: true })
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      // New applicants are signed straight in rather than asked to log in again.
      if (mode === 'signup') await register(email, fullName, password)
      const { access_token } = await login(email, password)
      localStorage.setItem('token', access_token)
      try {
        const user = await getCurrentUser()
        saveSession(access_token, user)
        navigate(user.role === 'admin' || user.role === 'superadmin' ? '/admin/dashboard' : '/dashboard', { replace: true })
      } catch (requestError) {
        localStorage.removeItem('token')
        throw requestError
      }
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to connect. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="form-page">
      <section className="form-card">
        <Link to="/" className="form-brand">Avenyra Global</Link>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your applicant account'}</h1>
        <p>{mode === 'login' ? 'Log in to continue to your account.' : 'Register to start an application.'}</p>
        <form onSubmit={submit}>
          {mode === 'signup' && <label>Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required /></label>}
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
          {mode === 'signup' && <label>Confirm password<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} autoComplete="new-password" required /></label>}
          {mode === 'signup' && (
            <label className="form-consent">
              <input type="checkbox" required />
              <span>
                I have read the{' '}
                <Link to="/legal/candidate-privacy-notice" target="_blank" rel="noreferrer">Candidate Privacy Notice</Link>{' '}
                and agree to Avenyra Global processing my application details, CV and screening answers for recruitment purposes.
              </span>
            </label>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        </form>
        {mode === 'login' && <Link to="/forgot-password">Forgot your password?</Link>}
        <p className="form-switch">
          {mode === 'login' ? 'New applicant? ' : 'Already registered? '}
          <button type="button" className="text-button" onClick={() => { setError(''); setMode(mode === 'login' ? 'signup' : 'login') }}>
            {mode === 'login' ? 'Create an account' : 'Log in'}
          </button>
        </p>
        <Link to="/">Back to home</Link>
      </section>
    </main>
  )
}
