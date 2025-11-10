# Docker Build Fix Summary

## Problems Fixed

### 1. Missing Shared Package
**Error:**
```
error TS2307: Cannot find module '@english-game/shared' or its corresponding type declarations.
```

**Root Cause:** The backend depends on the `@english-game/shared` package, which is a local workspace package. The Dockerfile wasn't building the shared package before attempting to build the backend.

### 2. Missing Type Definitions
**Error:**
```
error TS7016: Could not find a declaration file for module 'multer'
error TS7016: Could not find a declaration file for module 'uuid'
```

**Root Cause:** The `@types/multer` and `@types/uuid` packages were missing from devDependencies.

## Solution

### 1. Updated `backend/Dockerfile`

**Key changes:**
- Build shared package FIRST before backend
- Copy all necessary files in the correct order
- Include migrations and knexfile in runtime image
- Use `npm ci` for faster, more reliable installs

**Build order:**
1. Copy root package.json and tsconfig files
2. Copy package.json files for all workspaces
3. Install dependencies (`npm ci`)
4. Copy and build shared package
5. Copy and build backend
6. Create minimal runtime image with only production dependencies

### 2. Created `.dockerignore` files

**Root `.dockerignore`:**
- Excludes node_modules, dist, and other build artifacts
- Reduces build context size
- Speeds up builds

**Backend `.dockerignore`:**
- Additional backend-specific exclusions

### 3. Updated `docker-compose.yml`

**Added authentication:**
- Backend receives `PARENT_AUTH_SECRET` from `.env`
- Frontend receives it as build arg `VITE_API_AUTH_TOKEN`
- Both use the same token from `.env` file

## How to Use

### Quick Start

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`:**
   ```env
   PARENT_AUTH_SECRET=your-strong-secret-token
   ```

3. **Build and start:**
   ```bash
   docker compose up --build
   ```

4. **Run migrations:**
   ```bash
   docker compose exec backend npm run knex -- migrate:latest
   ```

5. **Seed database:**
   ```bash
   docker compose exec backend npm run seed
   ```

### Test Build Only

Use the test script to verify builds without starting services:

```bash
./docker-build-test.sh
```

### Troubleshooting

**If build still fails:**

1. **Clear Docker cache:**
   ```bash
   docker compose build --no-cache
   ```

2. **Remove old images:**
   ```bash
   docker compose down --rmi all
   docker compose up --build
   ```

3. **Check build context:**
   ```bash
   # Should be run from project root
   pwd  # Should show: /path/to/english-game-Soc
   ```

4. **Verify file structure:**
   ```bash
   ls -la packages/shared/src
   ls -la backend/src
   ```

## File Structure

```
english-game-Soc/
├── .dockerignore              # Root ignore file
├── .env                       # Your secrets (create from .env.example)
├── .env.example              # Template
├── docker-compose.yml        # Service definitions
├── docker-build-test.sh      # Build test script
├── backend/
│   ├── .dockerignore         # Backend-specific ignores
│   ├── Dockerfile            # ✅ FIXED - Builds shared first
│   ├── src/                  # Backend source
│   ├── migrations/           # Database migrations
│   └── knexfile.ts          # Knex configuration
├── frontend/
│   ├── Dockerfile            # Frontend build
│   └── src/                  # Frontend source
└── packages/
    └── shared/
        ├── src/              # Shared TypeScript code
        └── dist/             # Built output (created during build)
```

## Build Process Flow

```
┌─────────────────────────────────────────┐
│  1. Copy package.json files             │
│     (root, shared, backend)             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  2. npm ci (install all dependencies)   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  3. Copy shared/src                     │
│     Build @english-game/shared          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  4. Copy backend/src, migrations        │
│     Build @english-game/backend         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  5. Create runtime image                │
│     - Copy built files                  │
│     - Install prod dependencies only    │
│     - Set working directory             │
└─────────────────────────────────────────┘
```

## Performance Tips

1. **Layer caching:** Dependencies are installed before copying source code, so they're cached unless package.json changes

2. **Multi-stage build:** Builder stage has all dev dependencies, runner stage only has production dependencies

3. **Minimal context:** `.dockerignore` files prevent unnecessary files from being sent to Docker daemon

4. **Use `npm ci`:** Faster and more reliable than `npm install` in CI/CD environments

## Production Considerations

For production deployments:

1. **Use specific Node version:**
   ```dockerfile
   FROM node:20.11.0-alpine
   ```

2. **Add health checks:**
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s \
     CMD node -e "require('http').get('http://localhost:4000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
   ```

3. **Run as non-root user:**
   ```dockerfile
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nodejs -u 1001
   USER nodejs
   ```

4. **Use secrets management:**
   - Don't commit `.env` files
   - Use Docker secrets or environment-specific configs
   - Rotate tokens regularly

## Related Documentation

- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Complete Docker guide
- [SEED_GUIDE.md](SEED_GUIDE.md) - Database seeding
- [README.md](README.md) - Main project documentation
