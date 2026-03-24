import { useState } from 'react';
import { Task } from '../api/client';
import { useFeatureFlag } from '../hooks/useFeatureFlag';

interface Props {
  initial?: Partial<Task>;
  onSubmit: (values: Partial<Task>) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Mock AI suggestions for demo purposes
const AI_SUGGESTIONS = [
  'Book travel arrangements and confirm itinerary',
  'Review pull requests and leave feedback for the team',
  'Prepare slide deck for upcoming stakeholder presentation',
  'Update project documentation with latest API changes',
  'Schedule one-on-one meetings with direct reports',
];

export function TaskForm({ initial, onSubmit, onCancel, loading }: Props) {
  const showPriority = useFeatureFlag('TASK_PRIORITY');
  const showLabels = useFeatureFlag('TASK_LABELS');
  const showAi = useFeatureFlag('AI_SUGGESTIONS');

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Task['priority']>(initial?.priority ?? 'medium');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>(initial?.labels ?? []);
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.slice(0, 10) : ''
  );

  const addLabel = () => {
    const trimmed = labelInput.trim();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
    }
    setLabelInput('');
  };

  const removeLabel = (l: string) => setLabels(labels.filter((x) => x !== l));

  const applySuggestion = () => {
    const suggestion = AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)];
    setTitle(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      labels,
      dueDate: dueDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="task-title">Title *</label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          autoFocus
        />
        {showAi && (
          <div className="ai-suggestion-box" onClick={applySuggestion} role="button" tabIndex={0}>
            ✨ <strong>AI Suggestion</strong> — click to auto-fill a sample task title
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="task-desc">Description</label>
        <textarea
          id="task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Optional details…"
        />
      </div>

      {showPriority && (
        <div className="form-group">
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task['priority'])}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="task-due">Due Date</label>
        <input
          id="task-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {showLabels && (
        <div className="form-group">
          <label>Labels</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
              placeholder="Add a label and press Enter"
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={addLabel}>
              Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
            {labels.map((l) => (
              <span key={l} className="label-badge" style={{ cursor: 'pointer' }} onClick={() => removeLabel(l)}>
                {l} ×
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial?._id ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
