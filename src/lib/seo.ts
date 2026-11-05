import { legalDocuments } from '../components/legal'

export interface PageMeta {
  title?: string
  description?: string
  noindex?: boolean
}

export const SITE_URL = 'https://avenyraglobal.com'
export const SITE_NAME = 'Avenyra Global'
export const DEFAULT_TITLE = `${SITE_NAME} | Build Your Team in Kenya`
export const DEFAULT_DESCRIPTION =
  'Recruitment, remote staffing, HR and payroll coordination for Kenyan and international organizations. Kenya-based workforce expertise from Avenyra Global.'

export function fullTitle(meta: PageMeta) {
  return meta.title ? `${meta.title} | ${SITE_NAME}` : DEFAULT_TITLE
}

export function canonicalUrl(pathname: string) {
  return `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`
}

export const HOME_META: PageMeta = {}

export const PARTNERS_META: PageMeta = {
  title: 'Partners',
  description: 'Partner with Avenyra Global to support organizations building and managing teams in Kenya.',
}

// Legal pages stay out of search results until their approved text is in
// place; a "being finalised" placeholder is thin content.
export function legalMeta(slug: string | undefined): PageMeta {
  const doc = legalDocuments.find((item) => item.slug === slug)
  if (!doc) return { title: 'Page not found', noindex: true }
  return { title: doc.title, description: doc.summary, noindex: doc.sections.length === 0 }
}

// Public pages that get static HTML at build time (see scripts/prerender.mjs).
// Indexable ones also go into the generated sitemap.xml.
export const PRERENDER_ROUTES: { path: string; meta: PageMeta }[] = [
  { path: '/', meta: HOME_META },
  { path: '/partners', meta: PARTNERS_META },
  ...legalDocuments.map((doc) => ({ path: `/legal/${doc.slug}`, meta: legalMeta(doc.slug) })),
]

// schema.org data for search engines: who Avenyra is and how to reach them.
export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'EmploymentAgency',
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.svg`,
  image: `${SITE_URL}/og-image.png`,
  slogan: 'New Avenues. Shared Growth.',
  description: DEFAULT_DESCRIPTION,
  email: 'info@avenyraglobal.com',
  telephone: '+254753590369',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nairobi',
    addressCountry: 'KE',
  },
  areaServed: 'KE',
  knowsAbout: ['Recruitment', 'Remote staffing', 'HR outsourcing', 'Payroll coordination', 'Employer of record support'],
}
