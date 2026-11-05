import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './LandingPage.module.css';
import Reveal from './Reveal';
import HeroShowcase from './HeroShowcase';
import Header from './Header';
import Footer from './Footer';
import { ArrowRightIcon, CoinsIcon, CompassIcon, EnvelopeIcon, PhoneIcon, PinIcon, TeamIcon } from './icons';
import SolutionsTabs from './SolutionsTabs';
import { publicListFAQ, publicListLeadership } from '../lib/api';
import { byOrder } from '../lib/ordering';
import type { LeadershipMember } from '../lib/types';
import { usePageMeta } from '../lib/usePageMeta';
import { asset } from '../lib/asset';
import { HOME_META } from '../lib/seo';
import {
  servicePillars,
  audiences,
  processSteps,
  whyKenya,
  stripItems,
  faqs,
  CONTACT,
} from './content';

const CONTACT_EMAIL = CONTACT.email;

// Where enquiries are POSTed as JSON (a backend route, or a form service such
// as Formspree). While unset, the form falls back to opening an email draft.
const CONTACT_ENDPOINT: string | undefined = import.meta.env.VITE_CONTACT_ENDPOINT;

const ENQUIRY_FIELDS = [
  ['Name', 'fullName'],
  ['Work email', 'workEmail'],
  ['Company', 'company'],
  ['Country', 'country'],
  ['Service required', 'serviceRequired'],
  ['Approximate workforce requirement', 'requirement'],
  ['Intended start date', 'startDate'],
  ['Message', 'message'],
] as const;

type EnquiryStatus = 'idle' | 'sending' | 'sent' | 'draft' | 'error';

// Unsplash License photography (no attribution required, so no on-page credit),
// served from public/images rather than hot-linked from Unsplash.
// Sources, for our records: office and handshake by Cytonn Photography; skyline by
// Kenny Murgor; team photos by UK Black Tech and #WOCinTech Chat; desk and
// remote-work photos by Vitaly Gariev and others (all Unsplash License).
const NAIROBI_OFFICE_PHOTO = asset('/images/nairobi-office.jpg');
const NAIROBI_SKYLINE_PHOTO = asset('/images/nairobi-skyline.jpg');
const WORKFORCE_COLLEAGUES_PHOTO = asset('/images/workforce-colleagues.jpg');

const DELIVERY_POINTS = [
  {
    icon: <CompassIcon />,
    title: 'Advisory first',
    text: 'Structure and planning are agreed before execution begins.',
  },
  {
    icon: <CoinsIcon />,
    title: 'Direct coordination',
    text: 'Payroll, compliance and staffing handled together, by one team.',
  },
  {
    icon: <PinIcon size={18} />,
    title: 'Local points of contact',
    text: 'Kenya-based people you can reach, not an offshore queue.',
  },
];

export default function LandingPage() {
  usePageMeta(HOME_META);
  const [enquiryStatus, setEnquiryStatus] = useState<EnquiryStatus>('idle');
  const [enquiryMailto, setEnquiryMailto] = useState(`mailto:${CONTACT_EMAIL}`);
  // FAQ and leadership are managed in Superadmin → Site settings. The bundled
  // FAQ copy shows until the API answers, and stays if nothing is published.
  const [faqItems, setFaqItems] = useState<{ question: string; answer: string }[]>(faqs);
  const [leaders, setLeaders] = useState<LeadershipMember[]>([]);
  const { hash, key: locationKey } = useLocation();

  useEffect(() => {
    publicListFAQ()
      .then((items) => {
        const active = byOrder(items.filter((item) => item.is_active));
        if (active.length > 0) setFaqItems(active);
      })
      .catch(() => {});
    publicListLeadership()
      .then((members) => setLeaders(byOrder(members.filter((member) => member.is_active))))
      .catch(() => {});
  }, []);

  // React Router doesn't scroll to #anchors itself, whether arriving from
  // another route or clicking a header link on this page. Keyed on the
  // location so clicking the same link twice still scrolls.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash, locationKey]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = ENQUIRY_FIELDS
      .map(([label, name]) => `${label}: ${formData.get(name) || 'Not provided'}`)
      .join('\n');
    const subject = `Workforce enquiry from ${formData.get('company') || formData.get('fullName')}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setEnquiryMailto(mailto);

    if (!CONTACT_ENDPOINT) {
      window.location.href = mailto;
      setEnquiryStatus('draft');
      return;
    }

    setEnquiryStatus('sending');
    try {
      const payload = Object.fromEntries(ENQUIRY_FIELDS.map(([, name]) => [name, String(formData.get(name) ?? '')]));
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...payload, _subject: subject }),
      });
      if (!res.ok) throw new Error(`Enquiry endpoint returned ${res.status}`);
      form.reset();
      setEnquiryStatus('sent');
    } catch {
      setEnquiryStatus('error');
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      {/* ================= 1. HERO ================= */}
      <section className={styles.hero}>
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div>
            <div className={styles.eyebrow}>Kenya-based · People &amp; workforce operations</div>
            <h1>Build your team in Kenya, with local expertise.</h1>
            <p className={styles.lede}>
              Recruitment, remote staffing, HR and payroll coordination for Kenyan and international
              organizations.
            </p>
            <div className={styles.heroCtas}>
              <a href="#contact" className={`${styles.btn} ${styles.btnPrimary}`}>
                Discuss Your Workforce Needs
              </a>
              <a href="#solutions" className={`${styles.btn} ${styles.btnGhost}`}>
                Explore Our Solutions <ArrowRightIcon />
              </a>
            </div>
            <p className={styles.heroNote}>Based in Nairobi <span aria-hidden="true">·</span> Support tailored to your workforce needs</p>
          </div>

          <HeroShowcase />
        </div>
      </section>

      {/* ================= 2. TRUST STRIP ================= */}
      <div className={styles.strip}>
        <div className={styles.wrap}>
          <span className={styles.stripLabel}>New Avenues. Shared Growth.</span>
          <div className={styles.stripItems}>
            {stripItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ================= 2b. GROUNDED IN NAIROBI (real photo section) ================= */}
      <section className={styles.section} style={{ paddingTop: 88 }}>
        <div className={`${styles.wrap} ${styles.workforceSplit}`}>
          <Reveal className={styles.workforceMedia}>
            <div
              className={styles.workforcePhoto}
              style={{ backgroundImage: `url(${NAIROBI_OFFICE_PHOTO})` }}
              role="img"
              aria-label="Professional working at a laptop in a Nairobi office"
            />
            <div className={styles.workforceBadge}>
              <span className={styles.workforceBadgeIcon}><TeamIcon /></span>
              <span>
                <b>Kenya-based team</b>
                <small>Nairobi, Kenya</small>
              </span>
            </div>
          </Reveal>

          <Reveal className={styles.workforceText}>
            <div className={styles.eyebrow}>Delivered From Nairobi</div>
            <h2>Real people, coordinating real workforce operations.</h2>
            <p className={styles.workforceLede}>
              Avenyra&rsquo;s delivery is hands-on and Kenya-based, not a dashboard you&rsquo;re left to
              self-serve. Every engagement is coordinated by people who understand the local statutory and
              labor landscape.
            </p>
            <ul className={styles.workforceList}>
              {DELIVERY_POINTS.map((point) => (
                <li key={point.title}>
                  <span className={styles.workforceListIcon}>{point.icon}</span>
                  <span>
                    <b>{point.title}</b>
                    <span>{point.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <a href="#contact" className={styles.workforceLink}>
              Talk to our Nairobi team <ArrowRightIcon />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ================= 3. WHO WE SERVE × WHERE TO START (photo cards) ================= */}
      <section id="who-we-serve" className={styles.section}>
        <div className={styles.wrap}>
          <Reveal className={`${styles.secHead} ${styles.secHeadRow}`}>
            <div>
              <div className={styles.eyebrow}>Who We Serve</div>
              <h2>Kenyan and international organizations, at every stage.</h2>
            </div>
            <p>Choose the path closest to your situation. We&rsquo;ll shape the engagement from there.</p>
          </Reveal>
          <div className={styles.audienceGrid}>
            {audiences.map((item, i) => (
              <Reveal key={item.label} delay={i * 120} className={styles.audienceCard}>
                <a href="#contact" className={styles.audienceLink}>
                  <div className={styles.audienceMedia}>
                    <img src={item.image} alt={item.imageAlt} loading="lazy" />
                    <span className={styles.audienceTag}>{item.label}</span>
                  </div>
                  <div className={styles.audienceBody}>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span className={styles.audienceCta}>Get started <ArrowRightIcon size={14} /></span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4. SOLUTIONS (tabs + crossfading photo) ================= */}
      <section id="solutions" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.wrap}>
          <Reveal className={`${styles.secHead} ${styles.secHeadRow}`}>
            <div>
              <div className={styles.eyebrow}>Our Solutions</div>
              <h2>Four integrated solutions. One workforce partner.</h2>
            </div>
            <p>Engage any solution on its own, or combine them into a single managed program.</p>
          </Reveal>
          <Reveal>
            <SolutionsTabs />
          </Reveal>
        </div>
      </section>

      {/* ================= 5. HOW WE WORK (animated timeline) ================= */}
      <section id="how-we-work" className={styles.processBand}>
        <div className={styles.wrap}>
          <Reveal className={styles.processHead}>
            <div>
              <div className={`${styles.eyebrow} ${styles.eyebrowLight}`}>How We Work</div>
              <h2>Discovery to delivery, in four stages.</h2>
            </div>
            <p>A clear, structured process from the first conversation through to ongoing support.</p>
          </Reveal>

          <Reveal className={styles.timeline}>
            <div className={styles.timelineTrack} aria-hidden="true" />
            <ol className={styles.timelineSteps}>
              {processSteps.map((step, i) => (
                <li key={step.num} className={styles.timelineStep}>
                  <span className={styles.timelineNode} aria-hidden="true">{step.num}</span>
                  <h3>
                    <span className={styles.visuallyHidden}>Stage {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ================= 6. WHY KENYA (photo mosaic) ================= */}
      <section id="why-kenya" className={styles.section}>
        <div className={`${styles.wrap} ${styles.why}`}>
          <Reveal className={styles.mosaic}>
            <div
              className={`${styles.mosaicTile} ${styles.mosaicMain}`}
              style={{ backgroundImage: `url(${NAIROBI_SKYLINE_PHOTO})` }}
              role="img"
              aria-label="Nairobi city skyline"
            >
              <div className={styles.whyVisualTag}><PinIcon size={14} /> Headquartered in Nairobi</div>
              <h3>Access Kenyan talent through trusted local workforce expertise.</h3>
            </div>
            <div
              className={styles.mosaicTile}
              style={{ backgroundImage: `url(${WORKFORCE_COLLEAGUES_PHOTO})`, backgroundPosition: "center 85%" }}
              role="img"
              aria-label="Three colleagues talking around a meeting table"
            />
            <div className={`${styles.mosaicTile} ${styles.mosaicNote}`}>
              <PinIcon size={20} />
              <b>Nairobi</b>
              <span>A major hub for business and innovation in East Africa.</span>
            </div>
          </Reveal>

          <div>
            <Reveal className={styles.secHead} style={{ marginBottom: 8 }}>
              <div className={styles.eyebrow}>Why Kenya</div>
              <h2>Why global organizations build teams in Kenya.</h2>
            </Reveal>
            <div className={styles.whyList}>
              {whyKenya.map((item, i) => (
                <Reveal key={item.n} delay={i * 100} className={styles.whyItem}>
                  <div className={styles.whyItemNum}>{item.n}</div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 9. LEADERSHIP (managed in Superadmin → Site settings) ================= */}
      {leaders.length > 0 && (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.wrap}>
            <Reveal className={styles.secHead}>
              <div className={styles.eyebrow}>Leadership</div>
              <h2>Led by verified Human Capital expertise.</h2>
            </Reveal>
            {leaders.map((member) => (
              <Reveal key={member.id} className={styles.leadershipCard}>
                {member.photo_url ? (
                  <img className={styles.leadershipAvatar} src={member.photo_url} alt={member.name} />
                ) : (
                  <div className={`${styles.leadershipAvatar} ${styles.leadershipInitials}`} aria-hidden="true">
                    {member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}
                  </div>
                )}
                <div>
                  <h3>{member.name}</h3>
                  <div className={styles.leadershipRole}>{member.title}</div>
                  <p>{member.bio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ================= CONSULTATION FORM ================= */}
      <section id="contact" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={`${styles.wrap} ${styles.contactGrid}`}>
          <div className={styles.contactIntro}>
            <Reveal>
              <div className={styles.eyebrow}>Book a Consultation</div>
              <h2>Tell us about your workforce needs.</h2>
              <p className={styles.contactLede}>
                Share a few details and we&rsquo;ll follow up to understand your requirements and agree next steps.
              </p>
              <ul className={styles.contactChips}>
                <li><a href={`mailto:${CONTACT.email}`}><EnvelopeIcon /> {CONTACT.email}</a></li>
                <li><a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}><PhoneIcon /> {CONTACT.phone}</a></li>
                <li><span><PinIcon /> {CONTACT.location}</span></li>
              </ul>
            </Reveal>

            <Reveal id="faq" className={styles.contactFaq}>
              <h3>Common questions</h3>
              <div className={styles.faqList}>
                {faqItems.map((faq) => (
                  <details key={faq.question} className={styles.faqItem}>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>

          <div className={styles.contactFormCard}>

          {enquiryStatus === 'sent' && (
            <div className={styles.formNotice} role="status">
              <strong>Thank you. Your enquiry has been sent.</strong>
              <span>The Avenyra team will reply to the work email you provided.</span>
            </div>
          )}
          {enquiryStatus === 'draft' && (
            <div className={styles.formNotice} role="status">
              <strong>Almost done. Please send the email draft.</strong>
              <span>
                Your email app should have opened with your details filled in. If nothing opened, email us
                directly and include the details below.
              </span>
              <a href={enquiryMailto}>Open the email draft again</a>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </div>
          )}
          {enquiryStatus === 'error' && (
            <div className={`${styles.formNotice} ${styles.formNoticeError}`} role="alert">
              <strong>Your enquiry couldn't be sent.</strong>
              <span>Please try again in a moment, or send it by email instead. Your details will be filled in.</span>
              <a href={enquiryMailto}>Send by email instead</a>
            </div>
          )}
          <Reveal as="form" onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
              <div className={styles.formRow2}>
                <Field label="Full name" name="fullName" required />
                <Field label="Work email" name="workEmail" type="email" required />
              </div>
              <div className={styles.formRow2}>
                <Field label="Company" name="company" required />
                <Field label="Country" name="country" required />
              </div>
              <div className={styles.formRow2}>
                <label style={{ display: 'grid', gap: 6, fontSize: 14, color: 'var(--inkSoft)' }}>
                  Service required
                  <select
                    name="serviceRequired"
                    defaultValue=""
                    style={{
                      fontFamily: 'var(--sans)', fontSize: 15, padding: '10px 12px',
                      borderRadius: 8, border: '1px solid var(--line)', background: 'var(--white)',
                    }}
                  >
                    <option value="">Select a service</option>
                    {servicePillars.map((pillar) => (
                      <option key={pillar.title} value={pillar.title}>{pillar.title}</option>
                    ))}
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                </label>
                <Field label="Team size or requirement" name="requirement" />
              </div>
              <Field label="Intended start date" name="startDate" type="date" />
              <label style={{ display: 'grid', gap: 6, fontSize: 14, color: 'var(--inkSoft)' }}>
                Message
                <textarea
                  name="message"
                  rows={4}
                  style={{
                    fontFamily: 'var(--sans)', fontSize: 15, padding: '10px 12px',
                    borderRadius: 8, border: '1px solid var(--line)', resize: 'vertical',
                  }}
                />
              </label>
              <label className={styles.consentField}>
                <input type="checkbox" required style={{ marginTop: 3 }} />
                <span>
                  I agree to Avenyra Global using these details to respond to my enquiry, as described in the{' '}
                  <Link to="/legal/privacy-policy" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
                </span>
              </label>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                style={{ justifySelf: 'start' }}
                disabled={enquiryStatus === 'sending'}
              >
                {CONTACT_ENDPOINT ? (enquiryStatus === 'sending' ? 'Sending…' : 'Send enquiry') : 'Prepare email enquiry'}
              </button>
          </Reveal>

          {!CONTACT_ENDPOINT && (
            <p className={styles.formFootnote}>
              This form prepares an email on your device; it does not send your details until you choose to send it.
            </p>
          )}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 14, color: 'var(--inkSoft)' }}>
      {label}{required ? ' *' : ''}
      <input
        type={type}
        name={name}
        required={required}
        style={{
          fontFamily: 'var(--sans)', fontSize: 15, padding: '10px 12px',
          borderRadius: 8, border: '1px solid var(--line)',
        }}
      />
    </label>
  );
}
