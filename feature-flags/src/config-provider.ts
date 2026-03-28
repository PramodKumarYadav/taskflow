import path from 'path';
import { FlagConfig, FlagDefinition, FlagName, FlagOverrides, FlagRegistry, Provider } from './types';

/**
 * File-based feature flag provider.
 *
 * Loads `src/config/flags.default.json` as the base, then merges the
 * env-specific override file (`flags.<NODE_ENV>.json`) on top.
 * Override files only need to declare flags that differ from the default.
 *
 * Valid NODE_ENV values: development | ci | staging | production
 *
 * development → flags.dev.json   (all flags on — local and github dev environment)
 * ci          → flags.ci.json    (5 flags on — on in our Railway ci environment and GitHub Actions)
 * staging     → flags.staging.json (4 flags on in our Railway staging environment)
 * production  → flags.production.json (2 flags on in our Railway production environment)
 */
export class ConfigFileProvider implements Provider {
  private config: FlagConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  isEnabled(flag: FlagName): boolean {
    return this.config[flag] ?? false;
  }

  getAllFlags(): FlagConfig {
    return { ...this.config };
  }

  private loadConfig(): FlagConfig {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const registry = require(path.resolve(__dirname, 'config', 'flags.default.json')) as FlagRegistry;
    const env = process.env.NODE_ENV ?? 'development';
    // Map NODE_ENV to the correct flags file.
    // docker-compose and Railway dev environment both set NODE_ENV=development (all flags on).
    // GitHub Actions CI sets NODE_ENV=ci (7 flags on).
    const envFile = this.resolveEnvFile(env);
    const configPath = path.resolve(__dirname, 'config', `flags.${envFile}.json`);

    let overrides: FlagOverrides = {};
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      overrides = require(configPath) as FlagOverrides;
    } catch {
      console.warn(
        `[feature-flags] Could not load overrides for env "${env}" (tried ${configPath}). Using defaults.`
      );
    }

    return Object.fromEntries(
      (Object.entries(registry) as [FlagName, FlagDefinition][]).map(([flag, def]) => [
        flag,
        overrides[flag] !== undefined ? overrides[flag]!.enabled : def.enabled,
      ])
    ) as FlagConfig;
  }

  private resolveEnvFile(env: string): string {
    const map: Record<string, string> = {
      development: 'dev',
      ci: 'ci',
      staging: 'staging',
      production: 'production',
    };
    return map[env] ?? 'dev';
  }
}
