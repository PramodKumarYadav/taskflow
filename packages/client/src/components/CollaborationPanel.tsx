import { useState } from 'react';
import { api, Task } from '../api/client';

interface Props {
  task: Task;
  onClose: () => void;
}

export function CollaborationPanel({ task, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.collaboration.share(task._id, email.trim());
      setStatus({ type: 'success', msg: res.message });
      setEmail('');
    } catch (err) {
      setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to share' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔗 Share Task</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Share "<strong>{task.title}</strong>" with another TaskFlow user.
        </p>

        {status && (
          <div className={`alert alert-${status.type}`}>{status.msg}</div>
        )}

        <form onSubmit={handleShare} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            required
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? '…' : 'Share'}
          </button>
        </form>
      </div>
    </div>
  );
}
