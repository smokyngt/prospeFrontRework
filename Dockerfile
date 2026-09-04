FROM oven/bun:1.4.0-alpine@sha256:07235578f79ef8c6f97d94aee7938e76f5cdba5f21ae5dbfdd3d3d38058437eb AS build

WORKDIR /app

COPY workspace/sdk/package.json workspace/sdk/bun.lock ./workspace/sdk/
COPY workspace/sdk/tsconfig.json ./workspace/sdk/
COPY workspace/sdk/src ./workspace/sdk/src/
WORKDIR /app/workspace/sdk
RUN bun install --frozen-lockfile && bun run build

WORKDIR /app
COPY sdks/typescript/package.json sdks/typescript/bun.lock ./sdks/typescript/
COPY sdks/typescript/tsconfig.json ./sdks/typescript/
COPY sdks/typescript/src ./sdks/typescript/src/
WORKDIR /app/sdks/typescript
RUN bun install --frozen-lockfile && bun run build

WORKDIR /app
COPY landing/package.json landing/bun.lock ./landing/
WORKDIR /app/landing
RUN bun install --frozen-lockfile

ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_WORKSPACE_URL
ENV NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}
ENV NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID}
ENV NEXT_PUBLIC_WORKSPACE_URL=${NEXT_PUBLIC_WORKSPACE_URL}

COPY landing/ ./

RUN bun run build

FROM oven/bun:1.4.0-alpine@sha256:07235578f79ef8c6f97d94aee7938e76f5cdba5f21ae5dbfdd3d3d38058437eb AS runtime

RUN apk update && apk upgrade --no-cache \
 && apk add --no-cache curl tini

RUN addgroup -S -g 1001 nextjs \
 && adduser -S -u 1001 -G nextjs -h /app -D nextjs

WORKDIR /app

COPY --from=build --chown=nextjs:nextjs /app/landing/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/landing/.next/static ./.next/static
RUN set -eux; \
    blog_chunk="$(find ./.next/static/chunks/app/blog -maxdepth 1 -type f -name 'page-*.js' | head -n 1)"; \
    if [ -n "$blog_chunk" ]; then cp "$blog_chunk" ./.next/static/chunks/app/blog/page-3594227095b5dc2a.js; fi
COPY --from=build --chown=nextjs:nextjs /app/landing/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV BUN_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -sf http://localhost:3000/ || exit 1

ENTRYPOINT ["tini", "-s", "--"]
CMD ["bun", "run", "server.js"]

