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

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function identifyAccount(input: string): { email?: string } | null {
  const trimmed = input.trim();
  const normalizedEmail = normalizeEmail(trimmed);
  if (isEmail(normalizedEmail)) {
    return { email: normalizedEmail };
  }

  return null;
}

async function findUserByAccount(account: { email?: string }, role: UserRole) {
  if (account.email) {
    return prisma.user.findUnique({
      where: { email_role: { email: account.email, role } },
    });
  }

  return null;
}

// GET /api/auth/check-account?account={email}[&role={role}]
router.get("/check-account", async (req: Request, res: Response): Promise<void> => {
  const accountInput = typeof req.query.account === "string" ? req.query.account : "";
  const rawRole = typeof req.query.role === "string" ? req.query.role : "";
  const account = identifyAccount(accountInput);

  if (!account) {
    res.status(400).json({ message: "请输入有效的邮箱" });
    return;
  }

  const exists = rawRole
    ? Boolean(await findUserByAccount(account, asUserRole(rawRole)))
    : Boolean(
        await prisma.user.findFirst({
          where: { email: account.email },
        })
      );

  res.json({ exists });
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { account, password, role } = req.body as {
    account?: string;
    password?: string;
    role?: UserRole;
  };

  if (!account || !password || !role) {
    res.status(400).json({ message: "邮箱、密码和角色均为必填项" });
    return;
  }

  const accountInfo = identifyAccount(account);
  if (!accountInfo) {
    res.status(400).json({ message: "请输入有效的邮箱" });
    return;
  }

  const user = await findUserByAccount(accountInfo, role);

  if (!user) {
    res.status(401).json({ message: "账号或密码错误" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ message: "账号或密码错误" });
    return;
  }

  const token = signToken({ userId: user.id, role: asUserRole(user.role) });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: asUserRole(user.role),
    },
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

  const normalizedEmail = email ? normalizeEmail(email) : "";

  if (!name || !password || !role || !normalizedEmail) {
    res.status(400).json({ message: "姓名、邮箱、密码和角色均为必填项" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: "密码长度至少6位" });
    return;
  }

  if (normalizedEmail && !isEmail(normalizedEmail)) {
    res.status(400).json({ message: "邮箱格式不正确" });
    return;
  }

  const existing = await prisma.user.findFirst({
    where: {
      role,
      email: normalizedEmail,
    },
  });
  if (existing) {
    res.status(409).json({ message: "该邮箱已被注册" });
    return;
  }

  const user = await prisma.user.create({
    data: {
      id: `user-${Date.now()}`,
      name,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role,
    },
  });

  const token = signToken({ userId: user.id, role: asUserRole(user.role) });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: asUserRole(user.role),
    },
  });
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: asUserRole(user.role),
  });
});

export default router;
