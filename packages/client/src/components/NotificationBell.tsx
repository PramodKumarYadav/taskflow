import { useState } from 'react';

export function NotificationBell() {
  const [hasNew] = useState(true); // simulated

  return (
    <button className="btn btn-ghost btn-sm notif-bell" title="Notifications">
      🔔{hasNew && <span className="notif-dot" />}
    </button>
  );
}
