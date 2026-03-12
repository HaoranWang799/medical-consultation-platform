# ── 阶段 1：构建前端 ────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── 阶段 2：编译后端 TypeScript ─────────────────────────────────────────────
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --ignore-scripts
COPY backend/ .
RUN npm run build

# ── 阶段 3：生产运行镜像 ────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# 只安装生产依赖
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma
RUN cd backend && npm ci --omit=dev --ignore-scripts && npx prisma generate --schema=./prisma/schema.prisma

# 复制编译产物
COPY --from=frontend-build /app/dist ./dist
COPY --from=backend-build /app/backend/dist ./backend/dist

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "backend/dist/index.js"]
