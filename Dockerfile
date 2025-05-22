FROM node:16.14.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Production: Build and run JS
# Development: Skip build (nodemon runs TS directly)
CMD if [ "$NODE_ENV" = "production" ]; then \
  npm run build && node build/index.js; \
  else \
  npm run dev; \
  fi
