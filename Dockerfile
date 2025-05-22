FROM node:16.14.0-alpine

WORKDIR /app

# Completely disable npm cache and logs
RUN npm config set cache /dev/null --global && \
  npm config set update-notifier false --global && \
  npm config set fund false --global

COPY package.json package-lock.json ./
RUN npm ci --no-audit --prefer-offline

COPY . .

CMD if [ "$NODE_ENV" = "production" ]; then \
  npm run build && node build/index.js; \
  else \
  npx nodemon src/index.ts; \
  fi