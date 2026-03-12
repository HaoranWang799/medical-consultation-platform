import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { signToken, authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import type { UserRole } from "../types.js";
import { prisma } from "../lib/prisma.js";
import { createPhoneVerificationCode, getPhoneCodeDebug, verifyPhoneCode } from "../lib/phoneVerification.js";
import { getSmsProviderStatus, sendVerificationCodeSms } from "../lib/sms.js";

const router = Router();

function asUserRole(role: string): UserRole {
  return role === "doctor" ? "doctor" : "patient";
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value: string): boolean {
  return /^1\d{10}$/.test(value);
}

function identifyAccount(input: string): { email?: string; phone?: string } | null {
  const trimmed = input.trim();
  const normalizedEmail = normalizeEmail(trimmed);
  if (isEmail(normalizedEmail)) {
    return { email: normalizedEmail };
  }

  const normalizedPhone = normalizePhone(trimmed);
  if (isPhone(normalizedPhone)) {
    return { phone: normalizedPhone };
  }

  return null;
}

async function findUserByAccount(account: { email?: string; phone?: string }, role: UserRole) {
  if (account.email) {
    return prisma.user.findUnique({
      where: { email_role: { email: account.email, role } },
    });
  }

  if (account.phone) {
    return prisma.user.findUnique({
      where: { phone_role: { phone: account.phone, role } },
    });
  }

  return null;
}

// GET /api/auth/check-account?account={emailOrPhone}[&role={role}]
router.get("/check-account", async (req: Request, res: Response): Promise<void> => {
  const accountInput = typeof req.query.account === "string" ? req.query.account : "";
  const rawRole = typeof req.query.role === "string" ? req.query.role : "";
  const account = identifyAccount(accountInput);

  if (!account) {
    res.status(400).json({ message: "请输入有效的邮箱或手机号" });
    return;
  }

  const exists = rawRole
    ? Boolean(await findUserByAccount(account, asUserRole(rawRole)))
    : Boolean(
        await prisma.user.findFirst({
          where: account.email ? { email: account.email } : { phone: account.phone },
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
    res.status(400).json({ message: "邮箱或手机号、密码和角色均为必填项" });
    return;
  }

  const accountInfo = identifyAccount(account);
  if (!accountInfo) {
    res.status(400).json({ message: "请输入有效的邮箱或手机号" });
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
      phone: user.phone ?? undefined,
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
      phone: null,
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
      phone: user.phone ?? undefined,
      role: asUserRole(user.role),
    },
  });
});

// POST /api/auth/send-phone-code
router.post("/send-phone-code", async (req: Request, res: Response): Promise<void> => {
  const { phone, role } = req.body as {
    phone?: string;
    role?: UserRole;
  };

  const normalizedPhone = phone ? normalizePhone(phone) : "";
  if (!normalizedPhone || !role) {
    res.status(400).json({ message: "手机号和角色均为必填项" });
    return;
  }

  if (!isPhone(normalizedPhone)) {
    res.status(400).json({ message: "手机号格式不正确" });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { phone_role: { phone: normalizedPhone, role } },
  });
  if (existing) {
    res.status(409).json({ message: "该手机号已注册，请直接登录" });
    return;
  }

  const code = createPhoneVerificationCode(normalizedPhone, role);
  const debugCode =
    process.env.NODE_ENV !== "production" || process.env.SMS_DEBUG_CODE === "true"
      ? getPhoneCodeDebug(normalizedPhone, role)
      : undefined;

  try {
    const smsStatus = getSmsProviderStatus();
    if (smsStatus.enabled) {
      const result = await sendVerificationCodeSms(normalizedPhone, code);
      console.log(`📱 腾讯云短信发送成功 [${role}] ${normalizedPhone}, serialNo=${result.serialNo ?? "-"}`);
    } else {
      console.log(`📱 调试验证码 [${role}] ${normalizedPhone}: ${code}`);
    }
  } catch (error) {
    console.error("❌ 短信发送失败:", error);
    res.status(502).json({
      message: error instanceof Error ? error.message : "短信发送失败，请稍后重试",
    });
    return;
  }

  res.json({
    message: "验证码已发送",
    ...(debugCode ? { debugCode } : {}),
  });
});

// POST /api/auth/register-by-phone
router.post("/register-by-phone", async (req: Request, res: Response): Promise<void> => {
  const { name, phone, code, password, role } = req.body as {
    name?: string;
    phone?: string;
    code?: string;
    password?: string;
    role?: UserRole;
  };

  const normalizedPhone = phone ? normalizePhone(phone) : "";

  if (!name || !normalizedPhone || !code || !password || !role) {
    res.status(400).json({ message: "姓名、手机号、验证码、密码和角色均为必填项" });
    return;
  }

  if (!isPhone(normalizedPhone)) {
    res.status(400).json({ message: "手机号格式不正确" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: "密码长度至少6位" });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { phone_role: { phone: normalizedPhone, role } },
  });
  if (existing) {
    res.status(409).json({ message: "该手机号已被注册" });
    return;
  }

  if (!verifyPhoneCode(normalizedPhone, role, code.trim())) {
    res.status(400).json({ message: "验证码无效或已过期" });
    return;
  }

  const user = await prisma.user.create({
    data: {
      id: `user-${Date.now()}`,
      name,
      email: `phone-${normalizedPhone}@phone.local`,
      phone: normalizedPhone,
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
      email: "",
      phone: user.phone ?? undefined,
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
    email: user.email.endsWith("@phone.local") ? "" : user.email,
    phone: user.phone ?? undefined,
    role: asUserRole(user.role),
  });
});

export default router;
