// Legal page content. Each document's `sections` is empty until the approved
// text is supplied; while empty, the page shows a "being finalised" notice with
// a contact address instead of placeholder legal wording.
//
// To publish a document, set `lastUpdated` (YYYY-MM-DD) and fill `sections`,
// e.g. { heading: 'What we collect', paragraphs: ['…', '…'] }.

export interface LegalSection {
  heading: string
  paragraphs: string[]
}

export interface LegalDocument {
  slug: string
  title: string
  summary: string
  lastUpdated: string | null
  sections: LegalSection[]
}

export const PRIVACY_CONTACT = 'info@avenyraglobal.com'

export const legalDocuments: LegalDocument[] = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    summary: 'How Avenyra Global collects, uses and protects personal data from website visitors and clients.',
    lastUpdated: null,
    sections: [],
  },
  {
    slug: 'candidate-privacy-notice',
    title: 'Candidate Privacy Notice',
    summary: 'How we handle the personal data, CVs and screening answers you share when you apply through Avenyra Global.',
    lastUpdated: null,
    sections: [],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    summary: 'The cookies and similar storage this website uses, and why.',
    lastUpdated: null,
    sections: [],
  },
  {
    slug: 'terms',
    title: 'Website Terms',
    summary: 'The terms that apply when you use this website.',
    lastUpdated: null,
    sections: [],
  },
]
