# Development Dockerfile (keep this as dockerfile)
FROM node:16.14.0-alpine

WORKDIR /app

# Configure npm
RUN mkdir -p /tmp/.npm && \
  npm config set cache /tmp/.npm --global && \
  npm config set update-notifier false --global

COPY package.json package-lock.json ./
RUN npm ci --no-audit --prefer-offline

COPY . .

CMD ["npx", "nodemon", "src/index.ts"]  # Simplified for dev