FROM node:16.14.0-alpine

WORKDIR /app

# Set npm cache to /tmp and disable logfile
RUN npm config set cache /tmp/.npm --global && \
  npm config set loglevel warn --global && \
  npm config set update-notifier false --global

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD if [ "$NODE_ENV" = "production" ]; then \
  npm run build && node build/index.js; \
  else \
  npm run dev; \
  fi