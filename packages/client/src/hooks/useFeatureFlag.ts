import { useFeatureFlagContext } from '../contexts/FeatureFlagContext';

/**
 * Hook to check if a named feature flag is currently enabled.
 *
 * @example
 *   const isDarkMode = useFeatureFlag('DARK_MODE');
 *   if (isDarkMode) { ... }
 */
export function useFeatureFlag(flag: string): boolean {
  const { isEnabled } = useFeatureFlagContext();
  return isEnabled(flag);
}
