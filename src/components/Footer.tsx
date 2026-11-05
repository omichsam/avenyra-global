import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';
import { LogoMark, ArrowRightIcon, PinIcon, PhoneIcon, EnvelopeIcon } from './icons';
import { legalDocuments } from './legal';
import { servicePillars, CONTACT } from './content';


const ArrowUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 13V3M8 3 4 7M8 3l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <div className={styles.footCta}>
          <div>
            <span className={styles.footCtaEyebrow}>Let&rsquo;s talk</span>
            <h2>Ready to build your team in Kenya?</h2>
            <p>Tell us what you need. We&rsquo;ll come back with a clear, compliant plan.</p>
          </div>
          <div className={styles.footCtaActions}>
            <Link to="/#contact" className={`${styles.btn} ${styles.btnPrimary}`}>
              Book a Consultation <ArrowRightIcon />
            </Link>
            <a href={`mailto:${CONTACT.email}`} className={styles.footCtaMail}>
              <EnvelopeIcon /> {CONTACT.email}
            </a>
          </div>
        </div>

        <div className={styles.footTop}>
          <div className={styles.footBrand}>
            <Link to="/" className={styles.brand} aria-label="Avenyra Global home">
              <LogoMark size={52} className={styles.footLogo} />
              <span className={styles.brandWord}>
                Avenyra
                <span>Global</span>
              </span>
            </Link>
            <p>Human Capital, Global Workforce, and Technology Advisory.</p>
            <p className={styles.footMotto}>New Avenues. Shared Growth.</p>
          </div>

          <nav className={styles.footCol} aria-label="Solutions">
            <h2>Solutions</h2>
            <ul>
              {servicePillars.map((pillar) => (
                <li key={pillar.id}><Link to={`/#${pillar.id}`}>{pillar.title}</Link></li>
              ))}
            </ul>
          </nav>

          <nav className={styles.footCol} aria-label="Company">
            <h2>Company</h2>
            <ul>
              <li><Link to="/#who-we-serve">Who We Serve</Link></li>
              <li><Link to="/#how-we-work">How We Work</Link></li>
              <li><Link to="/#why-kenya">Why Kenya</Link></li>
              <li><Link to="/partners">Partners</Link></li>
              <li><Link to="/#faq">FAQ</Link></li>
              <li><Link to="/login">Log In</Link></li>
            </ul>
          </nav>

          <div className={styles.footCol}>
            <h2>Get in Touch</h2>
            <ul className={styles.footContact}>
              <li><span className={styles.footContactIcon}><PinIcon /></span>{CONTACT.location}</li>
              <li>
                <span className={styles.footContactIcon}><PhoneIcon /></span>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a>
              </li>
              <li>
                <span className={styles.footContactIcon}><EnvelopeIcon /></span>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footBottom}>
          {/* The prerendered year can lag the visitor's clock; let React fix it quietly. */}
          <p suppressHydrationWarning>© {new Date().getFullYear()} Avenyra Global. All rights reserved.</p>
          <div className={styles.footLegal}>
            {legalDocuments.map((doc) => (
              <Link key={doc.slug} to={`/legal/${doc.slug}`}>{doc.title}</Link>
            ))}
          </div>
          <button
            type="button"
            className={styles.footTopBtn}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top <ArrowUpIcon />
          </button>
        </div>
      </div>
    </footer>
  );
}
