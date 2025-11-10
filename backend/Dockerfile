FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json tsconfig*.json ./
COPY packages/shared/package.json packages/shared/
COPY backend/package.json backend/

RUN npm install

COPY packages ./packages
COPY backend ./backend

RUN npm run build --workspace backend

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/backend/dist ./dist
COPY backend/package.json ./package.json

RUN npm install --omit=dev

CMD ["node", "dist/server.js"]
