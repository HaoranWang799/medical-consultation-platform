import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { users } from "../store.js";
import { signToken, authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import type { User, UserRole } from "../types.js";

const router = Router();

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

  const user = [...users.values()].find(
    (u) => u.email === email && u.role === role
  );

  if (!user) {
    res.status(401).json({ message: "邮箱或密码错误" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "邮箱或密码错误" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
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

  const existing = [...users.values()].find(
    (u) => u.email === email && u.role === role
  );
  if (existing) {
    res.status(409).json({ message: "该邮箱已被注册" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };

  users.set(user.id, user);

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me
router.get("/me", authenticate, (req: AuthRequest, res: Response): void => {
  const user = users.get(req.user!.userId);
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

export default router;
