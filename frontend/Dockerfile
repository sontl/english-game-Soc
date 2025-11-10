FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL
ARG VITE_API_AUTH_TOKEN

# Set them as environment variables for the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_AUTH_TOKEN=$VITE_API_AUTH_TOKEN

# Copy root configuration files
COPY package.json package-lock.json tsconfig*.json ./

# Copy package.json files for all workspaces
COPY packages/shared/package.json packages/shared/tsconfig*.json packages/shared/
COPY frontend/package.json frontend/tsconfig*.json frontend/vite.config.ts frontend/tailwind.config.ts frontend/postcss.config.js frontend/

# Install all dependencies
RUN npm ci

# Copy and build shared package first
COPY packages/shared/src packages/shared/src
RUN npm run build --workspace @english-game/shared

# Copy frontend source code
COPY frontend/public frontend/public
COPY frontend/src frontend/src
COPY frontend/index.html frontend/

# Build frontend
RUN npm run build --workspace @english-game/frontend

FROM node:20-alpine AS runner
WORKDIR /app

# Copy root package.json for workspace configuration
COPY package.json ./

# Copy frontend built files and config
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/frontend/package.json ./frontend/package.json

# Copy shared package (frontend depends on it at runtime for types)
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

# Install serve for production static file serving
RUN npm install -g serve

WORKDIR /app/frontend

EXPOSE 4173
# Use serve instead of vite preview (no host restrictions)
CMD ["serve", "-s", "dist", "-l", "4173", "--no-port-switching"]
