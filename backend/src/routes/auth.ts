import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { signToken, authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import type { UserRole } from "../types.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

function asUserRole(role: string): UserRole {
  return role === "doctor" ? "doctor" : "patient";
}

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: UserRole;
  };

  if (!email || !password || !role) {
    res.status(400).json({ message: "邮箱、密码和角色均为必填项" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email_role: { email, role } },
  });

  if (!user) {
    res.status(401).json({ message: "邮箱或密码错误" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ message: "邮箱或密码错误" });
    return;
  }

  const token = signToken({ userId: user.id, role: asUserRole(user.role) });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: asUserRole(user.role) },
  });
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
  };

  if (!name || !email || !password || !role) {
    res.status(400).json({ message: "姓名、邮箱、密码和角色均为必填项" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: "密码长度至少6位" });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email_role: { email, role } },
  });
  if (existing) {
    res.status(409).json({ message: "该邮箱已被注册" });
    return;
  }

  const user = await prisma.user.create({
    data: {
      id: `user-${Date.now()}`,
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
    },
  });

  const token = signToken({ userId: user.id, role: asUserRole(user.role) });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: asUserRole(user.role) },
  });
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: asUserRole(user.role) });
});

export default router;
