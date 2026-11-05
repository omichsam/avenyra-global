import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import styles from '../components/LandingPage.module.css'
import { legalDocuments, PRIVACY_CONTACT } from '../components/legal'
import NotFoundPage from './NotFoundPage'
import { usePageMeta } from '../lib/usePageMeta'
import { legalMeta } from '../lib/seo'

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>()
  const doc = legalDocuments.find((item) => item.slug === slug)

  usePageMeta(legalMeta(slug))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!doc) return <NotFoundPage />

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.section}>
        <article className={styles.wrap} style={{ maxWidth: 760 }}>
          <div className={styles.eyebrow}>Legal</div>
          <h1>{doc.title}</h1>
          <p className={styles.lede}>{doc.summary}</p>
          {doc.lastUpdated && <p className={styles.legalMeta}>Last updated {formatDate(doc.lastUpdated)}</p>}

          {doc.sections.length === 0 ? (
            <div className={styles.formNotice} role="status">
              <strong>This document is being finalised.</strong>
              <span>
                If you have a question about how we handle personal data in the meantime, or want to
                access, correct or delete your data, email us and we'll respond directly.
              </span>
              <a href={`mailto:${PRIVACY_CONTACT}`}>{PRIVACY_CONTACT}</a>
            </div>
          ) : (
            doc.sections.map((section) => (
              <section key={section.heading} className={styles.legalSection}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </section>
            ))
          )}

          <nav className={styles.legalNav} aria-label="Other policies">
            {legalDocuments.filter((item) => item.slug !== doc.slug).map((item) => (
              <Link key={item.slug} to={`/legal/${item.slug}`}>{item.title}</Link>
            ))}
          </nav>
        </article>
      </main>
      <Footer />
    </div>
  )
}
