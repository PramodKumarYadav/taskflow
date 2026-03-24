/**
 * All available feature flag names.
 *
 * To add a new flag:
 *  1. Add its name to this union type.
 *  2. Add the flag (true/false) to each flags.*.json config file.
 *
 * That's it — no other files need to change.
 */
export type FlagName =
  | 'TASK_LABELS'
  | 'NOTIFICATIONS'
  | 'TASK_PRIORITY'
  | 'TASK_COMMENTS'
  | 'CSV_EXPORT'
  | 'DASHBOARD_ANALYTICS'
  | 'COLLABORATION'
  | 'DARK_MODE'
  | 'AI_SUGGESTIONS';

/** Shape of a complete flags config object (all flags must be specified). */
export type FlagConfig = Record<FlagName, boolean>;

/**
 * Provider interface — the contract that any feature flag backend must satisfy.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO SWAP TO A PAID PROVIDER (LaunchDarkly, Unleash, Split.io, etc.)
 * ─────────────────────────────────────────────────────────────────────────────
 *  1. Create a new file, e.g. `src/launchdarkly-provider.ts`, that exports a
 *     class or object implementing this `Provider` interface.
 *  2. In `src/index.ts`, import and instantiate your new provider instead of
 *     the `ConfigFileProvider`.
 *  3. Delete or archive the JSON config files.
 *
 * The rest of the application — Express routes, React hooks, middleware — does
 * NOT need to change at all. That is the entire migration surface area.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface Provider {
  /** Returns true if the given flag is enabled in the current environment. */
  isEnabled(flag: FlagName): boolean;

  /** Returns the full map of all flags and their current values. */
  getAllFlags(): FlagConfig;
}
