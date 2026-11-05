import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './admin-common.module.css';
import { listApplicants, listCategories, adminCreateApplicant, ApiError } from '../../lib/api';
import type { ApplicantFilters, ApplicantListItem, Category } from '../../lib/types';
import { LOCATION_LIST_ID, LOCATION_SUGGESTIONS } from '../../lib/locations';
import { usePageMeta } from '../../lib/usePageMeta';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ApplicantsPage() {
  usePageMeta({ title: 'Applicants', noindex: true });
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);

  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  // Bumped to force a reload with the same filters (e.g. after adding someone).
  const [reloadCount, setReloadCount] = useState(0);

  // Filters apply as they change. The result remembers which filters it was
  // fetched for, so "loading" is simply "the result doesn't match yet" and a
  // slow, stale response can't overwrite a newer one.
  const filters: ApplicantFilters = {
    category_id: categoryId || undefined,
    location: debouncedLocation.trim() || undefined,
    // Date inputs give YYYY-MM-DD; cover the whole day in the admin's own
    // timezone, so "to" includes submissions made on that day.
    submitted_from: dateFrom ? new Date(`${dateFrom}T00:00:00`).toISOString() : undefined,
    submitted_to: dateTo ? new Date(`${dateTo}T23:59:59.999`).toISOString() : undefined,
  };
  const filtersJson = JSON.stringify(filters);
  const requestKey = `${filtersJson}#${reloadCount}`;
  const [result, setResult] = useState<{ key: string; applicants: ApplicantListItem[]; error: string | null }>({
    key: '',
    applicants: [],
    error: null,
  });
  const loading = result.key !== requestKey;
  const applicants = result.applicants;
  const error = result.error;
  const hasFilters = !!(categoryId || location || dateFrom || dateTo);

  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  // Wait for a pause in typing before filtering by location.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLocation(location), 350);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    let current = true;
    const key = `${filtersJson}#${reloadCount}`;
    listApplicants(JSON.parse(filtersJson) as ApplicantFilters)
      .then((data) => { if (current) setResult({ key, applicants: data, error: null }); })
      .catch((err) => {
        if (current) setResult({ key, applicants: [], error: err instanceof ApiError ? err.message : 'Could not load applicants.' });
      });
    return () => { current = false; };
  }, [filtersJson, reloadCount]);

  function clearFilters() {
    setCategoryId('');
    setLocation('');
    setDebouncedLocation('');
    setDateFrom('');
    setDateTo('');
  }

  useEffect(() => {
    if (!showCreate) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setShowCreate(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showCreate]);

  async function handleCreateApplicant(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      await adminCreateApplicant(newEmail, newFullName, newPassword);
      setShowCreate(false);
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');
      setReloadCount((count) => count + 1);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Could not create applicant.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Applicants</h1>
          <p className={styles.pageSubtitle}>Browse, filter, and manage everyone who's applied.</p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={() => setShowCreate(true)}>
          + Add applicant
        </button>
      </div>

      <div className={styles.filterBar}>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Career field">
          <option value="">All career fields</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Filter by location"
          aria-label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          list={LOCATION_LIST_ID}
        />
        <datalist id={LOCATION_LIST_ID}>{LOCATION_SUGGESTIONS.map((place) => <option key={place} value={place} />)}</datalist>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="Submitted from" aria-label="Submitted from" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="Submitted to" aria-label="Submitted to" />
        {hasFilters && <button type="button" className={styles.secondaryBtn} onClick={clearFilters}>Clear filters</button>}
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Career field</th>
              <th>Location</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((a) => (
              <tr key={a.id} onClick={() => navigate(`/admin/applicants/${a.id}`)}>
                <td>
                  <Link to={`/admin/applicants/${a.id}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                    {a.full_name}
                  </Link>
                </td>
                <td>{a.email}</td>
                <td>{a.category_name ?? 'Not selected'}</td>
                <td>{a.location ?? 'Not provided'}</td>
                <td>
                  <span className={[styles.badge, a.submitted_at ? styles.badgeGreen : styles.badgeGray].join(' ')}>
                    {a.submitted_at ? 'Submitted' : 'In progress'}
                  </span>
                  {!a.is_active && <span className={[styles.badge, styles.badgeGray].join(' ')} style={{ marginLeft: 6 }}>Inactive</span>}
                </td>
                <td>{a.submitted_at ? formatDate(a.submitted_at) : 'Not submitted'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !error && applicants.length === 0 && (
          <div className={styles.emptyState}>{hasFilters ? 'No applicants match these filters.' : 'No applicants yet.'}</div>
        )}
        {loading && <div className={styles.emptyState}>Loading...</div>}
      </div>

      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="add-applicant-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="add-applicant-title">Add applicant</h2>
            <form onSubmit={handleCreateApplicant}>
              <div className={styles.field}>
                <label htmlFor="newFullName">Full name</label>
                <input id="newFullName" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} required autoFocus />
              </div>
              <div className={styles.field}>
                <label htmlFor="newEmail">Email</label>
                <input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label htmlFor="newPassword">Temporary password</label>
                <input id="newPassword" type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              {createError && <p className={styles.errorText}>{createError}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn} disabled={creating}>
                  {creating ? 'Creating...' : 'Create applicant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
