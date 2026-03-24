interface Props { label: string; }

export function LabelBadge({ label }: Props) {
  return <span className="label-badge">{label}</span>;
}
