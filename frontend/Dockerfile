FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL
ARG VITE_API_AUTH_TOKEN

# Set them as environment variables for the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_AUTH_TOKEN=$VITE_API_AUTH_TOKEN

COPY package.json tsconfig*.json vite.config.ts tailwind.config.ts postcss.config.js .
COPY public ./public
COPY src ./src

RUN npm install
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
