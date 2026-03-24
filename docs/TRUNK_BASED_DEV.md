# Trunk-Based Development

TaskFlow is built on trunk-based development (TBD): all engineers commit to a single long-lived branch (`main`). Feature toggles replace long-lived feature branches.

---

## Core principles

| Principle | How it's applied in TaskFlow |
| --------- | ----------------------------- |
| One trunk | All work merges to `main`; no `develop` or `release` branches |
| Short-lived branches | Feature branches live ≤ 2 days; PR → review → merge |
| Feature toggles as the gate | Incomplete features ship behind a flag that's off in production |
| CI on every commit | Lint + type-check + build runs on every PR |
| Continuous deployment | Push to `main` auto-deploys to dev; staging/prod are manual promotions |

---

## Branch strategy

```
main (trunk)
  │
  ├── feat/csv-export          ← short-lived (flag: CSV_EXPORT=false in prod)
  ├── feat/ai-suggestions      ← short-lived (flag: AI_SUGGESTIONS=false in prod)
  └── fix/task-sort-order      ← bugfix, no flag needed
```

Rules:
- Branch from `main`, target `main`
- Delete the branch after merge
- Never merge `main` back into a long-lived branch (because there are none)
- If a feature is risky, wrap it in a flag; if it's safe (a bug fix, a refactor), ship it directly

---

## Pipeline overview

```
PR opened
  └── ci.yml
        ├── Lint (ESLint)
        ├── Type-check (tsc --noEmit)
        ├── Test (Vitest)
        └── Build (feature-flags → server → client)

Push to main (PR merged)
  └── deploy-dev.yml
        └── _deploy.yml (reusable)
              ├── npm install
              ├── Build all packages
              ├── curl RENDER_DEV_SERVER_HOOK
              ├── curl RENDER_DEV_CLIENT_HOOK
              ├── Health-check both URLs
              └── GitHub Step Summary

Manual trigger (staging)
  └── deploy-staging.yml
        ├── Accept commit SHA input (default: latest main)
        ├── Post "deploying" comment on any open PRs
        └── _deploy.yml → Render staging hooks

Manual trigger + approval (production)
  └── deploy-production.yml
        ├── Require "production" environment approval
        ├── _deploy.yml → Render production hooks
        └── Create GitHub Release with auto-generated notes
```

---

## Promotion flow

```
Feature complete
    ↓
Open PR → CI passes → Code review → Merge to main
    ↓
Auto-deploy to dev (NODE_ENV=development, 7 flags on)
    ↓
QA on dev — flag the commit SHA
    ↓
Manual: deploy-staging.yml (input SHA) → staging (NODE_ENV=staging, 4 flags on)
    ↓
Stakeholder sign-off
    ↓
Manual + approval: deploy-production.yml → production (NODE_ENV=production, 2 flags on)
    ↓
Turn on flag in flags.production.json → merge → auto-deploy-dev → promote to prod
```

---

## Releasing a feature

When a feature is fully validated in staging, releasing it to production is just a JSON change:

```json
// feature-flags/src/config/flags.production.json
{
  "TASK_LABELS": true,
  "NOTIFICATIONS": true,
  "TASK_PRIORITY": false,   // ← was false
  "TASK_COMMENTS": false
}
```

Change to:

```json
{
  "TASK_LABELS": true,
  "NOTIFICATIONS": true,
  "TASK_PRIORITY": true,    // ← now true
  "TASK_COMMENTS": false
}
```

Merge the PR → dev auto-deploys → promote to staging → approve production. No code changes, no feature branch merges.

---

## Revert strategy

### Revert a bad deploy (code bug)
```bash
git revert <bad-commit-sha>
# Opens a PR, CI runs, merge → auto-deploys to dev → promote
```

### Disable a feature instantly (flag kill-switch)
```json
// flags.production.json — set to false
{ "TASK_PRIORITY": false }
```
Merge and promote. The feature disappears without a code rollback.

---

## Environment variable reference

| Variable   | dev               | staging             | production           |
| ---------- | ----------------- | ------------------- | -------------------- |
| `NODE_ENV` | `development`     | `staging`           | `production`         |
| `PORT`     | `4000`            | `4000`              | `4000`               |
| Flags on   | 7 of 9            | 4 of 9              | 2 of 9               |

---

## GitHub Environments setup

1. Go to **Settings → Environments** in your repo
2. Create three environments: `development`, `staging`, `production`
3. Add a **Required reviewer** to `production`
4. Add the `API_URL` and `APP_URL` variables per environment
5. Add all secrets (`*_MONGODB_URI`, `*_JWT_SECRET`, Render hooks) to the repo-level secrets

The `deploy-production.yml` workflow references the `production` environment, which triggers the approval gate before any deploy steps run.
