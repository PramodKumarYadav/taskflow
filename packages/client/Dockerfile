FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY packages/client/package*.json ./packages/client/
COPY tsconfig.base.json ./

FROM base AS dev
RUN npm install
COPY packages/client ./packages/client
EXPOSE 5173
CMD ["npm", "run", "dev", "--workspace=packages/client", "--", "--host"]

FROM base AS builder
RUN npm install
COPY packages/client ./packages/client
RUN npm run build --workspace=packages/client

FROM nginx:alpine AS production
RUN apk add --no-cache gettext
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf.template
EXPOSE 80
# At startup, detect DNS resolver from /etc/resolv.conf and substitute ${BACKEND_URL} and ${RESOLVER}
CMD ["/bin/sh", "-c", "export RESOLVER=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf) && envsubst '${BACKEND_URL} ${RESOLVER}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
