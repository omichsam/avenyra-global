import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ROUTER_BASENAME } from './lib/asset.ts'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { wakeServer } from './lib/api.ts'
// Fonts are bundled with the site rather than loaded from Google Fonts, so
// visitors' IP addresses aren't sent to a third party before any consent.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/plus-jakarta-sans/800.css'
import './index.css'

wakeServer()

const app = (
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={ROUTER_BASENAME}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)

function hasSession() {
  try {
    return !!localStorage.getItem('token')
  } catch {
    return false
  }
}

// Public pages arrive as prerendered HTML (scripts/prerender.mjs) built for a
// signed-out visitor, so hydrate them. Signed-in people see a different header
// (Dashboard instead of Log in), so they get a fresh render instead, as do
// client-only routes, which arrive as the empty app shell.
const container = document.getElementById('root')!
if (container.hasChildNodes() && !hasSession()) hydrateRoot(container, app)
else createRoot(container).render(app)