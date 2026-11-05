import { useEffect, useState, type FormEvent } from 'react'
import styles from '../admin/admin-common.module.css'
import { useAuth } from '../../context/AuthContext'
import { ApiError, superadminCreateUser, superadminDeleteUser, superadminListUsers, superadminUpdateUser } from '../../lib/api'
import type { AdminAccount, UserRole } from '../../lib/types'
import { usePageMeta } from '../../lib/usePageMeta'

export default function UsersPage() {
  usePageMeta({ title: 'User management', noindex: true })
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminAccount[]>([])
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('admin')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    return superadminListUsers()
      .then(setUsers)
      .catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : 'Could not load user accounts.'))
  }

  useEffect(() => { void load() }, [])

  async function create(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await superadminCreateUser({ email, full_name: fullName, password, role })
      setEmail('')
      setFullName('')
      setPassword('')
      await load()
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Could not create the account.')
    } finally { setBusy(false) }
  }

  async function toggleActive(user: AdminAccount) {
    setError('')
    try {
      await superadminUpdateUser(user.id, { is_active: !user.is_active })
      await load()
    } catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : 'Could not update the account.') }
  }

  async function remove(user: AdminAccount) {
    if (!window.confirm(`Delete the account for ${user.email}?`)) return
    setError('')
    try {
      await superadminDeleteUser(user.id)
      await load()
    } catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : 'Could not delete the account.') }
  }

  async function changeRole(user: AdminAccount, role: UserRole) {
    if (!window.confirm(`Change ${user.email} from ${user.role} to ${role}?`)) return
    setError('')
    try {
      await superadminUpdateUser(user.id, { role })
      await load()
    } catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : 'Could not update role.') }
  }

  return (
    <div>
      <div className={styles.pageHeader}><div><h1>User management</h1><p className={styles.pageSubtitle}>Create and manage user accounts and roles.</p></div></div>
      {error && <p className={styles.errorText} role="alert">{error}</p>}
      <section className={styles.panel} style={{ marginBottom: 24 }}>
        <h2>Create staff account</h2>
        <p className={styles.pageSubtitle}>To add an applicant, use Applicants → Add applicant.</p>
        <form onSubmit={create}>
          <div className={styles.field}><label htmlFor="user-name">Full name</label><input id="user-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required /></div>
          <div className={styles.field}><label htmlFor="user-email">Email</label><input id="user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className={styles.field}><label htmlFor="user-password">Temporary password</label><input id="user-password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          <div className={styles.field}><label htmlFor="user-role">Role</label><select id="user-role" value={role} onChange={(event) => setRole(event.target.value as UserRole)}><option value="admin">Admin</option><option value="superadmin">Superadmin</option></select></div>
          <button type="submit" className={styles.primaryBtn} disabled={busy}>{busy ? 'Creating…' : 'Create user'}</button>
        </form>
      </section>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{users.map((user) => {
            // Changing, deactivating or deleting your own account here could
            // leave no superadmin able to sign in.
            const isSelf = user.id === currentUser?.id
            return <tr key={user.id}>
              <td>{user.full_name}{isSelf && ' (you)'}</td><td>{user.email}</td>
              <td><select aria-label={`Role for ${user.email}`} value={user.role} disabled={isSelf} onChange={(event) => void changeRole(user, event.target.value as UserRole)}>
                <option value="applicant">Applicant</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option>
              </select></td>
              <td>{user.is_active ? 'Active' : 'Inactive'}</td>
              <td>{isSelf ? 'You' : <>
                <button className={styles.iconBtn} onClick={() => void toggleActive(user)}>{user.is_active ? 'Deactivate' : 'Activate'}</button>{' '}
                <button className={styles.iconBtn} onClick={() => void remove(user)}>Delete</button>
              </>}</td>
            </tr>
          })}</tbody>
        </table>
        {users.length === 0 && <div className={styles.emptyState}>No accounts found.</div>}
      </div>
    </div>
  )
}
