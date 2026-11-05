import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardPage.module.css';
import { useAuth } from '../context/AuthContext';
import {
  getMyApplication,
  listQuestions,
  getMyAnswers,
  getMyUploads,
  ApiError,
} from '../lib/api';
import type { Application, Question, Answer, Upload } from '../lib/types';
import { usePageMeta } from '../lib/usePageMeta';

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function DashboardPage() {
  usePageMeta({ title: 'Your dashboard', noindex: true });
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [app, qs, ans, ups] = await Promise.all([
          getMyApplication(),
          listQuestions(),
          getMyAnswers(),
          getMyUploads(),
        ]);
        setApplication(app);
        setQuestions(qs);
        setAnswers(ans);
        setUploads(ups);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not load your dashboard.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !user) {
    return <div className={styles.page}><p className={styles.loadingText}>Loading your dashboard...</p></div>;
  }

  if (error) {
    return <div className={styles.page}><p className={styles.loadingText}>{error}</p></div>;
  }

  const categoryDone = !!application?.category_id;
  const contactDone = !!(application?.phone || application?.location);
  const resumeDone = uploads.length > 0;
  const activeQuestions = questions.filter((q) => q.is_active);
  const answeredCount = activeQuestions.filter((q) =>
    answers.some((a) => a.question_id === q.id && a.response_text.trim()),
  ).length;
  const questionsDone = answeredCount === activeQuestions.length;
  const isSubmitted = !!application?.submitted_at;

  const checkpoints = [categoryDone, contactDone, resumeDone, questionsDone];
  const doneCount = checkpoints.filter(Boolean).length;
  const percent = Math.round((doneCount / checkpoints.length) * 100);

  const firstIncompleteStep = !categoryDone ? 0 : !contactDone ? 1 : !resumeDone ? 2 : !questionsDone ? 3 : 4;

  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.topBar} aria-label="Account">
          <Link to="/" className={styles.topBrand}>Avenyra Global</Link>
          <div className={styles.topLinks}>
            <Link to="/account">Account</Link>
            <button type="button" onClick={logout}>Log out</button>
          </div>
        </nav>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Your application</p>
            <h1>Welcome back, {firstName(user.full_name)}</h1>
            {isSubmitted ? (
              <p className={styles.heroSubtitle}>
                Your application for <strong>{application?.category_name}</strong> was submitted on{' '}
                {formatDate(application!.submitted_at!)}. We'll be in touch with next steps.
              </p>
            ) : doneCount === 0 ? (
              <p className={styles.heroSubtitle}>Let's get your application started. It only takes a few minutes.</p>
            ) : (
              <p className={styles.heroSubtitle}>You're partway there. Pick up where you left off below.</p>
            )}

            {!isSubmitted && (
              <Link to={`/apply?step=${firstIncompleteStep}`} className={styles.heroCta}>
                {doneCount === 0 ? 'Start your application' : 'Continue application'}
              </Link>
            )}
          </div>

          <div className={styles.ring}>
            <svg viewBox="0 0 100 100" width="112" height="112">
              <circle cx="50" cy="50" r="42" className={styles.ringTrack} />
              <circle
                cx="50"
                cy="50"
                r="42"
                className={styles.ringProgress}
                strokeDasharray={circumference}
                strokeDashoffset={isSubmitted ? 0 : dashOffset}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className={styles.ringLabel}>
              <span className={styles.ringPercent}>{isSubmitted ? '100' : percent}%</span>
              <span className={styles.ringCaption}>{isSubmitted ? 'Submitted' : 'Complete'}</span>
            </div>
          </div>
        </section>

        <div className={styles.grid}>
          <Link to="/apply?step=0" className={[styles.card, categoryDone ? styles.cardDone : ''].join(' ')}>
            <div className={styles.cardHead}>
              <span className={styles.cardStatus}>{categoryDone ? '✓' : ''}</span>
              <h2>Career field</h2>
            </div>
            <p className={styles.cardBody}>
              {application?.category_name ?? 'Not selected yet. Choose the field you\u2019re applying in.'}
            </p>
          </Link>

          <Link to="/apply?step=1" className={[styles.card, contactDone ? styles.cardDone : ''].join(' ')}>
            <div className={styles.cardHead}>
              <span className={styles.cardStatus}>{contactDone ? '✓' : ''}</span>
              <h2>Contact details</h2>
            </div>
            <p className={styles.cardBody}>
              {contactDone
                ? [application?.phone, application?.location].filter(Boolean).join(' · ')
                : 'Add a phone number or location so we can reach you.'}
            </p>
          </Link>

          <Link to="/apply?step=2" className={[styles.card, resumeDone ? styles.cardDone : ''].join(' ')}>
            <div className={styles.cardHead}>
              <span className={styles.cardStatus}>{resumeDone ? '✓' : ''}</span>
              <h2>Resume</h2>
            </div>
            <p className={styles.cardBody}>
              {resumeDone
                ? `${uploads.length} file${uploads.length > 1 ? 's' : ''} uploaded`
                : 'Upload your resume or CV.'}
            </p>
          </Link>

          <Link to="/apply?step=3" className={[styles.card, questionsDone ? styles.cardDone : ''].join(' ')}>
            <div className={styles.cardHead}>
              <span className={styles.cardStatus}>{questionsDone && activeQuestions.length > 0 ? '✓' : ''}</span>
              <h2>Screening questions</h2>
            </div>
            <p className={styles.cardBody}>
              {activeQuestions.length === 0
                ? 'No screening questions right now.'
                : `${answeredCount} of ${activeQuestions.length} answered`}
            </p>
          </Link>

          <Link to="/account" className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardStatus} />
              <h2>Account & security</h2>
            </div>
            <p className={styles.cardBody}>Update your name, email, or password.</p>
          </Link>

          {!isSubmitted && (
            <Link to="/apply?step=4" className={[styles.card, styles.cardAccent].join(' ')}>
              <div className={styles.cardHead}>
                <span className={styles.cardStatus} />
                <h2>Review & submit</h2>
              </div>
              <p className={styles.cardBody}>
                {doneCount === checkpoints.length
                  ? 'Everything looks ready. Review and send it in.'
                  : 'Finish the sections above, then submit your application.'}
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
