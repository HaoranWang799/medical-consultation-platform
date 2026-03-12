import { Router } from "express";
import type { Response } from "express";
import { consultations, messages, users } from "../store.js";
import { authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import type { Consultation, ChatMessage, ConsultationStatus } from "../types.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/** 将咨询对象附上消息列表再返回 */
function withMessages(c: Consultation) {
  return { ...c, messages: messages.get(c.id) ?? [] };
}

// GET /api/consultations
// 医生看全部，患者看自己的
router.get("/", (req: AuthRequest, res: Response): void => {
  const all = [...consultations.values()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const result =
    req.user!.role === "doctor"
      ? all
      : all.filter((c) => c.patientId === req.user!.userId);

  res.json(result.map(withMessages));
});

// GET /api/consultations/:id
router.get("/:id", (req: AuthRequest, res: Response): void => {
  const c = consultations.get(req.params.id);
  if (!c) {
    res.status(404).json({ message: "咨询记录未找到" });
    return;
  }

  // 患者只能查看自己的咨询
  if (req.user!.role === "patient" && c.patientId !== req.user!.userId) {
    res.status(403).json({ message: "无权访问此咨询" });
    return;
  }

  res.json(withMessages(c));
});

// POST /api/consultations — 患者创建新咨询
router.post("/", (req: AuthRequest, res: Response): void => {
  if (req.user!.role !== "patient") {
    res.status(403).json({ message: "只有患者可以创建咨询" });
    return;
  }

  const { symptoms, initialMessages = [] } = req.body as {
    symptoms?: string;
    initialMessages?: Array<{ sender: "patient" | "doctor" | "ai"; content: string; timestamp: string }>;
  };

  if (!symptoms?.trim()) {
    res.status(400).json({ message: "症状描述不能为空" });
    return;
  }

  const userId = req.user!.userId;
  const user = users.get(userId);
  const id = `C${Date.now()}`;
  const now = new Date().toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const c: Consultation = {
    id,
    patientId: userId,
    patientName: user?.name ?? "患者",
    symptoms,
    status: "pending",
    createdAt: now,
  };

  const msgs: ChatMessage[] = initialMessages.map((m, i) => ({
    id: `m-${Date.now()}-${i}`,
    consultationId: id,
    sender: m.sender,
    content: m.content,
    timestamp: m.timestamp,
  }));

  consultations.set(id, c);
  messages.set(id, msgs);

  res.status(201).json(withMessages(c));
});

// POST /api/consultations/:id/messages — 发送消息
router.post("/:id/messages", (req: AuthRequest, res: Response): void => {
  const c = consultations.get(req.params.id);
  if (!c) {
    res.status(404).json({ message: "咨询记录未找到" });
    return;
  }

  // 患者只能给自己的咨询发消息
  if (req.user!.role === "patient" && c.patientId !== req.user!.userId) {
    res.status(403).json({ message: "无权操作此咨询" });
    return;
  }

  if (c.status === "completed") {
    res.status(400).json({ message: "此咨询已结束，无法继续发送消息" });
    return;
  }

  const { content } = req.body as { content?: string };
  if (!content?.trim()) {
    res.status(400).json({ message: "消息内容不能为空" });
    return;
  }

  // sender 由服务端根据 JWT 角色决定，不信任客户端传入值
  const sender = req.user!.role; // "patient" | "doctor"

  const msg: ChatMessage = {
    id: `m-${Date.now()}`,
    consultationId: c.id,
    sender,
    content,
    timestamp: new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  const existing = messages.get(c.id) ?? [];
  existing.push(msg);
  messages.set(c.id, existing);

  // 医生首次回复时将状态更新为 doctor_replied
  if (sender === "doctor" && c.status === "pending") {
    consultations.set(c.id, { ...c, status: "doctor_replied" });
  }

  res.status(201).json(msg);
});

// PATCH /api/consultations/:id/status — 更新状态
router.patch("/:id/status", (req: AuthRequest, res: Response): void => {
  const c = consultations.get(req.params.id);
  if (!c) {
    res.status(404).json({ message: "咨询记录未找到" });
    return;
  }

  if (req.user!.role === "patient" && c.patientId !== req.user!.userId) {
    res.status(403).json({ message: "无权操作此咨询" });
    return;
  }

  const { status } = req.body as { status?: ConsultationStatus };
  const validStatuses: ConsultationStatus[] = ["pending", "doctor_replied", "completed"];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ message: "无效的状态值" });
    return;
  }

  const updated = { ...c, status };
  consultations.set(c.id, updated);
  res.json(withMessages(updated));
});

export default router;
