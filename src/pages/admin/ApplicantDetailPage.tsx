import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './admin-common.module.css';
import {
  getApplicantDetail,
  adminUpdateApplicant,
  adminUpdateApplicantApplication,
  listCategories,
  ApiError,
} from '../../lib/api';
import type { ApplicantDetail, Category } from '../../lib/types';
import { LOCATION_LIST_ID, LOCATION_SUGGESTIONS, PHONE_PATTERN, PHONE_PLACEHOLDER } from '../../lib/locations';
import { usePageMeta } from '../../lib/usePageMeta';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function ApplicantDetailPage() {
  usePageMeta({ title: 'Applicant', noindex: true });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<ApplicantDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Edit form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [categoryId, setCategoryId] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getApplicantDetail(id), listCategories()])
      .then(([d, cats]) => {
        setDetail(d);
        setCategories(cats);
        setFullName(d.user.full_name);
        setEmail(d.user.email);
        setIsActive(d.user.is_active);
        setCategoryId(d.application?.category_id ?? '');
        setPhone(d.application?.phone ?? '');
        setLocation(d.application?.location ?? '');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load applicant.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Download links are pre-signed and expire, so if this page has been open a
  // while the URL from the initial load may be dead. Fetch a fresh one on click.
  // The tab is opened synchronously (before the await) so popup blockers allow it.
  async function handleDownload(e: MouseEvent<HTMLAnchorElement>, uploadId: string) {
    if (!id || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setDownloadError(null);
    const tab = window.open('', '_blank');
    if (tab) tab.opener = null;
    try {
      const fresh = await getApplicantDetail(id);
      setDetail(fresh);
      const url = fresh.uploads.find((u) => u.id === uploadId)?.download_url;
      if (!url) throw new Error('missing');
      if (tab) tab.location.href = url;
      else window.location.assign(url);
    } catch (err) {
      tab?.close();
      setDownloadError(err instanceof ApiError ? err.message : 'Could not get a download link for this file.');
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaveError(null);
    setSaving(true);
    try {
      await adminUpdateApplicant(id, { full_name: fullName, email, is_active: isActive });
      const updated = await adminUpdateApplicantApplication(id, {
        category_id: categoryId || undefined,
        phone,
        location,
      });
      setDetail(updated);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save changes.');
      // Account and application are saved by separate requests, so the first
      // may have gone through. Refresh so the page shows what was stored.
      getApplicantDetail(id).then(setDetail).catch(() => {});
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className={styles.pageSubtitle}>Loading...</p>;
  if (error) return <p className={styles.errorText}>{error}</p>;
  if (!detail) return null;

  return (
    <div>
      <button type="button" className={styles.secondaryBtn} onClick={() => navigate('/admin/applicants')} style={{ marginBottom: 20 }}>
        ← Back to applicants
      </button>

      <div className={styles.pageHeader}>
        <div>
          <h1>{detail.user.full_name}</h1>
          <p className={styles.pageSubtitle}>{detail.user.email}</p>
        </div>
        {!editing && (
          <button type="button" className={styles.primaryBtn} onClick={() => setEditing(true)}>Edit</button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className={styles.panel} style={{ marginBottom: 24 }}>
          <h2>Edit applicant</h2>
          <div className={styles.field}>
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="isActive">Account status</label>
            <select id="isActive" value={isActive ? 'active' : 'inactive'} onChange={(e) => setIsActive(e.target.value === 'active')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="categoryId">Career field</label>
            <select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Not set</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} pattern={PHONE_PATTERN} maxLength={50} placeholder={PHONE_PLACEHOLDER} />
          </div>
          <div className={styles.field}>
            <label htmlFor="location">Location</label>
            <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} list={LOCATION_LIST_ID} maxLength={255} />
            <datalist id={LOCATION_LIST_ID}>{LOCATION_SUGGESTIONS.map((place) => <option key={place} value={place} />)}</datalist>
          </div>
          {saveError && <p className={styles.errorText}>{saveError}</p>}
          <div className={styles.modalActions} style={{ justifyContent: 'flex-start' }}>
            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className={styles.panel} style={{ marginBottom: 24 }}>
          <h2>Application</h2>
          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, margin: 0 }}>
            <div>
              <dt style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Career field</dt>
              <dd style={{ margin: 0, fontWeight: 600 }}>{detail.application?.category_name ?? 'Not selected'}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Status</dt>
              <dd style={{ margin: 0 }}>
                <span className={[styles.badge, detail.application?.submitted_at ? styles.badgeGreen : styles.badgeGray].join(' ')}>
                  {detail.application?.submitted_at ? `Submitted ${formatDate(detail.application.submitted_at)}` : 'In progress'}
                </span>
              </dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Phone</dt>
              <dd style={{ margin: 0 }}>{detail.application?.phone ?? 'Not provided'}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Location</dt>
              <dd style={{ margin: 0 }}>{detail.application?.location ?? 'Not provided'}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className={styles.panel} style={{ marginBottom: 24 }}>
        <h2>Screening answers</h2>
        {detail.answers.length === 0 && <p className={styles.pageSubtitle}>No answers submitted yet.</p>}
        {detail.answers.map((a) => (
          <div key={a.question_id} style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{a.question_prompt}</div>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{a.response_text}</div>
          </div>
        ))}
      </div>

      <div className={styles.panel}>
        <h2>Uploaded files</h2>
        {downloadError && <p className={styles.errorText} role="alert">{downloadError}</p>}
        {detail.uploads.length === 0 && <p className={styles.pageSubtitle}>No files uploaded yet.</p>}
        {detail.uploads.map((u) => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 14 }}>{u.original_filename}</span>
            <a href={u.download_url} target="_blank" rel="noreferrer" className={styles.iconBtn} onClick={(e) => void handleDownload(e, u.id)}>Download</a>
          </div>
        ))}
      </div>
    </div>
  );
}
