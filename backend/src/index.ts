import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import consultationsRouter from "./routes/consultations.js";
import aiRouter from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

// ── 中间件 ──────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

// ── 路由 ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/consultations", consultationsRouter);
app.use("/api/ai", aiRouter);

// 健康检查
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 启动 ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ 后端服务已启动: http://localhost:${PORT}`);
  console.log(`   默认账号 - 患者: patient@example.com / patient123`);
  console.log(`   默认账号 - 医生: doctor@example.com  / doctor123`);
});
