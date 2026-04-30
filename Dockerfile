# Shared multi-stage Dockerfile for all MCP servers
# Usage: docker build --build-arg SERVER=moysklad -t theyahia/moysklad-mcp .

FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
ARG SERVER
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json turbo.json ./
COPY packages/core/package.json packages/core/
COPY servers/${SERVER}/package.json servers/${SERVER}/
RUN pnpm install --frozen-lockfile
COPY packages/core/ packages/core/
COPY servers/${SERVER}/ servers/${SERVER}/
RUN pnpm turbo build --filter=@theyahia/${SERVER}-mcp

FROM node:20-alpine AS runner
RUN addgroup -g 1001 mcp && adduser -u 1001 -G mcp -s /bin/sh -D mcp
WORKDIR /app
ARG SERVER
COPY --from=builder /app/servers/${SERVER}/dist ./dist/
COPY --from=builder /app/servers/${SERVER}/package.json ./
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/packages/core/dist ./node_modules/@theyahia/mcp-core/dist/
COPY --from=builder /app/packages/core/package.json ./node_modules/@theyahia/mcp-core/
USER mcp
EXPOSE 3000
ENV HTTP_PORT=3000
CMD ["node", "dist/index.js", "--http"]
