import { Task } from '../api/client';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { PriorityBadge } from './PriorityBadge';
import { LabelBadge } from './LabelBadge';

interface Props {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComment: (task: Task) => void;
  onShare: (task: Task) => void;
}

export function TaskCard({ task, onToggle, onEdit, onDelete, onComment, onShare }: Props) {
  const showPriority = useFeatureFlag('TASK_PRIORITY');
  const showLabels = useFeatureFlag('TASK_LABELS');
  const showComments = useFeatureFlag('TASK_COMMENTS');
  const showCollaboration = useFeatureFlag('COLLABORATION');

  return (
    <div className={`card task-card${task.completed ? ' completed' : ''}`}>
      <input
        type="checkbox"
        className="task-check"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label="Mark complete"
      />
      <div className="task-body">
        <div className={`task-title${task.completed ? ' done' : ''}`}>{task.title}</div>
        {task.description && <div className="task-desc">{task.description}</div>}
        <div className="task-meta">
          {showPriority && <PriorityBadge priority={task.priority} />}
          {showLabels && task.labels.map((l) => <LabelBadge key={l} label={l} />)}
          {task.dueDate && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              📅 {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {task.sharedWith.length > 0 && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              👥 shared
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        {showComments && (
          <button className="btn btn-ghost btn-sm" onClick={() => onComment(task)} title="Comments">
            💬
          </button>
        )}
        {showCollaboration && (
          <button className="btn btn-ghost btn-sm" onClick={() => onShare(task)} title="Share">
            🔗
          </button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task)} title="Edit">
          ✏️
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onDelete(task)} title="Delete">
          🗑️
        </button>
      </div>
    </div>
  );
}
