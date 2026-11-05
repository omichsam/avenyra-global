# Avenyra Global — website & applicant portal

The public marketing site for Avenyra Global plus the applicant and admin portal: applicants register, choose a career field, upload a CV, answer screening questions and submit; admins review applicants and manage the application form; superadmins manage staff accounts and homepage content.

React 19 + TypeScript + Vite, deployed on Vercel. The API is a separate FastAPI service ([avenyar-global-server on Render](https://avenyar-global-server.onrender.com/docs)) and is **not** in this repository.

**How the portals and backend work, step by step:** see [docs/PROCESSES.md](docs/PROCESSES.md) (sign-in, applicant application, admin review, superadmin tools, CV uploads, API endpoints and a go-live checklist).

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

In development, API calls go to `/api/*` on the Vite server, which proxies them to the live backend (see `vite.config.ts`). This is needed because the backend's CORS allow-list only includes the production domains. To point at a local backend instead, set `API_PROXY_TARGET=http://localhost:8000` in `.env`.

The backend is on Render's free tier and sleeps when idle — the first request after a while can take ~30 seconds. The app pings `/health` on load to start it waking early.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with the API proxy |
| `npm run build` | Type-check, build to `dist/`, then prerender the public pages (see SEO below) |
| `npm run build:pages` | Same build for GitHub Pages, served from `/avenyra-global/` (see docs/PROCESSES.md, section 9) |
| `npm run preview` | Serve the production build locally (its fallback differs from Vercel's; see SEO) |
| `npm test` | Run unit tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with oxlint |

## Configuration

Copy `.env.example` to `.env` and set what you need. In Vercel, set the same names under Project → Settings → Environment Variables and redeploy.

| Variable | Used for |
| --- | --- |
| `VITE_API_URL` | Backend URL for production builds. Defaults to the Render deployment. |
| `VITE_CONTACT_ENDPOINT` | Where the homepage enquiry form POSTs JSON (a backend route or a form service such as Formspree). **While unset, the form only opens an email draft.** |
| `API_PROXY_TARGET` | Dev only: where the `/api` proxy forwards to. |

## Project layout

```
src/
  App.tsx                 Routes and role-based access
  main.tsx                Entry point: fonts, error boundary, router, auth
  components/             Marketing pages (LandingPage, PartnersPage), Header/Footer,
                          AdminLayout, route guards, ErrorBoundary
    content.ts            Homepage copy (services, process, built-in FAQ)
    legal.ts              Privacy / cookie / terms text — see "Legal pages" below
  context/AuthContext.tsx Session: token storage, re-validation, expiry handling
  lib/
    api.ts                Every backend call, error formatting, upload validation
    types.ts              API response types
    ordering.ts           Move-up/down helpers for ordered admin lists
    locations.ts          Location suggestions and the phone-number pattern
    seo.ts                Public page metadata, prerender routes, structured data
    usePageMeta.ts        Keeps title, description, canonical URL in sync in the browser
  pages/                  Auth, applicant (dashboard, application, account),
                          admin/ and superadmin/ screens
public/                   Static files: photos, social image, robots.txt
scripts/prerender.mjs     Build step: static HTML for public pages + sitemap.xml
```

### Roles

- **Applicant** — `/dashboard`, `/apply`, `/account`
- **Admin** — `/admin/*`: dashboard, applicants, career builder (fields + screening questions)
- **Superadmin** — everything an admin can, plus `/superadmin/users` and `/superadmin/settings` (homepage leadership + FAQ)

Role checks in the frontend only control what's shown; the backend enforces access.

## SEO and prerendering

The public pages (`/`, `/partners`, `/legal/*`) are rendered to real HTML at build time, so search engines and link previews see content and the right title on each page. Everything else (login, dashboards, admin) is a client-side app loaded on demand.

- `src/lib/seo.ts` is the single source for public page titles and descriptions, the list of prerendered routes (`PRERENDER_ROUTES`), and the organization's structured data (schema.org JSON-LD on the homepage).
- `scripts/prerender.mjs` runs after `vite build`. It renders each route with `src/entry-server.tsx`, writes `dist/<route>.html` with that page's head tags, writes the empty shell as `dist/app.html` (noindex), and generates `dist/sitemap.xml` from indexable routes.
- `vercel.json` serves `partners.html` at `/partners` (`cleanUrls`) and rewrites every other path to `/app.html`.
- In the browser, `main.tsx` hydrates the prerendered HTML for signed-out visitors and renders from scratch otherwise.

**Adding a public page:** add its route in `App.tsx`, its metadata in `seo.ts`, and an entry in `PRERENDER_ROUTES`. Anything rendered on a public page must not touch `window`/`localStorage` during render (only in effects), because it also runs at build time.

Legal pages are `noindex` and left out of the sitemap while they show the "being finalised" placeholder; they become indexable automatically once their `sections` are filled in.

`npm run preview` falls back to `index.html` (the prerendered homepage) for unknown paths, unlike Vercel, so test signed-in routes with `npm run dev`.

## Content editing

- **Leadership and FAQ** on the homepage are managed by a superadmin in *Site settings*. The FAQ falls back to the built-in copy in `content.ts` until an item is published; the Leadership section is hidden until a member is active.
- **Career fields and screening questions** are managed by admins in *Career builder*.

### Legal pages

`/legal/privacy-policy`, `/legal/candidate-privacy-notice`, `/legal/cookie-policy` and `/legal/terms` render from `src/components/legal.ts`. Until a document's `sections` are filled in, its page shows a "being finalised" notice with a contact address. To publish one, add the approved text and set `lastUpdated`; it is then indexed and added to the sitemap on the next build.

## Known gaps (need backend work)

- No application status workflow (shortlisted, rejected…), admin notes, or emails to applicants/admins.
- Applicants can't withdraw an application or delete an uploaded file.
- The applicant list has no paging or name/email search.
- Signup consent is required in the UI but not stored by the backend.
- Leadership photos are pasted URLs rather than uploads.
- Auth tokens are kept in `localStorage`; httpOnly cookies would be safer.
- Vercel preview URLs aren't in the backend's CORS allow-list.
