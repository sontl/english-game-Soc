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

# Copy backend source, built files, migrations, and config
COPY --from=builder /app/backend/src ./backend/src
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/migrations ./backend/migrations
COPY --from=builder /app/backend/knexfile.ts ./backend/knexfile.ts
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/tsconfig*.json ./backend/

# Copy shared package (backend depends on it)
COPY --from=builder /app/packages/shared/src ./packages/shared/src
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/shared/tsconfig*.json ./packages/shared/

# Copy root tsconfig
COPY --from=builder /app/tsconfig.base.json ./

# Install production dependencies plus tsx for running the server
RUN npm install --omit=dev && npm install tsx

WORKDIR /app/backend

# Run the TypeScript source directly with tsx (handles imports properly)
CMD ["npx", "tsx", "src/server.ts"]
