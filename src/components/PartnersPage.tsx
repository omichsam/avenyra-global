import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import styles from './LandingPage.module.css'
import { usePageMeta } from '../lib/usePageMeta'
import { PARTNERS_META } from '../lib/seo'

export default function PartnersPage() {
  usePageMeta(PARTNERS_META)
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.section}>
        <div className={styles.wrap}>
          <div className={styles.eyebrow}>Partner with Avenyra</div>
          <h1>Better workforce outcomes, built together.</h1>
          <p className={styles.lede}>
            We collaborate with trusted specialists and service providers to support organizations
            building and managing teams in Kenya.
          </p>
          <p>
            Interested in exploring a partnership? Tell us about your organization and the capabilities
            you bring to workforce operations.
          </p>
          <Link className={`${styles.btn} ${styles.btnPrimary}`} to="/#contact">Start a conversation</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
