import { useFeatureFlagContext } from '../contexts/FeatureFlagContext';

/**
 * Dev-only feature flag banner — shows active flags at the top of the page.
 * Hidden in production so it doesn't confuse end users.
 */
export function FeatureFlagBanner() {
  const { flags } = useFeatureFlagContext();
  const active = Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k);

  // Show in local dev (vite serve) or in named non-production Railway environments (ci/staging).
  // Hide in production builds where VITE_APP_ENV is unset or explicitly 'production'.
  if (import.meta.env.PROD && (!import.meta.env.VITE_APP_ENV || import.meta.env.VITE_APP_ENV === 'production')) return null;

  return (
    <div className="flag-banner">
      <span>🚩 Active flags:</span>
      {active.length === 0 ? (
        <span>(none)</span>
      ) : (
        active.map((f) => <span key={f} className="flag-badge">{f}</span>)
      )}
    </div>
  );
}
