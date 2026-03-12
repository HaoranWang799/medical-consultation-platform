import { Router } from "express";
import type { Response } from "express";
import { authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import type { ConsultationStatus } from "../types.js";
import { prisma } from "../lib/prisma.js";
import { formatDateTimeCN, formatTimeCN } from "../lib/time.js";

const router = Router();

router.use(authenticate);

type DbConsultation = Awaited<
  ReturnType<typeof prisma.consultation.findFirst>
> & {
  id: string;
  patientId: string;
  doctorId: string | null;
  symptoms: string;
  status: string;
  createdAt: Date;
  patient: { id: string; name: string };
  messages: Array<{ id: string; senderId: string | null; content: string; createdAt: Date }>;
};

function resolveSender(
  consultation: { patientId: string; doctorId: string | null },
  senderId: string | null
): "patient" | "doctor" | "ai" {
  if (!senderId) {
    return "ai";
  }
  if (senderId === consultation.patientId) {
    return "patient";
  }
  if (consultation.doctorId && senderId === consultation.doctorId) {
    return "doctor";
  }
  return "doctor";
}

function toApiConsultation(consultation: DbConsultation) {
  return {
    id: consultation.id,
    patientId: consultation.patientId,
    doctorId: consultation.doctorId,
    patientName: consultation.patient.name,
    symptoms: consultation.symptoms,
    status: consultation.status,
    createdAt: formatDateTimeCN(consultation.createdAt),
    messages: consultation.messages.map((m) => ({
      id: m.id,
      consultationId: consultation.id,
      sender: resolveSender(consultation, m.senderId),
      content: m.content,
      timestamp: formatTimeCN(m.createdAt),
    })),
  };
}

// GET /api/consultations
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const where = req.user!.role === "doctor" ? {} : { patientId: req.user!.userId };

  const all = await prisma.consultation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      patient: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  res.json(all.map((c) => toApiConsultation(c as DbConsultation)));
});

// GET /api/consultations/:id
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  const c = await prisma.consultation.findUnique({
    where: { id: req.params.id },
    include: {
      patient: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!c) {
    res.status(404).json({ message: "咨询记录未找到" });
    return;
  }

  if (req.user!.role === "patient" && c.patientId !== req.user!.userId) {
    res.status(403).json({ message: "无权访问此咨询" });
    return;
  }

  res.json(toApiConsultation(c as DbConsultation));
});

// POST /api/consultations
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
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
  const consultationId = `C${Date.now()}`;

  await prisma.consultation.create({
    data: {
      id: consultationId,
      patientId: userId,
      symptoms,
      status: "pending",
    },
  });

  if (initialMessages.length > 0) {
    await prisma.message.createMany({
      data: initialMessages.map((m, index) => ({
        id: `m-${Date.now()}-${index}`,
        consultationId,
        senderId: m.sender === "patient" ? userId : null,
        content: m.content,
      })),
    });
  }

  const created = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: {
      patient: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  res.status(201).json(toApiConsultation(created as DbConsultation));
});

// POST /api/consultations/:id/messages
router.post("/:id/messages", async (req: AuthRequest, res: Response): Promise<void> => {
  const c = await prisma.consultation.findUnique({ where: { id: req.params.id } });

  if (!c) {
    res.status(404).json({ message: "咨询记录未找到" });
    return;
  }

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

  const senderId = req.user!.userId;
  const message = await prisma.message.create({
    data: {
      id: `m-${Date.now()}`,
      consultationId: c.id,
      senderId,
      content,
    },
  });

  if (req.user!.role === "doctor" && c.status === "pending") {
    await prisma.consultation.update({
      where: { id: c.id },
      data: {
        status: "doctor_replied",
        doctorId: c.doctorId ?? senderId,
      },
    });
  }

  if (req.user!.role === "doctor" && !c.doctorId) {
    await prisma.consultation.update({
      where: { id: c.id },
      data: { doctorId: senderId },
    });
  }

  res.status(201).json({
    id: message.id,
    consultationId: c.id,
    sender: req.user!.role,
    content: message.content,
    timestamp: formatTimeCN(message.createdAt),
  });
});

// PATCH /api/consultations/:id/status
router.patch("/:id/status", async (req: AuthRequest, res: Response): Promise<void> => {
  const c = await prisma.consultation.findUnique({ where: { id: req.params.id } });

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

  const updated = await prisma.consultation.update({
    where: { id: c.id },
    data: { status },
    include: {
      patient: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  res.json(toApiConsultation(updated as DbConsultation));
});

export default router;
