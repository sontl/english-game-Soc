FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configuration files
COPY package.json package-lock.json tsconfig*.json ./

# Copy package.json files for all workspaces
COPY packages/shared/package.json packages/shared/tsconfig*.json packages/shared/
COPY backend/package.json backend/tsconfig*.json backend/

# Install all dependencies (this installs for all workspaces)
RUN npm ci

# Copy source code for shared package
COPY packages/shared/src packages/shared/src

# Build shared package first (backend depends on it)
RUN npm run build --workspace @english-game/shared

# Copy backend source code and migrations
COPY backend/src backend/src
COPY backend/migrations backend/migrations
COPY backend/knexfile.ts backend/

# Build backend
RUN npm run build --workspace @english-game/backend

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy root package.json for workspace configuration
COPY package.json ./

# Copy backend built files, migrations, and config
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/migrations ./backend/migrations
COPY --from=builder /app/backend/knexfile.ts ./backend/knexfile.ts
COPY --from=builder /app/backend/package.json ./backend/package.json

# Copy shared package (backend depends on it)
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

# Install production dependencies
RUN npm install --omit=dev

WORKDIR /app/backend

CMD ["node", "dist/server.js"]
