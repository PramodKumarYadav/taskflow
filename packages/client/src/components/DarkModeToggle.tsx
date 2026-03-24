import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const [dark, setDark] = useState(() => document.body.classList.contains('dark'));

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={() => setDark((d) => !d)}
      title="Toggle dark mode"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
