// Build-time renderer for public pages, used by scripts/prerender.mjs. It must
// produce the same tree as main.tsx so the browser can hydrate the HTML.
// Not a component module, so the dev-only fast-refresh rule doesn't apply.
/* eslint-disable react/only-export-components */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ROUTER_BASENAME } from './lib/asset'

export {
  canonicalUrl,
  DEFAULT_DESCRIPTION,
  fullTitle,
  ORGANIZATION_JSON_LD,
  PRERENDER_ROUTES,
  SITE_URL,
} from './lib/seo'

export function render(url: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter basename={ROUTER_BASENAME} location={ROUTER_BASENAME + url}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StaticRouter>
    </StrictMode>,
  )
}
