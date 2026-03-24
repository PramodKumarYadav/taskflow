import { useState, useEffect } from 'react';
import { api, Task } from '../api/client';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { CommentSection } from '../components/CommentSection';
import { CollaborationPanel } from '../components/CollaborationPanel';
import { useFeatureFlag } from '../hooks/useFeatureFlag';

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [commentTask, setCommentTask] = useState<Task | null>(null);
  const [shareTask, setShareTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  const showExport = useFeatureFlag('CSV_EXPORT');

  useEffect(() => {
    api.tasks
      .getAll()
      .then(setTasks)
      .catch(() => setError('Could not load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (values: Partial<Task>) => {
    setSaving(true);
    try {
      const t = await api.tasks.create(values);
      setTasks((prev) => [t, ...prev]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values: Partial<Task>) => {
    if (!editTask) return;
    setSaving(true);
    try {
      const t = await api.tasks.update(editTask._id, values);
      setTasks((prev) => prev.map((x) => (x._id === t._id ? t : x)));
      setEditTask(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task: Task) => {
    try {
      const updated = await api.tasks.update(task._id, { completed: !task.completed });
      setTasks((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
    } catch {
      setError('Failed to update task');
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.tasks.delete(task._id);
      setTasks((prev) => prev.filter((x) => x._id !== task._id));
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.tasks.exportCsv();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tasks.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed');
    }
  };

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="page container">
      <div className="page-header">
        <h1>My Tasks</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {showExport && (
            <button className="btn btn-secondary" onClick={handleExport}>
              ⬇ Export CSV
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + New Task
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks yet</h3>
          <p>Create your first task to get started.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Pending ({pending.length})
              </h2>
              <div className="task-list">
                {pending.map((t) => (
                  <TaskCard
                    key={t._id}
                    task={t}
                    onToggle={handleToggle}
                    onEdit={setEditTask}
                    onDelete={handleDelete}
                    onComment={setCommentTask}
                    onShare={setShareTask}
                  />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section style={{ marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Completed ({completed.length})
              </h2>
              <div className="task-list">
                {completed.map((t) => (
                  <TaskCard
                    key={t._id}
                    task={t}
                    onToggle={handleToggle}
                    onEdit={setEditTask}
                    onDelete={handleDelete}
                    onComment={setCommentTask}
                    onShare={setShareTask}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Task</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTask && (
        <div className="modal-overlay" onClick={() => setEditTask(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Task</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditTask(null)}>✕</button>
            </div>
            <TaskForm
              initial={editTask}
              onSubmit={handleUpdate}
              onCancel={() => setEditTask(null)}
              loading={saving}
            />
          </div>
        </div>
      )}

      {/* Comments modal */}
      {commentTask && (
        <CommentSection
          taskId={commentTask._id}
          taskTitle={commentTask.title}
          onClose={() => setCommentTask(null)}
        />
      )}

      {/* Share modal */}
      {shareTask && (
        <CollaborationPanel task={shareTask} onClose={() => setShareTask(null)} />
      )}
    </div>
  );
}
