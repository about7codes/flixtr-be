FROM node:16.20.2-alpine

WORKDIR /app

# Create and switch to non-root user (alpine uses numeric UID)
RUN adduser -D -u 1001 nodeuser && \
  mkdir -p /tmp/.npm && \
  chown -R nodeuser:nodeuser /app /tmp/.npm

USER nodeuser

COPY --chown=nodeuser:nodeuser package.json package-lock.json ./
RUN npm ci --cache /tmp/.npm

COPY --chown=nodeuser:nodeuser . .

# Production: Build and run JS
# Development: Skip build (nodemon runs TS directly)
CMD if [ "$NODE_ENV" = "production" ]; then \
  npm run build && node build/index.js; \
  else \
  npm run dev; \
  fi