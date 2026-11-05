import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError, changePassword, deleteAccount, updateProfile } from '../lib/api'
import { usePageMeta } from '../lib/usePageMeta'

export default function AccountPage() {
  usePageMeta({ title: 'Account & security', noindex: true })
  const { user, updateUser, logout } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    await run(async () => {
      const updated = await updateProfile({ full_name: fullName, email })
      updateUser(updated)
      setMessage('Profile updated.')
    })
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault()
    if (newPassword.length < 8) { setError('New password must be at least 8 characters.'); return }
    await run(async () => {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setMessage('Password updated.')
    })
  }

  async function removeAccount(event: FormEvent) {
    event.preventDefault()
    if (!window.confirm('Permanently delete your account and application? This cannot be undone.')) return
    await run(async () => {
      await deleteAccount(deletePassword)
      logout()
    })
  }

  async function run(action: () => Promise<void>) {
    setError('')
    setMessage('')
    setBusy(true)
    try {
      await action()
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Could not update your account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="workflow-page">
      <Link to={user?.role === 'admin' || user?.role === 'superadmin' ? '/admin/dashboard' : '/dashboard'}>← Back</Link>
      <h1>Account &amp; security</h1>
      <section className="workflow-card">
        <h2>Profile</h2>
        <form onSubmit={saveProfile}>
          <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <button type="submit" disabled={busy}>Save profile</button>
        </form>
      </section>
      <section className="workflow-card">
        <h2>Change password</h2>
        <form onSubmit={savePassword}>
          <label>Current password<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label>
          <label>New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} autoComplete="new-password" required /></label>
          <button type="submit" disabled={busy}>Change password</button>
        </form>
      </section>
      {user?.role === 'applicant' && <section className="workflow-card">
        <h2>Delete account</h2>
        <p>Permanently remove your account, application, answers and uploaded files.</p>
        <form onSubmit={removeAccount}>
          <label>Confirm with your password<input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} autoComplete="current-password" required /></label>
          <button type="submit" className="button-danger" disabled={busy}>Delete my account</button>
        </form>
      </section>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-message" role="status">{message}</p>}
      <button className="button-secondary" onClick={logout}>Log out</button>
    </main>
  )
}
