import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from './icons';

// All in-app links: anchors like /#faq are scrolled to by LandingPage, so
// navigating from /partners or a legal page doesn't reload the whole site.
const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Solutions', href: '/#solutions' },
  { label: 'Who We Serve', href: '/#who-we-serve' },
  { label: 'How We Work', href: '/#how-we-work' },
  { label: 'Why Kenya', href: '/#why-kenya' },
  { label: 'Partners', href: '/partners' },
  { label: 'FAQ', href: '/#faq' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const homePath = user?.role === 'admin' || user?.role === 'superadmin' ? '/admin/dashboard' : '/dashboard';

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.wrap}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.brand} aria-label="Avenyra Global home">
            <LogoMark />
            <span className={styles.brandWord}>
              Avenyra
              <span>Global</span>
            </span>
          </Link>

          <ul className={styles.navlinks}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}><Link to={link.href}>{link.label}</Link></li>
            ))}
          </ul>

          <div className={styles.navcta}>
            {isAuthenticated ? (
              <Link to={homePath} className={styles.navBtnPrimary}>
                {user?.role === 'applicant' ? 'My Application' : 'Dashboard'}
              </Link>
            ) : (
              <>
                <Link to="/login" className={styles.navBtnGhost}>
                  Log In
                </Link>
                <Link to="/login" state={{ mode: 'signup' }} className={styles.navBtnPrimary}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            className={styles.burger}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span /><span />
          </button>
        </nav>

        <div id="mobile-navigation" className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`} aria-hidden={!menuOpen}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} to={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link to={homePath} onClick={() => setMenuOpen(false)}>
              {user?.role === 'applicant' ? 'My Application' : 'Dashboard'}
            </Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/login" state={{ mode: 'signup' }} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
          <Link to="/#contact" onClick={() => setMenuOpen(false)}>Discuss Your Workforce Needs</Link>
        </div>
      </div>
    </header>
  );
}
