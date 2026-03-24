import { useState, useEffect } from 'react';
import { api, DashboardStats } from '../api/client';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboard
      .getStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }
  if (error) {
    return <div className="page container"><div className="alert alert-error">{error}</div></div>;
  }
  if (!stats) return null;

  return (
    <div className="page container">
      <div className="page-header">
        <h1>📊 Dashboard</h1>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Tasks', value: stats.total },
          { label: 'Completed', value: stats.completed },
          { label: 'Pending', value: stats.pending },
          { label: 'Completion Rate', value: `${stats.completionRate}%` },
          { label: 'Overdue', value: stats.overdue },
          { label: 'Comments', value: stats.totalComments },
        ].map((s) => (
          <div key={s.label} className="card stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>By Priority</h3>
          {(['high', 'medium', 'low'] as const).map((p) => {
            const count = stats.byPriority[p];
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={p} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ textTransform: 'capitalize' }}>{p}</span>
                  <span>{count}</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: '99px', height: '6px' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: '99px',
                    background: p === 'high' ? 'var(--danger)' : p === 'medium' ? 'var(--warning)' : 'var(--success)',
                    transition: 'width 0.4s'
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Top Labels</h3>
          {stats.topLabels.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No labels used yet.</p>
          ) : (
            stats.topLabels.map(({ label, count }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span className="label-badge">{label}</span>
                <span style={{ color: 'var(--text-muted)' }}>{count} task{count !== 1 ? 's' : ''}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
