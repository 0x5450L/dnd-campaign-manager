FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY shared ./shared
COPY server ./server
COPY client ./client
RUN npm run build -w shared \
 && DATABASE_URL="postgresql://build:build@localhost:5432/build" npm run db:generate -w server \
 && npm run build -w server \
 && npm run build -w client

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV CLIENT_DIST_PATH=/app/client/dist

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY server/certs ./certs

ARG BUILD_VERSION=""
ENV BUILD_VERSION=$BUILD_VERSION

EXPOSE 3001
CMD ["node", "server/dist/index.js"]
