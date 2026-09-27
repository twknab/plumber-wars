FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html vite.config.js art-hash.js .build-id* ./
COPY server ./server
COPY src ./src
COPY public ./public
RUN npm run build

# Runtime: a zero-dependency Node server (static game + /api/scores leaderboard on Firestore).
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080 STATIC_DIR=/app/dist
COPY server ./server
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8080
CMD ["node", "server/server.mjs"]
