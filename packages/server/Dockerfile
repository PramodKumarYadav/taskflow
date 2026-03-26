FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY feature-flags/package*.json ./feature-flags/
COPY packages/server/package*.json ./packages/server/

FROM base AS dev
RUN npm install
COPY feature-flags ./feature-flags
COPY packages/server ./packages/server
COPY tsconfig.base.json .
EXPOSE 4000
CMD ["npm", "run", "dev", "--workspace=packages/server"]

FROM base AS builder
RUN npm install --production=false
COPY feature-flags ./feature-flags
COPY packages/server ./packages/server
COPY tsconfig.base.json .
RUN npm run build --workspace=feature-flags
RUN npm run build --workspace=packages/server

FROM builder AS pruner
RUN npm prune --omit=dev

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=pruner /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/feature-flags/dist ./feature-flags/dist
COPY --from=builder /app/feature-flags/package.json ./feature-flags/package.json
COPY --from=builder /app/packages/server/.env.vault ./.env.vault
EXPOSE 4000
CMD ["node", "dist/index.js"]
