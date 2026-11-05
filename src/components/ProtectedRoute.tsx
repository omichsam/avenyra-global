import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../lib/types'

export default function ProtectedRoute({ requireRole }: { requireRole?: UserRole | UserRole[] }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  if (isLoading) return <p className="route-loading">Loading your session…</p>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const roles = requireRole ? (Array.isArray(requireRole) ? requireRole : [requireRole]) : null
  if (roles && (!user || !roles.includes(user.role))) return <Navigate to={homeForRole(user?.role)} replace />
  return <Outlet />
}

export function PublicOnlyRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  if (isLoading) return <p className="route-loading">Loading your session…</p>
  if (isAuthenticated) return <Navigate to={homeForRole(user?.role)} replace />
  return children ?? <Outlet />
}

function homeForRole(role?: UserRole) {
  if (role === 'admin' || role === 'superadmin') return '/admin/dashboard'
  return '/dashboard'
}
