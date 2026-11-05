import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from '../pages/admin/admin-common.module.css'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="admin-layout">
      <header className="admin-header">
        <strong>Avenyra <span>Admin</span></strong>
        <nav aria-label="Admin navigation">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/applicants">Applicants</NavLink>
          <NavLink to="/admin/builder">Career builder</NavLink>
          {user?.role === 'superadmin' && <>
            <NavLink to="/superadmin/users">Users</NavLink>
            <NavLink to="/superadmin/settings">Site settings</NavLink>
          </>}
        </nav>
        <div className="admin-header-actions">
          <NavLink to="/account" title={user?.email}>Account</NavLink>
          <button className={styles.secondaryBtn} onClick={logout}>Log out</button>
        </div>
      </header>
      <main className="admin-content"><Outlet /></main>
    </div>
  )
}
