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

### API Authentication

If you set `PARENT_AUTH_SECRET` in the backend `.env`, every request to `/api/*` must include an `Authorization: Bearer <your-secret>` header.

For local debugging you can either remove the variable (disables auth) or keep it and configure the frontend to forward the token, e.g. create `frontend/.env.local` with:

```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_AUTH_TOKEN=super-secret-token
```

Then ensure your fetch calls attach the header:

```ts
await fetch(`${import.meta.env.VITE_API_BASE_URL}/words`, {
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_API_AUTH_TOKEN}`
  }
});
```

Any client (Postman, curl, etc.) must send the same header to avoid `401 Unauthorized` responses.

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

## Managing Players

Players can be managed through the UI on the home page or via the backend API.

### Using the UI

On the home page, the "Who is playing today?" section allows you to:

- **Add a player**: Click the "+ Add Player" button, enter a name, and click "Add"
- **Select a player**: Click on any player avatar to set them as the active player
- **Remove a player**: Click the "×" button on any player card (requires at least 2 players)

Players are automatically loaded from the backend when the app starts.

### Using the API

You can also manage players directly via API calls:

**List Players**

```bash
curl http://localhost:4000/api/players
```

Optional: filter by parent ID:

```bash
curl http://localhost:4000/api/players?parentId=<uuid>
```

**Create a Player**

```bash
curl -X POST http://localhost:4000/api/players \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emma",
    "parentId": "optional-parent-uuid",
    "avatarUrl": "https://example.com/avatar.jpg"
  }'
```

If `parentId` is omitted, a random UUID will be generated. The `avatarUrl` is optional.

**Delete a Player**

```bash
curl -X DELETE http://localhost:4000/api/players/<player-uuid>
```

**With Authentication**

If `PARENT_AUTH_SECRET` is set, include the Bearer token:

```bash
curl http://localhost:4000/api/players \
  -H "Authorization: Bearer your-secret-token"
```

---

## Deployment Notes

- **Frontend**: Build with `npm run build --workspace @english-game/frontend` and deploy the `frontend/dist` folder to static hosting (Vercel, Netlify, Cloudflare Pages, etc.). Set `VITE_API_BASE_URL` at build time.
- **Backend**: Deploy the compiled `backend/dist` output (or container) to Node hosting (Render, Fly.io, Heroku, etc.). Ensure environment variables match production services.
- **Database**: Provision a managed Postgres instance; run migrations via the same Knex commands.
- **Assets**: Configure Cloudflare Images/R2 credentials in backend env to switch AI generators from stub responses to live uploads.

---

Happy learning! 🎉
