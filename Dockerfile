# ビルドステージ
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:client && npm run build:server

# 実行ステージ
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
RUN mkdir -p /app/data && chown appuser:appgroup /app/data
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER appuser
EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DB_PATH=/app/data/dialogos.db
CMD ["node", "dist/server/index.js"]
