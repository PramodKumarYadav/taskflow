import { Navigate } from 'react-router-dom';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { FlagName } from '../types/flags';

interface Props {
  flag: FlagName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders children only when the given feature flag is enabled.
 * Otherwise renders fallback (default: redirect to /tasks).
 */
export function FlagGate({ flag, children, fallback }: Props) {
  const enabled = useFeatureFlag(flag);
  if (!enabled) {
    return fallback ? <>{fallback}</> : <Navigate to="/tasks" replace />;
  }
  return <>{children}</>;
}
