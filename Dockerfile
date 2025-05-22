FROM node:16.20.2-alpine

WORKDIR /app

# Install dependencies (separate layer for caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy all files (source will be volume-mounted in dev)
COPY . .

# Production: Build and run JS
# Development: Skip build (nodemon runs TS directly)
CMD if [ "$NODE_ENV" = "production" ]; then \
  npm run build && node build/index.js; \
  else \
  npm run dev; \
  fi