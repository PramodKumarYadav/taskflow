/**
 * Feature Flags — Public API
 *
 * This is the ONLY file the rest of the application should import from.
 *
 *   import { isEnabled, getAllFlags } from '@taskflow/feature-flags';
 *
 * To swap to a paid provider, change the `provider` assignment below and
 * update the import. Nothing else in the application needs to change.
 */
import { ConfigFileProvider } from './config-provider';
import { FlagConfig, FlagName, Provider } from './types';

// ─── Provider wiring ──────────────────────────────────────────────────────────
// This is the ONE line to change when migrating to a paid service:
//   const provider: Provider = new LaunchDarklyProvider({ sdkKey: process.env.LD_SDK_KEY! });
const provider: Provider = new ConfigFileProvider();
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the given feature flag is enabled in the current environment.
 *
 * @example
 *   if (isEnabled('DARK_MODE')) { ... }
 */
export function isEnabled(flag: FlagName): boolean {
  return provider.isEnabled(flag);
}

/**
 * Returns a snapshot of all feature flags and their current values.
 * Used by the server's GET /api/flags endpoint.
 */
export function getAllFlags(): FlagConfig {
  return provider.getAllFlags();
}

// Re-export types so consumers don't need a separate import
export type { FlagName, FlagConfig, Provider };
