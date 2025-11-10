# Kids English Word Games

Interactive HTML5 mini-games and authoring tools for weekly vocabulary practice. The repository is a TypeScript monorepo containing a React frontend, an Express API backend, and shared schemas/utilities.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Layout](#project-layout)
4. [Available Scripts](#available-scripts)
5. [Local Development](#local-development)
6. [Testing & Linting](#testing--linting)
7. [Database & Migrations](#database--migrations)
8. [Environment Variables](#environment-variables)
9. [Docker & Compose](#docker--compose)
10. [Deployment Notes](#deployment-notes)

---

## Prerequisites

- **Node.js** 18+ (Node 20 recommended)
- **npm** 9+
- **PostgreSQL** 14+ (local or hosted)
- Optional: **Docker** & **Docker Compose** for containerized setup

---

## Initial Setup

Install dependencies for all workspaces:

```bash
npm install
```

Build the shared package first (generates TypeScript declarations), then build backend and frontend:

```bash
npm run build
```

> Tip: while iterating locally you can run the frontend/backend dev servers without rebuilding each time; see [Local Development](#local-development).

---

## Project Layout

```
.
├── backend/               # Express API + Knex repositories
├── frontend/              # React + Vite client with mini-games
├── packages/shared/       # Shared types, schemas, constants
├── migrations/            # Knex migrations (Postgres schema)
├── docker-compose.yml
├── package.json           # npm workspaces configuration
└── README.md
```

---

## Available Scripts

All commands are executed from the repository root:

| Command | Description |
| --- | --- |
| `npm run dev:backend` | Start backend in watch mode (see backend package). |
| `npm run dev:frontend` | Start Vite dev server (see frontend package). |
| `npm run build` | Compile shared package, backend, and frontend bundles. |
| `npm run test` | Run Vitest suites for all workspaces. |
| `npm run lint` | Run ESLint across backend, frontend, and shared packages. |

> Each workspace exposes its own scripts too (e.g., `npm run dev --workspace @english-game/backend`).

---

## Local Development

1. **Environment file** – copy `.env.example` (create one if absent) into `backend/.env` and fill in database credentials plus optional Cloudflare keys.

2. **Run database** – start a local Postgres instance (or use Docker Compose below). Apply migrations:

   ```bash
   npm run knex --workspace @english-game/backend migrate:latest
   ```

3. **Start backend**:

   ```bash
   npm run dev --workspace @english-game/backend
   ```

   The API defaults to `http://localhost:4000` with routes under `/api/*`.

4. **Start frontend**:

   ```bash
   npm run dev --workspace @english-game/frontend
   ```

   The Vite dev server runs on `http://localhost:5173`. Configure `VITE_API_BASE_URL` in `frontend/.env.local` if the backend host differs.

5. **Shared package changes** – run `npm run build --workspace @english-game/shared` or use `tsc --watch` to regenerate typings when editing shared code.

---

## Testing & Linting

- **Unit tests**: `npm run test`
- **Linting**: `npm run lint`

Vitest and ESLint execute per workspace; failures from any package stop the aggregated command.

---

## Database & Migrations

- Connection string is read from `DATABASE_URL` (default: `postgres://postgres:postgres@localhost:5432/english_game`).
- Knex migrations live under `backend/migrations`.
- Run migrations:

  ```bash
  npm run knex --workspace @english-game/backend migrate:latest
  npm run knex --workspace @english-game/backend migrate:rollback
  ```

- Seed scripts can be added in `backend/seeds` and executed by `npm run knex --workspace @english-game/backend seed:run`.

---

## Environment Variables

Backend `.env` supports:

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | Runtime mode |
| `PORT` | `4000` | Backend HTTP port |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/english_game` | Postgres connection |
| `PARENT_AUTH_SECRET` | _(optional)_ | Simple Bearer token auth for admin requests |
| `CLOUD_FLARE_ACCOUNT_ID` | _(optional)_ | Enables Cloudflare Images integration |
| `CLOUD_FLARE_API_TOKEN` | _(optional)_ | API token for Cloudflare services |
| `CLOUD_FLARE_IMAGES_ACCOUNT_HASH` | _(optional)_ | Asset upload target |
| `CLOUD_FLARE_R2_BUCKET` | _(optional)_ | Audio storage bucket (if using R2) |

Frontend `.env` example (`frontend/.env.local`):

```
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## Docker & Compose

- Build backend image: `docker build -t english-game-backend ./backend`
- Build frontend image: `docker build -t english-game-frontend ./frontend`

Use Compose for a full stack (backend + Postgres + frontend preview):

```bash
docker compose up --build
```

Services exposed:

- Backend: `http://localhost:4000`
- Frontend preview: `http://localhost:4173`
- Postgres: `localhost:5432` (username/password `postgres`/`postgres`)

Run migrations inside the backend container:

```bash
docker compose exec backend npm run knex -- migrate:latest
```

---

## Deployment Notes

- **Frontend**: Build with `npm run build --workspace @english-game/frontend` and deploy the `frontend/dist` folder to static hosting (Vercel, Netlify, Cloudflare Pages, etc.). Set `VITE_API_BASE_URL` at build time.
- **Backend**: Deploy the compiled `backend/dist` output (or container) to Node hosting (Render, Fly.io, Heroku, etc.). Ensure environment variables match production services.
- **Database**: Provision a managed Postgres instance; run migrations via the same Knex commands.
- **Assets**: Configure Cloudflare Images/R2 credentials in backend env to switch AI generators from stub responses to live uploads.

---

Happy learning! 🎉
