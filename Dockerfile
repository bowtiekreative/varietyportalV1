# syntax=docker/dockerfile:1

# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Public values are baked at build time (Astro inlines import.meta.env.PUBLIC_*).
ARG PUBLIC_SITE_URL=https://varietyportal.com
ARG PUBLIC_GA_MEASUREMENT_ID=
ARG PUBLIC_CONTACT_EMAIL=
ARG PUBLIC_BOOKING_URL=
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
    PUBLIC_GA_MEASUREMENT_ID=$PUBLIC_GA_MEASUREMENT_ID \
    PUBLIC_CONTACT_EMAIL=$PUBLIC_CONTACT_EMAIL \
    PUBLIC_BOOKING_URL=$PUBLIC_BOOKING_URL

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build && npm prune --omit=dev

# ---- runtime --------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

RUN apk add --no-cache wget && addgroup -g 1001 -S app && adduser -S -u 1001 -G app app

COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
COPY --from=build --chown=app:app /app/package.json ./package.json

USER app
EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4321/api/health || exit 1

CMD ["node", "./dist/server/entry.mjs"]
