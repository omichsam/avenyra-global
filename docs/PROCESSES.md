# Avenyra Global: system processes

How the website, the three portals and the backend work together, step by step. For setup, commands and project layout, see the [README](../README.md).

The backend is a separate FastAPI service on Render (`https://avenyar-global-server.onrender.com`, API reference at `/docs`) and is not in this repository. Everything below about the backend is described from how this website calls it; confirm details against the backend code before changing it.

## Contents

1. [System overview](#1-system-overview)
2. [Roles and access](#2-roles-and-access)
3. [Public website](#3-public-website)
4. [Accounts and sign-in](#4-accounts-and-sign-in)
5. [Applicant portal](#5-applicant-portal)
6. [Admin portal](#6-admin-portal)
7. [Superadmin](#7-superadmin)
8. [CV upload flow](#8-cv-upload-flow)
9. [Deployment and hosting](#9-deployment-and-hosting)
10. [Go-live checklist](#10-go-live-checklist)
11. [API endpoint reference](#11-api-endpoint-reference)
12. [Known gaps](#12-known-gaps)

## 1. System overview

| Part | What it does | Where it lives |
| --- | --- | --- |
| Website | Public pages plus the applicant, admin and superadmin portals | This repository; hosted on Vercel and GitHub Pages |
| Backend API | Sign-in, data, permissions, emails | FastAPI on Render (separate repository) |
| Database | Users, applications, answers, career fields, questions, FAQ, leadership | Behind the API |
| File storage | Applicant CVs | S3-compatible bucket; the browser uploads directly using temporary links from the API |
| Email | Password reset links | Sent by the backend |

**Sign-in:** the API returns an access token at login. The website keeps it in the browser (`localStorage`) and sends it with every request as `Authorization: Bearer <token>`. If the API answers `401` on a non-auth request, the website signs the user out and asks them to log in again.

**Cold starts:** the backend runs on Render's free tier and sleeps when idle. The first request after a quiet period can take about 30 seconds. Every page load pings `/health` so the server starts waking early, and network failures show "It may be starting up. Please try again in a few seconds."

**Errors:** the API returns `detail` as a message (app errors) or a list of field errors (validation, `422`). `formatErrorDetail` in `src/lib/api.ts` turns either into a readable message.

## 2. Roles and access

| Role | Can use | Home after login |
| --- | --- | --- |
| Applicant | `/dashboard`, `/apply`, `/account` | `/dashboard` |
| Admin | `/admin/dashboard`, `/admin/applicants`, `/admin/builder`, `/account` | `/admin/dashboard` |
| Superadmin | Everything an admin can, plus `/superadmin/users` and `/superadmin/settings` | `/admin/dashboard` |

- New sign-ups are always **applicants**. Admin and superadmin accounts are created by a superadmin (see [7.1](#71-user-management)).
- The **first superadmin** cannot be created from the website. It has to be set directly in the database or with a backend script.
- Route guards in the website (`ProtectedRoute`, `PublicOnlyRoute`) only decide what is shown. **The backend must enforce access** on every endpoint.
- Signed-in users who open `/login` or `/forgot-password` are sent to their own home page.

## 3. Public website

Pages: `/` (home), `/partners`, `/legal/privacy-policy`, `/legal/candidate-privacy-notice`, `/legal/cookie-policy`, `/legal/terms`. These are prerendered to static HTML at build time (see README, "SEO and prerendering").

### 3.1 Managed homepage content
1. On load, the homepage requests `GET /site/faq` and `GET /site/leadership`.
2. Only items with `is_active: true` are shown, sorted by `order_index`.
3. **FAQ:** if nothing is published, or the request fails, the built-in questions in `src/components/content.ts` are shown.
4. **Leadership:** the section stays hidden until at least one active member exists.

### 3.2 Enquiry form ("Book a consultation")
This does **not** use the backend.
1. The visitor fills in name, work email, company, country, service, team size, start date and message, and ticks the consent box.
2. If `VITE_CONTACT_ENDPOINT` is set, the form POSTs the fields as JSON to that address (a form service or a future backend route) and shows a confirmation.
3. If it is not set, the website opens an email draft to `info@avenyraglobal.com` with the details filled in; nothing is sent until the visitor sends that email.
4. If the POST fails, the visitor is offered the email draft instead.

## 4. Accounts and sign-in

### 4.1 Register (applicants)
1. Visitor opens `/login`, switches to "Create an account", enters full name, email and a password (minimum 8 characters) and accepts the terms.
2. Website calls `POST /auth/register`, then logs in automatically.
3. The new applicant lands on `/dashboard`.

### 4.2 Log in
1. `POST /auth/login` with email and password returns `access_token`.
2. Website calls `GET /auth/me` to load the user and role.
3. User is sent to their home page for their role.

### 4.3 Forgot and reset password
1. User enters their email on `/forgot-password`; website calls `POST /auth/forgot-password`.
2. The backend emails a reset link containing a token. The link must point to the site's reset page: `https://<site>/reset-password?token=...` (on GitHub Pages: `https://omichsam.github.io/avenyra-global/reset-password?token=...`).
3. User opens the link and sets a new password; website calls `POST /auth/reset-password`.
4. On success the user is sent to `/login` after two seconds. An invalid or expired link shows an error and a way to request a new one.

`/reset-password` works whether or not the user is signed in, because the email may be opened in a different browser.

### 4.4 Account settings (`/account`, all roles)
- **Edit profile:** name and email, `PATCH /auth/me`.
- **Change password:** current and new password, `POST /auth/change-password`.
- **Delete account:** confirmed with the password, `DELETE /auth/me`; the user is signed out.

A wrong password on these returns `401`, which shows an error but does **not** sign the user out.

### 4.5 Session expiry
When any non-auth request returns `401`, the website clears the token, signs the user out and returns them to `/login`.

## 5. Applicant portal

### 5.1 Dashboard (`/dashboard`)
Shows the applicant's progress: career field, contact details, CV and screening answers, with a link into the application. After submission it shows the submitted date and "We'll be in touch with next steps."

### 5.2 Application (`/apply`)
A five-step form. Each step saves as the applicant moves on.

| Step | What the applicant does | API |
| --- | --- | --- |
| 1. Career field | Picks one active career field | `GET /categories`, `PUT /application/me` |
| 2. Contact details | Phone and location | `PUT /application/me` |
| 3. Resume | Uploads a CV (see [section 8](#8-cv-upload-flow)) | `/uploads/*` |
| 4. Screening questions | Answers each active question | `GET /questions`, `POST /answers` |
| 5. Review & submit | Checks everything and submits | `POST /application/me/submit` |

**Submission rules:**
- Only the **career field is required** by the backend. Missing contact details, CV or answers produce a warning; the applicant can confirm and submit anyway ("Complete applications are reviewed first").
- After submission the application **cannot be edited** by the applicant. `submitted_at` is set and the dashboard shows the submitted state.
- Saved progress is loaded on return with `GET /application/me`, `GET /answers/me` and `GET /uploads/me`.

## 6. Admin portal

### 6.1 Dashboard (`/admin/dashboard`)
`GET /admin/dashboard-stats` returns total applicants, submitted count, in-progress count, applicants per career field and the most recent applicants.

### 6.2 Applicant list (`/admin/applicants`)
1. `GET /admin/applicants` with optional filters: `category_id`, `location`, `submitted_from`, `submitted_to`.
2. The table shows name, email, career field, location, submitted date and status. Empty values show "Not selected", "Not provided" or "Not submitted".
3. Admins can **create an applicant** directly (`POST /admin/applicants` with name, email and password), for example for someone applying by phone or email.

### 6.3 Applicant detail (`/admin/applicants/:id`)
1. `GET /admin/applicants/{id}` returns the profile, application, answers and uploads. Each upload includes a temporary `download_url` for the CV.
2. Admins can:
   - edit the applicant's name or email, or deactivate/reactivate the account: `PATCH /admin/applicants/{id}`
   - correct the application (career field, phone, location): `PATCH /admin/applicants/{id}/application`
   - download the CV in a new tab. Each click re-fetches the applicant detail to get a fresh temporary link, so a page left open for a while still downloads correctly.

### 6.4 Career builder (`/admin/builder`)
Defines what applicants are asked.
- **Career fields:** add, rename, reorder (move up/down), show/hide (`is_active`) and delete. API: `/admin/categories`.
- **Screening questions:** same actions. API: `/admin/questions`.
- Applicants only see **active** fields and questions, in `order_index` order. Hiding is safer than deleting once applicants have used an item.

## 7. Superadmin

### 7.1 User management (`/superadmin/users`)
- List all accounts: `GET /superadmin/users`.
- Create an account with a chosen role (applicant, admin or superadmin): `POST /superadmin/users`.
- Change a role (asks for confirmation), activate/deactivate, or delete: `PATCH` / `DELETE /superadmin/users/{id}`.
- A superadmin cannot change the role of, deactivate or delete **their own** account; that row shows "You".

### 7.2 Site settings (`/superadmin/settings`)
Controls the homepage content described in [3.1](#31-managed-homepage-content).
- **Leadership:** name, title, bio, photo URL, order, active. API: `/superadmin/leadership`.
- **FAQ:** question, answer, order, active. API: `/superadmin/faq`.
- Changes show on the homepage on the next page load.

## 8. CV upload flow

Files go straight from the browser to storage, so large files never pass through the API server.

1. **Check in the browser:** PDF, DOC or DOCX only; not empty; at most 10 MB. Some browsers report no file type for Word files, so the type is also worked out from the file extension.
2. **Request an upload link:** `POST /uploads/presign` with file name, type and size. The API returns a temporary `upload_url` and a `storage_key`.
3. **Upload:** the browser sends the file with `PUT upload_url`.
4. **Confirm:** `POST /uploads/confirm` with the `storage_key` and file details. The API records the upload against the applicant.
5. **Download (admins):** applicant detail returns a temporary `download_url` per file.

If step 3 fails at the network level, the usual cause is the **storage bucket's CORS rules** not allowing the website's address. The applicant sees "The file couldn't be sent to storage."

## 9. Deployment and hosting

| Where | Address | Build | How it updates |
| --- | --- | --- | --- |
| Vercel | Production domain | `npm run build` | Vercel builds from the repository |
| GitHub Pages | `https://omichsam.github.io/avenyra-global/` | `npm run build:pages` | Manually: build, then push the contents of `dist/` to the `gh-pages` branch |

- `npm run build:pages` builds with the `/avenyra-global/` base path, so assets, images and routes work from the subfolder. It also writes `404.html` (so refreshing a portal page still loads the app) and `.nojekyll`. Source: `scripts/build-pages.mjs`.
- Image paths in code go through `asset()` in `src/lib/asset.ts`, so they work under either base path.
- **Every website address must be allowed by the backend's CORS settings and the storage bucket's CORS rules.** Otherwise sign-in, portal data and CV uploads fail on that address (the public pages still work, with the built-in FAQ).

## 10. Go-live checklist

**Backend (separate repository / Render)**
- [ ] Add each website address to the API's CORS allow-list (production domain, `https://omichsam.github.io`, and Vercel preview URLs if needed).
- [ ] Add the same addresses to the storage bucket's CORS rules (allow `PUT` with `Content-Type`).
- [ ] Configure the email service for password resets, and make the reset link point at the correct site address.
- [ ] Create the first superadmin account in the database.
- [ ] Consider a paid Render plan or an uptime ping to avoid 30-second cold starts.

**Portal set-up (in the website, as a superadmin)**
- [ ] Create admin accounts in User management.
- [ ] Add career fields and screening questions in Career builder.
- [ ] Publish FAQ items and leadership profiles in Site settings.

**Website configuration**
- [ ] Set `VITE_CONTACT_ENDPOINT` if enquiries should be collected rather than sent as email drafts.
- [ ] Publish the legal texts in `src/components/legal.ts` (README, "Legal pages").

**End-to-end test**
- [ ] Register as an applicant, complete all five steps, upload a CV and submit.
- [ ] As an admin, find the applicant, open the detail page and download the CV.
- [ ] Request a password reset and complete it from the email.

## 11. API endpoint reference

All paths are relative to the API base URL (`VITE_API_URL`, default `https://avenyar-global-server.onrender.com`). Auth column: **public** (no token), **user** (any signed-in user), **applicant**, **admin** (admin or superadmin), **superadmin**.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | public | Wake-up / health check |
| GET | `/site/faq` | public | Published FAQ items |
| GET | `/site/leadership` | public | Published leadership profiles |
| POST | `/auth/register` | public | Create an applicant account |
| POST | `/auth/login` | public | Get an access token |
| POST | `/auth/forgot-password` | public | Email a reset link |
| POST | `/auth/reset-password` | public | Set a new password with the emailed token |
| GET | `/auth/me` | user | Current user and role |
| PATCH | `/auth/me` | user | Update name or email |
| DELETE | `/auth/me` | user | Delete own account (password required) |
| POST | `/auth/change-password` | user | Change password |
| GET | `/categories` | applicant | Active career fields |
| GET | `/questions` | applicant | Active screening questions |
| GET | `/application/me` | applicant | Own application |
| PUT | `/application/me` | applicant | Save career field, phone, location |
| POST | `/application/me/submit` | applicant | Submit the application |
| POST | `/answers` | applicant | Save screening answers |
| GET | `/answers/me` | applicant | Own answers |
| POST | `/uploads/presign` | applicant | Get a temporary upload link |
| POST | `/uploads/confirm` | applicant | Record a completed upload |
| GET | `/uploads/me` | applicant | Own uploads |
| GET | `/admin/dashboard-stats` | admin | Dashboard figures |
| GET | `/admin/applicants` | admin | Applicant list (filters: `category_id`, `location`, `submitted_from`, `submitted_to`) |
| POST | `/admin/applicants` | admin | Create an applicant |
| GET | `/admin/applicants/{id}` | admin | Applicant detail with CV download links |
| PATCH | `/admin/applicants/{id}` | admin | Edit applicant or set active/inactive |
| PATCH | `/admin/applicants/{id}/application` | admin | Edit an applicant's application |
| GET / POST | `/admin/categories` | admin | List / create career fields |
| PATCH / DELETE | `/admin/categories/{id}` | admin | Update / delete a career field |
| GET / POST | `/admin/questions` | admin | List / create screening questions |
| PATCH / DELETE | `/admin/questions/{id}` | admin | Update / delete a question |
| GET / POST | `/superadmin/users` | superadmin | List / create accounts with any role |
| PATCH / DELETE | `/superadmin/users/{id}` | superadmin | Change role or status / delete |
| GET / POST | `/superadmin/faq` | superadmin | List / create FAQ items |
| PATCH / DELETE | `/superadmin/faq/{id}` | superadmin | Update / delete an FAQ item |
| GET / POST | `/superadmin/leadership` | superadmin | List / create leadership profiles |
| PATCH / DELETE | `/superadmin/leadership/{id}` | superadmin | Update / delete a profile |

The website's calls are all in `src/lib/api.ts`; response shapes are in `src/lib/types.ts`.

## 12. Known gaps

These need backend work (also listed in the README):

- No application status workflow (shortlisted, rejected and so on), admin notes, or notification emails to applicants and admins.
- Applicants cannot withdraw an application or delete an uploaded file.
- The applicant list has no paging or name/email search.
- Signup consent is required in the website but not stored by the backend.
- Leadership photos are pasted URLs rather than uploads.
- Access tokens are kept in `localStorage`; httpOnly cookies would be safer.
- The enquiry form has no backend route yet (see [3.2](#32-enquiry-form-book-a-consultation)).
