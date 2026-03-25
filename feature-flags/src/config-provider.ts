import path from 'path';
import { FlagConfig, FlagDefinition, FlagName, FlagOverrides, FlagRegistry, Provider } from './types';

/**
 * File-based feature flag provider.
 *
 * Loads `src/config/flags.default.json` as the base, then merges the
 * env-specific override file (`flags.<NODE_ENV>.json`) on top.
 * Override files only need to declare flags that differ from the default.
 *
 * Valid NODE_ENV values: local | development | dev | staging | production
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
    const env = process.env.NODE_ENV ?? 'local';
    // Normalise: docker-compose sets NODE_ENV=local, Render sets production/staging/development
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
      local: 'local',
      development: 'dev',
      dev: 'dev',
      staging: 'staging',
      production: 'production',
    };
    return map[env] ?? 'local';
  }
}
