import { legalDocuments } from '../components/legal'
import { CONTACT, servicePillars } from '../components/content'

export interface PageMeta {
  title?: string
  description?: string
  noindex?: boolean
}

export const SITE_URL = 'https://avenyraglobal.com'
export const SITE_NAME = 'Avenyra Global'
// Leads with the services people search for, then the brand. Kept under ~60
// characters so search results show it in full.
export const DEFAULT_TITLE = `${SITE_NAME} | Recruitment, Staffing & Payroll in Kenya`
// Kept under ~160 characters so search results show it in full.
export const DEFAULT_DESCRIPTION =
  'Kenya-based recruitment, remote staffing, HR outsourcing, payroll coordination and EOR support from Nairobi, for Kenyan and international organizations.'
export const OG_IMAGE = `${SITE_URL}/og-image.png`
export const OG_IMAGE_ALT = 'Avenyra Global: recruitment, staffing, HR and payroll support in Kenya.'

export function fullTitle(meta: PageMeta) {
  return meta.title ? `${meta.title} | ${SITE_NAME}` : DEFAULT_TITLE
}

export function canonicalUrl(pathname: string) {
  return `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`
}

export const HOME_META: PageMeta = {}

export const PARTNERS_META: PageMeta = {
  title: 'Partner With Us',
  description:
    'Partner with Avenyra Global: we work with trusted specialists and service providers to support organizations building and managing teams in Kenya.',
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

// ---------- Structured data (schema.org JSON-LD) ----------
// Helps search engines understand who Avenyra is, what it offers and how pages
// relate. Injected into each prerendered page by scripts/prerender.mjs.

const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

// Who Avenyra is, how to reach them, and the services they offer.
export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'EmploymentAgency',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.svg`,
  image: OG_IMAGE,
  slogan: 'New Avenues. Shared Growth.',
  description: DEFAULT_DESCRIPTION,
  email: CONTACT.email,
  telephone: CONTACT.phone.replace(/\s/g, ''),
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nairobi',
    addressCountry: 'KE',
  },
  areaServed: { '@type': 'Country', name: 'Kenya' },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: CONTACT.email,
    telephone: CONTACT.phone.replace(/\s/g, ''),
    areaServed: 'KE',
    availableLanguage: ['English'],
  },
  knowsAbout: ['Recruitment', 'Remote staffing', 'HR outsourcing', 'Payroll coordination', 'Employer of record support'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Workforce solutions',
    itemListElement: servicePillars.map((pillar) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: pillar.title,
        description: pillar.description,
        areaServed: { '@type': 'Country', name: 'Kenya' },
        provider: { '@id': ORGANIZATION_ID },
      },
    })),
  },
}

export const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  inLanguage: 'en',
  publisher: { '@id': ORGANIZATION_ID },
}

// Home > page trail, shown by search engines instead of the raw URL.
function breadcrumbJsonLd(pathname: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name, item: canonicalUrl(pathname) },
    ],
  }
}

// All structured data blocks for one prerendered page.
export function structuredData(pathname: string, meta: PageMeta): object[] {
  if (pathname === '/') return [ORGANIZATION_JSON_LD, WEBSITE_JSON_LD]
  return [breadcrumbJsonLd(pathname, meta.title ?? SITE_NAME)]
}
