import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './LandingPage.module.css';
import { ArrowRightIcon, CheckIcon, CoinsIcon, PinIcon, TeamIcon } from './icons';

const ORANGE = '#DF6E28';
const PERIWINKLE = '#7149CC';

type Highlight = { title: string; detail: string; icon: ReactNode; tone: string };

const HIGHLIGHTS: Highlight[] = [
  { title: 'Payroll, coordinated.', detail: 'Statutory and compliant payroll, handled locally.', icon: <CoinsIcon />, tone: ORANGE },
  { title: 'Teams, deployed.', detail: 'EOR support and staffing for teams in Kenya.', icon: <TeamIcon />, tone: PERIWINKLE },
  { title: 'Growth, disciplined.', detail: 'Advisory-led structure as your workforce grows.', icon: <CheckIcon />, tone: ORANGE },
];

const STEP_MS = 3000;

// A single summary panel of the three service highlights. Each row is
// highlighted in turn; no imagery.
export default function HeroShowcase() {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  // Skipped for reduced motion, and paused while the hero is off screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(root);
    const timer = window.setInterval(() => {
      if (visible) setActive((current) => (current + 1) % HIGHLIGHTS.length);
    }, STEP_MS);
    return () => {
      window.clearInterval(timer);
      io.disconnect();
    };
  }, []);

  return (
    <div className={styles.heroShowcase} ref={rootRef}>
      <div className={styles.heroPanel}>
        <div className={styles.heroPanelHead}>
          <span className={styles.heroPanelTitle}>How we support you</span>
          <span className={styles.heroPanelChip}><PinIcon size={13} /> Nairobi, Kenya</span>
        </div>

        <ol className={styles.heroPanelList}>
          {HIGHLIGHTS.map((item, i) => (
            <li
              key={item.title}
              className={`${styles.heroRow} ${active === i ? styles.heroRowActive : ''}`}
              style={{ '--tone': item.tone } as CSSProperties}
              onMouseEnter={() => setActive(i)}
            >
              <span className={styles.heroRowIcon}>{item.icon}</span>
              <span className={styles.heroRowText}>
                <span className={styles.heroRowStep}>0{i + 1}</span>
                <b>{item.title}</b>
                <small>{item.detail}</small>
              </span>
            </li>
          ))}
        </ol>

        <div className={styles.heroPanelFoot}>
          <span>Recruitment · Staffing · HR · Payroll</span>
          <a href="#solutions" className={styles.heroPanelLink}>
            All solutions <ArrowRightIcon size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
