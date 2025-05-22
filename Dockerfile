FROM node:16.20.2-alpine

WORKDIR /app

# Create non-root user and set permissions
RUN mkdir -p /tmp/.npm && \
  chown -R node:node /app /tmp/.npm

USER node  # ← Switch to non-root user

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

COPY --chown=node:node . .

# Production: Build and run JS
# Development: Skip build (nodemon runs TS directly)
CMD if [ "$NODE_ENV" = "production" ]; then \
  npm run build && node build/index.js; \
  else \
  npm run dev; \
  fi