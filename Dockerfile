FROM node:16.14.0-alpine

WORKDIR /app

# Configure npm to use temporary cache
RUN mkdir -p /tmp/.npm && \
  npm config set cache /tmp/.npm --global && \
  npm config set update-notifier false --global

COPY package.json package-lock.json ./
RUN npm ci --no-audit --prefer-offline

COPY . .

CMD if [ "$NODE_ENV" = "production" ]; then \
  npm run build && node build/index.js; \
  else \
  npx nodemon src/index.ts; \
  fi