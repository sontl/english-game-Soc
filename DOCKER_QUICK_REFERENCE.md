# Docker Quick Reference

## Setup (First Time)

```bash
# 1. Create environment file
cp .env.example .env

# 2. Edit .env and set your secret
nano .env  # or vim, code, etc.

# 3. Build and start
docker compose up --build

# 4. In another terminal, run migrations
docker compose exec backend npm run knex -- migrate:latest

# 5. Seed database
docker compose exec backend npm run seed
```

## Daily Commands

```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart a service
docker compose restart backend
```

## Database Commands

```bash
# Run migrations
docker compose exec backend npm run knex -- migrate:latest

# Rollback migration
docker compose exec backend npm run knex -- migrate:rollback

# Seed database
docker compose exec backend npm run seed

# Access PostgreSQL
docker compose exec db psql -U postgres -d english_game
```

## Troubleshooting

```bash
# Rebuild without cache
docker compose build --no-cache

# Remove everything and start fresh
docker compose down -v
docker compose up --build

# View backend logs
docker compose logs -f backend

# View frontend logs
docker compose logs -f frontend

# Check service status
docker compose ps
```

## Access Points

- **Frontend:** http://localhost:4173
- **Backend API:** http://localhost:4000/api
- **Admin Dashboard:** http://localhost:4173/admin
- **Database:** localhost:5432 (postgres/postgres)

## Environment Variables

Create `.env` file with:

```env
PARENT_AUTH_SECRET=your-secret-token-here
```

This token is used for:
- Backend API authentication
- Frontend API requests

## Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change ports in `docker-compose.yml` |
| Build fails | Run `docker compose build --no-cache` |
| Can't connect to DB | Wait 10 seconds for DB to initialize |
| 401 Unauthorized | Check `PARENT_AUTH_SECRET` in `.env` |
| Frontend can't reach backend | Verify `VITE_API_BASE_URL` in compose file |

## File Locations

- **Logs:** `docker compose logs`
- **Database data:** Docker volume `english-game-Soc_db_data`
- **Backend code:** `/app/backend/` in container
- **Frontend code:** `/app/` in container

## Useful Docker Commands

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# List images
docker images

# List volumes
docker volume ls

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# See resource usage
docker stats
```
