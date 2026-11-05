import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import PartnersPage from './components/PartnersPage'
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute'
import NotFoundPage from './pages/NotFoundPage'
import LegalPage from './pages/LegalPage'

// Public marketing pages ship in the main bundle (and are prerendered); every
// signed-in screen loads on demand so visitors don't download the portal.
const AdminLayout = lazy(() => import('./components/AdminLayout'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const ApplicationPage = lazy(() => import('./pages/ApplicationPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const ApplicantsPage = lazy(() => import('./pages/admin/ApplicantsPage'))
const ApplicantDetailPage = lazy(() => import('./pages/admin/ApplicantDetailPage'))
const CareerBuilderPage = lazy(() => import('./pages/admin/CareerBuilderPage'))
const UsersPage = lazy(() => import('./pages/superadmin/UsersPage'))
const SiteSettingsPage = lazy(() => import('./pages/superadmin/SiteSettingsPage'))

function App() {
  return (
    <Suspense fallback={<p className="route-loading">Loading…</p>}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/legal/:slug" element={<LegalPage />} />

        {/* Public-only — logged-in users get bounced to their own home instead */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Reset password stays reachable regardless of auth state, since the
            link comes from an email and shouldn't assume which browser/session
            opens it. */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Applicant-only */}
        <Route element={<ProtectedRoute requireRole="applicant" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/apply" element={<ApplicationPage />} />
        </Route>

        {/* Any authenticated user, any role */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<AccountPage />} />
        </Route>

        {/* Admin + Superadmin — superadmins can reach everything an admin can */}
        <Route element={<ProtectedRoute requireRole={['admin', 'superadmin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/applicants" element={<ApplicantsPage />} />
            <Route path="/admin/applicants/:id" element={<ApplicantDetailPage />} />
            <Route path="/admin/builder" element={<CareerBuilderPage />} />

            {/* Superadmin-only, nested so it shares the same sidebar layout */}
            <Route element={<ProtectedRoute requireRole="superadmin" />}>
              <Route path="/superadmin/users" element={<UsersPage />} />
              <Route path="/superadmin/settings" element={<SiteSettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
