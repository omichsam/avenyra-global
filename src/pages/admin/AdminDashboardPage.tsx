import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './admin-common.module.css';
import { getAdminDashboardStats, ApiError } from '../../lib/api';
import type { AdminDashboardStats } from '../../lib/types';
import { usePageMeta } from '../../lib/usePageMeta';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminDashboardPage() {
  usePageMeta({ title: 'Admin dashboard', noindex: true });
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardStats()
      .then(setStats)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={styles.pageSubtitle}>Loading...</p>;
  if (error) return <p className={styles.errorText}>{error}</p>;
  if (!stats) return null;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p className={styles.pageSubtitle}>An overview of applications coming through the system.</p>
        </div>
      </div>

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total_applicants}</div>
          <div className={styles.statLabel}>Total applicants</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.submitted_count}</div>
          <div className={styles.statLabel}>Submitted</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.in_progress_count}</div>
          <div className={styles.statLabel}>In progress</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.by_category.length}</div>
          <div className={styles.statLabel}>Career fields with applicants</div>
        </div>
      </div>

      {stats.by_category.length > 0 && (
        <div className={styles.panel} style={{ marginBottom: 24 }}>
          <h2>Applicants by career field</h2>
          {stats.by_category.map((c) => (
            <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
              <span>{c.category}</span>
              <span style={{ fontWeight: 600 }}>{c.count}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.panel}>
        <h2>Recent applicants</h2>
        <div className={styles.tableWrap} style={{ border: 'none' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Career field</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_applicants.map((a) => (
                <tr key={a.id} onClick={() => navigate(`/admin/applicants/${a.id}`)}>
                  <td>
                    <Link to={`/admin/applicants/${a.id}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                      {a.full_name}
                    </Link>
                  </td>
                  <td>{a.category_name ?? 'Not selected'}</td>
                  <td>
                    <span className={[styles.badge, a.submitted_at ? styles.badgeGreen : styles.badgeGray].join(' ')}>
                      {a.submitted_at ? 'Submitted' : 'In progress'}
                    </span>
                  </td>
                  <td>{formatDate(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.recent_applicants.length === 0 && <div className={styles.emptyState}>No applicants yet.</div>}
        </div>
      </div>
    </div>
  );
}
