import { useState, useEffect } from 'react';
import { api, Comment } from '../api/client';

interface Props {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
}

export function CommentSection({ taskId, taskTitle, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.tasks
      .getComments(taskId)
      .then(setComments)
      .catch(() => setError('Could not load comments'))
      .finally(() => setLoading(false));
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const c = await api.tasks.addComment(taskId, text.trim());
      setComments((prev) => [...prev, c]);
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💬 Comments — {taskTitle}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="comment-list">
            {comments.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No comments yet. Be the first!
              </p>
            )}
            {comments.map((c) => (
              <div key={c._id} className="comment-item">
                <span className="comment-author">{c.author.name}</span>
                <span className="comment-time">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
                <div className="comment-text">{c.text}</div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            required
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
            {submitting ? '…' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
