/**
 * All available feature flag names.
 *
 * To add a new flag:
 *  1. Add its name to this union type.
 *  2. Add a full FlagDefinition entry to flags.default.json.
 *  3. Add { "enabled": true/false } overrides to the relevant env files.
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

/** Lifecycle stage of a feature flag. */
export type FlagStage = 'development' | 'staging' | 'production' | 'stable';

/**
 * Full metadata + current value for a single feature flag.
 * Only lives in flags.default.json — env override files only need { enabled }.
 */
export interface FlagDefinition {
  /** Whether the flag is on by default (overridden per env). */
  enabled: boolean;
  /** Human-readable description of what this flag controls. */
  description: string;
  /** Team or person responsible for this flag. */
  owner: string;
  /** ISO date (YYYY-MM-DD) when the flag was introduced. */
  createdAt: string;
  /** ISO date (YYYY-MM-DD) by which the flag should be promoted to stable or removed. */
  expiresAt?: string;
  /** Current position in the flag lifecycle. */
  stage: FlagStage;
}

/** Shape of flags.default.json — all flags must have a full definition. */
export type FlagRegistry = Record<FlagName, FlagDefinition>;

/** Shape of env override files — only the flags that differ need to be listed. */
export type FlagOverrides = Partial<Record<FlagName, { enabled: boolean }>>;

/** Public API shape returned to consumers (routes, React hooks). */
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
