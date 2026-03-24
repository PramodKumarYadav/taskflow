interface Props { priority: 'low' | 'medium' | 'high'; }

const icons = { high: '🔴', medium: '🟡', low: '🟢' };

export function PriorityBadge({ priority }: Props) {
  return (
    <span className={`priority-badge priority-${priority}`}>
      {icons[priority]} {priority}
    </span>
  );
}
