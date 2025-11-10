# Docker Setup Guide

This guide explains how to run the English Game application using Docker Compose.

## Quick Start

1. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and set your secret**:
   ```env
   PARENT_AUTH_SECRET=my-super-secret-token-12345
   ```

3. **Start all services**:
   ```bash
   docker compose up --build
   ```

4. **Run database migrations** (in a new terminal):
   ```bash
   docker compose exec backend npm run knex -- migrate:latest
   ```

5. **Seed the database** (optional):
   ```bash
   docker compose exec backend npm run seed
   ```

6. **Access the application**:
   - Frontend: http://localhost:4173
   - Backend API: http://localhost:4000/api
   - Admin Dashboard: http://localhost:4173/admin

## Environment Variables

### Root `.env` File

The `.env` file at the project root is used by Docker Compose:

```env
# Required: Authentication secret
PARENT_AUTH_SECRET=your-secret-token-here

# Optional overrides
# DATABASE_URL=postgres://postgres:postgres@db:5432/english_game
# NODE_ENV=development
```

### How It Works

1. **Backend** receives `PARENT_AUTH_SECRET` as a runtime environment variable
2. **Frontend** receives it as `VITE_API_AUTH_TOKEN` during the build process
3. Both use the same value from your `.env` file to ensure they match

### Build-Time vs Runtime

**Backend variables** (runtime):
- Can be changed by restarting the container
- Set in `docker-compose.yml` under `environment:`

**Frontend variables** (build-time):
- Baked into the JavaScript bundle during build
- Require rebuilding the image to change
- Set in `docker-compose.yml` under `build.args:`

## Common Commands

### Start services
```bash
docker compose up
```

### Start in background
```bash
docker compose up -d
```

### Rebuild and start
```bash
docker compose up --build
```

### Stop services
```bash
docker compose down
```

### View logs
```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
```

### Execute commands in containers
```bash
# Run migrations
docker compose exec backend npm run knex -- migrate:latest

# Seed database
docker compose exec backend npm run seed

# Access backend shell
docker compose exec backend sh

# Access database
docker compose exec db psql -U postgres -d english_game
```

### Clean up everything
```bash
docker compose down -v  # Removes volumes (deletes database data!)
```

## Troubleshooting

### Frontend can't connect to backend

**Problem**: Frontend shows connection errors

**Solution**: 
- Check that `VITE_API_BASE_URL` in `docker-compose.yml` matches your backend URL
- For Docker Compose, use `http://backend:4000/api` (internal network)
- For local browser access, use `http://localhost:4000/api`

### Authentication errors (401 Unauthorized)

**Problem**: API returns 401 errors

**Solution**:
1. Ensure `PARENT_AUTH_SECRET` is set in `.env`
2. Rebuild the frontend: `docker compose up --build frontend`
3. Restart the backend: `docker compose restart backend`

### Database connection errors

**Problem**: Backend can't connect to database

**Solution**:
1. Ensure database is running: `docker compose ps`
2. Check `DATABASE_URL` in `docker-compose.yml`
3. Wait a few seconds for database to initialize on first run

### Build errors: "Cannot find module '@english-game/shared'"

**Problem**: Backend build fails with TypeScript errors about missing shared package

**Solution**:
This is already fixed in the Dockerfile. The shared package is built before the backend.
If you still see this error:
1. Clear Docker build cache: `docker compose build --no-cache backend`
2. Ensure you're building from the project root
3. Check that `packages/shared/` directory exists

### Port already in use

**Problem**: `Error: bind: address already in use`

**Solution**:
1. Stop conflicting services
2. Or change ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "4001:4000"  # Use 4001 instead of 4000
   ```

## Production Deployment

For production, you should:

1. **Use secrets management** instead of `.env` files
2. **Set strong random tokens**:
   ```bash
   openssl rand -base64 32
   ```
3. **Use environment-specific compose files**:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up
   ```
4. **Enable HTTPS** with a reverse proxy (nginx, Caddy, Traefik)
5. **Use managed database** instead of containerized Postgres
6. **Set `NODE_ENV=production`**

## Network Architecture

```
┌─────────────────────────────────────────┐
│  Docker Compose Network                 │
│                                         │
│  ┌──────────┐      ┌──────────┐       │
│  │ Frontend │─────▶│ Backend  │       │
│  │  :4173   │      │  :4000   │       │
│  └──────────┘      └─────┬────┘       │
│                           │            │
│                           ▼            │
│                    ┌──────────┐       │
│                    │   DB     │       │
│                    │  :5432   │       │
│                    └──────────┘       │
└─────────────────────────────────────────┘
         │                    │
         ▼                    ▼
    localhost:4173      localhost:4000
```

## Volume Management

The database data is persisted in a Docker volume:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect english-game-Soc_db_data

# Backup database
docker compose exec db pg_dump -U postgres english_game > backup.sql

# Restore database
docker compose exec -T db psql -U postgres english_game < backup.sql
```
