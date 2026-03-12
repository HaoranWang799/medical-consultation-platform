import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.js";
import consultationsRouter from "./routes/consultations.js";
import aiRouter from "./routes/ai.js";
import { ensureDefaultUsers } from "./lib/seed.js";
import { prisma } from "./lib/prisma.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ── 中间件 ──────────────────────────────────────────────────────────────────
// 开发模式才需要 CORS（生产模式前后端同源）
if (!IS_PRODUCTION) {
  const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
}
app.use(express.json());

// ── API 路由 ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/consultations", consultationsRouter);
app.use("/api/ai", aiRouter);

// 健康检查
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 生产环境：托管前端静态文件 ─────────────────────────────────────────────
if (IS_PRODUCTION) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // backend/src/index.ts → ../../dist = 项目根目录 dist/（Vite 构建产物）
  const staticPath = path.resolve(__dirname, "../../dist");

  app.use(express.static(staticPath));

  // SPA fallback：所有非 API 路由都返回 index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

// ── 启动 ────────────────────────────────────────────────────────────────────
async function waitForDatabase(maxRetries = 10, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect();
      console.log(`✅ 数据库连接成功 (第 ${attempt} 次尝试)`);
      return;
    } catch (err) {
      console.log(`⏳ 数据库连接失败 (第 ${attempt}/${maxRetries} 次)，${delayMs / 1000}s 后重试...`);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function bootstrap(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error("❌ 缺少 DATABASE_URL 环境变量，请在 Railway 中添加 PostgreSQL 数据库并关联变量");
    process.exit(1);
  }

  console.log("⏳ 正在连接数据库...");
  await waitForDatabase();

  await ensureDefaultUsers();

  app.listen(PORT, () => {
    console.log(`✅ 服务已启动: http://localhost:${PORT}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   AI_API_BASE: ${process.env.AI_API_BASE ?? "(未设置，使用默认 OpenAI)"}`);
    console.log(`   AI_MODEL: ${process.env.AI_MODEL ?? "(未设置, 使用默认 deepseek-chat)"}`);
    if (!IS_PRODUCTION) {
      console.log("   默认账号 - 患者: patient@example.com / patient123");
      console.log("   默认账号 - 医生: doctor@example.com  / doctor123");
    }
  });
}

bootstrap().catch((error) => {
  console.error("❌ 启动失败:", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
