import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './LandingPage.module.css';
import { ArrowRightIcon } from './icons';
import { servicePillars } from './content';

// The four solutions as tabs beside one large photo that crossfades between
// them: the same content as four stacked cards, in a fraction of the height.
// Each tab keeps its pillar id, so links such as /#solution-talent still land
// here and open that tab.
export default function SolutionsTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { hash, key: locationKey } = useLocation();

  // Synced after mount, not read during render: the prerendered HTML has no
  // hash, so choosing the tab during the first render would break hydration.
  useEffect(() => {
    const index = servicePillars.findIndex((pillar) => `#${pillar.id}` === hash);
    // eslint-disable-next-line react/set-state-in-effect
    if (index >= 0) setActive(index);
  }, [hash, locationKey]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = servicePillars.length - 1;
    const next =
      event.key === 'ArrowDown' || event.key === 'ArrowRight' ? (active === last ? 0 : active + 1)
      : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? (active === 0 ? last : active - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const pillar = servicePillars[active];

  return (
    <div className={styles.solutions}>
      <div className={styles.solutionTabs} role="tablist" aria-label="Our solutions" aria-orientation="vertical">
        {servicePillars.map((item, i) => (
          <button
            key={item.id}
            id={item.id}
            ref={(el) => { tabRefs.current[i] = el; }}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls="solution-panel"
            tabIndex={i === active ? 0 : -1}
            className={`${styles.solutionTab} ${i === active ? styles.solutionTabActive : ''}`}
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
          >
            <span className={styles.solutionTabNum}>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.solutionTabText}>
              <b>{item.title}</b>
              <small>{item.description}</small>
            </span>
            <ArrowRightIcon className={styles.solutionTabArrow} />
          </button>
        ))}
      </div>

      <div id="solution-panel" role="tabpanel" aria-labelledby={pillar.id} className={styles.solutionPanel}>
        <div className={styles.solutionMedia}>
          {servicePillars.map((item, i) => (
            <img
              key={item.id}
              src={item.image}
              alt={i === active ? item.imageAlt : ''}
              aria-hidden={i !== active}
              loading="lazy"
              className={`${styles.solutionImg} ${i === active ? styles.solutionImgActive : ''}`}
            />
          ))}
        </div>
        {/* Keyed so the text replays its entrance whenever the tab changes. */}
        <div key={pillar.id} className={styles.solutionBody}>
          <span className={styles.solutionEyebrow}>{pillar.eyebrow}</span>
          <h3>{pillar.title}</h3>
          <p>{pillar.description}</p>
          <ul className={styles.solutionList}>
            {pillar.subServices.map((sub) => (
              <li key={sub.name}>{sub.name}</li>
            ))}
          </ul>
          <a href="#contact" className={styles.solutionLink}>
            Discuss this solution <ArrowRightIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
