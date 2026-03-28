# TaskFlow

[![Staging](https://img.shields.io/badge/staging-live-blue?style=flat-square)](https://taskflow-client-staging-staging.up.railway.app/)
[![Production](https://img.shields.io/badge/production-live-brightgreen?style=flat-square)](https://taskflow-client-production-8f52.up.railway.app/)

A full-stack task management app built to demo **trunk-based development with feature toggles**.

**Stack**: React + TypeScript (Vite) · Express + TypeScript · MongoDB · npm workspaces monorepo

## Background & Requirements

This project was built to demonstrate trunk-based development and feature toggles to an engineering team. The original requirements were:

- **Trunk-based development showcase** — demonstrate how teams ship continuously to a single `main` branch without long-lived feature branches
- **Feature toggles as the gate** — incomplete or risky features ship behind a flag that's off in production; turning a feature on is a JSON change, not a code deployment
- **File-based flag config, no paid tooling** — flags are plain JSON files per environment; the system is built around a `Provider` interface so migrating to LaunchDarkly, Unleash, or any other tool requires changing one file
- **Four environments** — `local` (all 9 flags on) → `dev` (7 flags) → `staging` (4 flags) → `production` (2 flags), each with progressively fewer experimental features
- **Real-world CI/CD pipelines** — GitHub Actions with automated dev deploys on merge, manual staging promotion by SHA, and a production gate requiring environment approval before deploy
- **React + Express + MongoDB** — a realistic task management app with enough modules (tasks, comments, labels, collaboration, dashboard analytics) to meaningfully demo multiple flags at once
- **JWT authentication** — register/login with token-based auth protecting all task routes
- **Run with or without Docker** — `docker-compose up --build` for a one-command start; `npm run dev:local` for a local run without Docker

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB — either [MongoDB Community](https://www.mongodb.com/try/download/community) installed locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

### Option A — With Docker (easiest, no local MongoDB needed)

**Extra prerequisite**: Docker & Docker Compose

```bash
docker-compose up --build
```

| Service    | URL                   |
| ---------- | --------------------- |
| Client     | http://localhost:5173 |
| Server API | http://localhost:4000 |
| MongoDB    | localhost:27017       |

---

### Option B — Without Docker

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment variables**

```bash
cp packages/server/.env.example packages/server/.env
# Edit packages/server/.env — set MONGODB_URI and JWT_SECRET at minimum

cp packages/client/.env.example packages/client/.env
# Usually no edits needed; defaults point to localhost:4000
```

**3. Start MongoDB**

```bash
# macOS (Homebrew)
brew services start mongodb-community
```

If you prefer not to install MongoDB locally, use a free [Atlas](https://www.mongodb.com/atlas) cluster and set `MONGODB_URI` in `packages/server/.env` to your Atlas connection string.

**4. Run everything at once**

```bash
npm run dev:local
```

This builds the feature-flags package, then starts the Express server (port 4000) and the Vite dev server (port 5173) side-by-side with colour-coded output.

**Or run them separately in two terminals:**

```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client
```

| Service    | URL                   |
| ---------- | --------------------- |
| Client     | http://localhost:5173 |
| Server API | http://localhost:4000 |

The server starts with `NODE_ENV=local` by default — **all 9 feature flags are enabled** in this mode.

---

## Project Structure

```
/
├── packages/
│   ├── client/          React + Vite + TypeScript
│   └── server/          Express + TypeScript + Mongoose
├── feature-flags/       @taskflow/feature-flags — shared flag package
├── docs/                Guides: feature flags, trunk-based dev, demo script
├── .github/workflows/   CI + CD pipelines (GitHub Actions)
└── docker-compose.yml
```

---

## Environment Variables

### Server (`packages/server/.env`)

Copy `packages/server/.env.example` to `packages/server/.env`:

| Variable        | Description                          | Example / Default                    |
| --------------- | ------------------------------------ | ------------------------------------ |
| `NODE_ENV`      | Controls which flag config is loaded | `local`                              |
| `PORT`          | HTTP port                            | `4000`                               |
| `MONGODB_URI`   | MongoDB connection string            | `mongodb://localhost:27017/taskflow` |
| `JWT_SECRET`    | Long random string for signing JWTs  | *(generate — see below)*             |
| `CLIENT_ORIGIN` | CORS allowed origin                  | `http://localhost:5173`              |

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Client (`packages/client/.env`)

Copy `packages/client/.env.example` to `packages/client/.env`:

| Variable       | Description          | Default                 |
| -------------- | -------------------- | ----------------------- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000` |

---

## Feature Flags

Flags are file-based JSON configs in `feature-flags/src/config/`. The active config is chosen by `NODE_ENV`.
See [docs/FEATURE_FLAGS.md](docs/FEATURE_FLAGS.md) for the full guide, including how to swap to LaunchDarkly in one file change.

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

To simulate a different environment locally, edit `NODE_ENV` in `packages/server/.env`:

```bash
NODE_ENV=staging     # 4 flags on  (simulates staging before next release)
NODE_ENV=production  # 2 flags on  (simulates what users currently see)
```

---

## CI/CD Pipelines

See [docs/TRUNK_BASED_DEV.md](docs/TRUNK_BASED_DEV.md) for the full trunk-based development guide.

| Workflow                | Trigger                       | What it does                                   |
| ----------------------- | ----------------------------- | ---------------------------------------------- |
| `ci.yml`                | Pull request to `main`        | Lint, type-check, test, build                  |
| `deploy-dev.yml`        | Push to `main`                | Auto-deploys to dev environment                |
| `deploy-staging.yml`    | Manual (commit SHA input)     | Promotes a specific commit to staging          |
| `deploy-production.yml` | Manual + environment approval | Promotes to prod and creates a GitHub Release  |

---

## GitHub Secrets Required

Set in **Settings → Secrets and variables → Actions**:

```
RENDER_DEV_SERVER_HOOK
RENDER_DEV_CLIENT_HOOK
RENDER_STAGING_SERVER_HOOK
RENDER_STAGING_CLIENT_HOOK
RENDER_PROD_SERVER_HOOK
RENDER_PROD_CLIENT_HOOK

DEV_MONGODB_URI        DEV_JWT_SECRET
STAGING_MONGODB_URI    STAGING_JWT_SECRET
PROD_MONGODB_URI       PROD_JWT_SECRET
```

Set per-environment in **Settings → Environments → \<env\> → Variables**:

```
API_URL    e.g. https://taskflow-dev.onrender.com
APP_URL    e.g. https://taskflow-dev-client.onrender.com
```

---

## Scripts Reference

| Script               | What it runs                                             |
| -------------------- | -------------------------------------------------------- |
| `npm run dev:local`  | Build flags package, then start server + client together |
| `npm run dev:server` | Build flags package, then start server only              |
| `npm run dev:client` | Start Vite dev server only                               |
| `npm run dev`        | `docker-compose up --build`                              |
| `npm run build`      | Production build of all packages                         |
| `npm run lint`       | ESLint across all packages                               |
| `npm run typecheck`  | `tsc --noEmit` across all packages                       |
| `npm run test`       | Run all tests (Vitest)                                   |

---

## Docs

- [Feature Flags guide](docs/FEATURE_FLAGS.md) — flag matrix, provider interface, migration to paid tools
- [Trunk-Based Development guide](docs/TRUNK_BASED_DEV.md) — branch strategy, pipeline walkthrough
- [Demo Script](docs/DEMO_SCRIPT.md) — step-by-step walkthrough for presenting to your team
