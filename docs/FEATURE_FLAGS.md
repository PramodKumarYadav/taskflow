# Feature Flags

TaskFlow uses a **file-based feature flag system** with no external dependencies. Flags are plain JSON files — one per environment. The entire system is built around a single `Provider` interface, so migrating to LaunchDarkly, Unleash, or any other tool requires changing **one file**.

---

## How it works

```
feature-flags/
├── src/
│   ├── types.ts           FlagName union + Provider interface
│   ├── config-provider.ts ConfigFileProvider — reads flags.{NODE_ENV}.json
│   ├── index.ts           Public API + provider wiring (the swap seam)
│   └── config/
│       ├── flags.local.json
│       ├── flags.development.json
│       ├── flags.staging.json
│       └── flags.production.json
```

The server reads the correct JSON file at startup based on `NODE_ENV`. The client fetches the resolved flag state from `GET /api/flags` — it never reads JSON files directly.

---

## The 9 flags

| Flag                  | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `TASK_LABELS`         | Colour labels on tasks                               |
| `NOTIFICATIONS`       | In-app notification bell                             |
| `TASK_PRIORITY`       | Priority field (low / medium / high / urgent)        |
| `TASK_COMMENTS`       | Comment thread on each task                          |
| `CSV_EXPORT`          | Export task list as CSV                              |
| `DASHBOARD_ANALYTICS` | Analytics dashboard page                             |
| `COLLABORATION`       | Share tasks with other users                         |
| `DARK_MODE`           | Dark theme toggle                                    |
| `AI_SUGGESTIONS`      | AI-generated task suggestions (experimental)         |

---

## Flag matrix per environment

| Flag                  | local | dev | staging | prod |
| --------------------- | :---: | :-: | :-----: | :--: |
| `TASK_LABELS`         |  ✓   |  ✓  |    ✓    |  ✓  |
| `NOTIFICATIONS`       |  ✓   |  ✓  |    ✓    |  ✓  |
| `TASK_PRIORITY`       |  ✓   |  ✓  |    ✓    |  ✗  |
| `TASK_COMMENTS`       |  ✓   |  ✓  |    ✓    |  ✗  |
| `CSV_EXPORT`          |  ✓   |  ✓  |    ✗    |  ✗  |
| `DASHBOARD_ANALYTICS` |  ✓   |  ✓  |    ✗    |  ✗  |
| `COLLABORATION`       |  ✓   |  ✓  |    ✗    |  ✗  |
| `DARK_MODE`           |  ✓   |  ✗  |    ✗    |  ✗  |
| `AI_SUGGESTIONS`      |  ✓   |  ✗  |    ✗    |  ✗  |

---

## Adding a new flag

1. Add the flag name to the `FlagName` union in `feature-flags/src/types.ts`:

```ts
export type FlagName =
  | 'TASK_LABELS'
  | 'MY_NEW_FLAG';   // ← add here
```

2. Add it to all four JSON config files with the desired value per environment:

```json
// flags.local.json
{ "MY_NEW_FLAG": true }

// flags.production.json
{ "MY_NEW_FLAG": false }
```

3. Add the same name to the client-side union in `packages/client/src/types/flags.ts`.

4. Use it anywhere:

```tsx
// React component
const isOn = useFeatureFlag('MY_NEW_FLAG');

// Express route
router.get('/my-route', featureGate('MY_NEW_FLAG'), handler);
```

---

## Migrating to a paid provider (LaunchDarkly, Unleash, etc.)

Everything the app imports from feature-flags goes through `feature-flags/src/index.ts`. That file exports `isEnabled()` and `getAllFlags()`, and currently wires them to `ConfigFileProvider`.

**To switch to LaunchDarkly**, only `index.ts` and `config-provider.ts` need to change:

```ts
// feature-flags/src/index.ts  ← the only swap seam

// Before (file-based):
const provider: Provider = new ConfigFileProvider();

// After (LaunchDarkly):
const provider: Provider = new LaunchDarklyProvider(process.env.LD_SDK_KEY!);
```

Create `src/launchdarkly-provider.ts` implementing the `Provider` interface:

```ts
import { init } from '@launchdarkly/node-server-sdk';
import type { Provider } from './types';

export class LaunchDarklyProvider implements Provider {
  private client = init(sdkKey);

  isEnabled(flag: FlagName): boolean {
    return this.client.variation(flag, { key: 'server' }, false) as boolean;
  }

  getAllFlags(): FlagConfig {
    // map LD allFlagsState to FlagConfig shape
  }
}
```

The rest of the codebase — all routes, React components, middleware — does not change.

---

## How flags are enforced

### Server (Express middleware)

```ts
// Invisible 404 when flag is off — feature doesn't exist to the caller
router.get('/export/csv', featureGate('CSV_EXPORT'), exportHandler);
```

`featureGate` returns a 404 (not 403) when the flag is disabled. From the client's perspective, the endpoint simply doesn't exist — the feature is invisible, not just forbidden.

### Client (React hook + FlagGate component)

```tsx
// Hide a UI element
const showExport = useFeatureFlag('CSV_EXPORT');
{showExport && <CsvExportButton />}

// Gate an entire route
<Route path="/dashboard" element={
  <FlagGate flag="DASHBOARD_ANALYTICS">
    <DashboardPage />
  </FlagGate>
} />
```

`FlagGate` redirects to `/tasks` if the flag is off, so users navigating directly to a gated URL are seamlessly redirected.
