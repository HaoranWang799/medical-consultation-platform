import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, UserRole } from "../../context/AuthContext";
import { api } from "../../../lib/api";
import { Activity, Heart, Loader2, Plus, Stethoscope, MessageSquare, Brain, UserCheck, Shield, Zap, HeartPulse } from "lucide-react";

/* ───────── Floating medical icons (decorative) ───────── */

function FloatingIcons() {
  const icons = [
    { Icon: Heart, cls: "top-[12%] left-[8%] w-10 h-10 opacity-[0.06] animate-[float_8s_ease-in-out_infinite]" },
    { Icon: Stethoscope, cls: "top-[28%] right-[12%] w-14 h-14 opacity-[0.05] animate-[float_10s_ease-in-out_1.5s_infinite]" },
    { Icon: Activity, cls: "bottom-[22%] left-[15%] w-12 h-12 opacity-[0.07] animate-[float_9s_ease-in-out_3s_infinite]" },
    { Icon: Plus, cls: "top-[55%] left-[42%] w-8 h-8 opacity-[0.05] animate-[float_7s_ease-in-out_2s_infinite]" },
    { Icon: Heart, cls: "bottom-[35%] right-[18%] w-9 h-9 opacity-[0.06] animate-[float_11s_ease-in-out_4s_infinite]" },
    { Icon: Plus, cls: "top-[8%] right-[35%] w-6 h-6 opacity-[0.08] animate-[float_6s_ease-in-out_0.5s_infinite]" },
  ];

  return (
    <>
      {icons.map(({ Icon, cls }, i) => (
        <Icon key={i} className={`absolute text-white ${cls}`} />
      ))}
    </>
  );
}

/* ───────── Hero left panel ───────── */

function HeroPanel() {
  return (
    <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-700 p-12 text-white">
      {/* subtle plus‑pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M20 18h-2v-2h-1v2h-2v1h2v2h1v-2h2z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <FloatingIcons />

      {/* brand */}
      <div className="relative z-10 animate-[fadeSlideIn_0.6s_ease-out_both]">
        <div className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <Activity className="h-8 w-8 text-emerald-300" />
          医问诊
        </div>
        <p className="mt-1 text-sm text-white/50">智能医疗问诊平台</p>
      </div>

      {/* main copy */}
      <div className="relative z-10 max-w-lg space-y-6 animate-[fadeSlideIn_0.8s_ease-out_0.15s_both]">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
          AI 智能<br />健康问诊
        </h1>
        <p className="text-lg leading-relaxed text-white/70">
          结合人工智能与专业医疗资源，<br />为您提供准确、快速的健康咨询服务。
        </p>

        {/* CTA */}
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="#auth-card"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-teal-900 shadow-lg shadow-black/20 transition hover:bg-emerald-50"
          >
            开始 AI 问诊
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            了解更多
          </a>
        </div>

        {/* trust indicators */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 pt-4 text-sm text-emerald-200/80">
          <span className="flex items-center gap-1.5">✔ AI 辅助诊断</span>
          <span className="flex items-center gap-1.5">✔ 医生专业审核</span>
          <span className="flex items-center gap-1.5">✔ 隐私安全保护</span>
        </div>
      </div>

      <p className="relative z-10 text-xs text-white/30 animate-[fadeSlideIn_1s_ease-out_0.3s_both]">
        © 2026 Medical Consultation Platform
      </p>
    </div>
  );
}

/* ───────── Auth card (right panel) ───────── */

function AuthCard() {
  const { login, register, sendPhoneCode, registerByPhone } = useAuth();
  const navigate = useNavigate();
  const requestIdRef = useRef(0);

  const [role, setRole] = useState<UserRole>("patient");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountExists, setAccountExists] = useState<boolean | null>(null);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [debugCode, setDebugCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizePhone = (value: string) => value.replace(/\D/g, "");
  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
  const isPhone = (value: string) => /^1\d{10}$/.test(normalizePhone(value));

  /* ── 500ms debounced account check ── */
  useEffect(() => {
    const normalized = account.trim();
    const normalizedValue = isEmail(normalized)
      ? normalized.toLowerCase()
      : normalizePhone(normalized);

    if (!normalizedValue || (!isEmail(normalized) && !isPhone(normalized))) {
      setAccountExists(null);
      setCheckingAccount(false);
      setPassword("");
      setConfirmPassword("");
      return;
    }

    setError("");
    setCheckingAccount(true);
    const rid = ++requestIdRef.current;

    const timer = window.setTimeout(async () => {
      try {
        const res = await api.get<{ exists: boolean }>(
          `/auth/check-account?account=${encodeURIComponent(normalizedValue)}&role=${role}`
        );
        if (requestIdRef.current !== rid) return;
        setAccount(normalizedValue);
        setAccountExists(res.exists);
      } catch (err) {
        if (requestIdRef.current !== rid) return;
        setAccountExists(null);
        setError(err instanceof Error ? err.message : "账号检测失败，请重试");
      } finally {
        if (requestIdRef.current === rid) setCheckingAccount(false);
      }
    }, 500);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, role]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(account, password, role);
      navigate(role === "doctor" ? "/doctor" : "/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    setLoading(true);
    try {
      const displayName = isEmail(account) ? account.split("@")[0] || "用户" : `用户${account.slice(-4)}`;
      await register(displayName, account, password, role);
      navigate(role === "doctor" ? "/doctor" : "/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (!verificationCode.trim()) {
      setError("请输入验证码");
      return;
    }

    setLoading(true);
    try {
      await registerByPhone(`用户${account.slice(-4)}`, account, verificationCode, password, role);
      navigate(role === "doctor" ? "/doctor" : "/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!isPhone(account)) {
      setError("请输入有效的手机号");
      return;
    }

    setError("");
    setSendingCode(true);
    try {
      const res = await sendPhoneCode(account, role);
      setCountdown(60);
      setDebugCode(res.debugCode ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "验证码发送失败，请重试");
    } finally {
      setSendingCode(false);
    }
  };

  const resetEmail = () => {
    setAccount("");
    setAccountExists(null);
    setPassword("");
    setConfirmPassword("");
    setVerificationCode("");
    setSendingCode(false);
    setCountdown(0);
    setDebugCode("");
    setError("");
  };

  const modeLabel =
    accountExists === null
      ? "输入邮箱或手机号，系统自动识别登录或注册"
      : accountExists
        ? "已检测到账号，请输入密码"
        : isPhone(account)
          ? "新手机号，请先获取验证码再完成注册"
          : "新邮箱，请设置密码完成注册";

  return (
    <div
      id="auth-card"
      className="flex items-center justify-center bg-gradient-to-b from-teal-900/5 via-teal-100/10 to-white px-6 py-12 lg:px-12"
    >
      <div className="w-full max-w-md animate-[fadeSlideIn_0.7s_ease-out_0.2s_both]">
        {/* Mobile-only brand line */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-teal-800 lg:hidden">
          <Activity className="h-6 w-6" /> 医问诊
        </div>

        <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-xl shadow-teal-900/10">
          <h2 className="text-center text-xl font-semibold text-gray-900">智能登录</h2>
          <p className="mt-1 text-center text-sm text-gray-500 transition-all duration-300">
            {modeLabel}
          </p>

          {/* role selector */}
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
            {(["patient", "doctor"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  resetEmail();
                }}
                className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  role === r
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r === "patient" ? (
                  <><Heart className="h-4 w-4" /> 患者</>
                ) : (
                  <><Stethoscope className="h-4 w-4" /> 医生</>
                )}
              </button>
            ))}
          </div>

          {/* error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 transition-all duration-300">
              {error}
            </div>
          )}

          {/* ── form area ── */}
          <div className="mt-5 space-y-4">
            {/* email */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="account" className="text-sm font-medium text-gray-700">邮箱或手机号</label>
                {accountExists !== null && (
                  <button type="button" onClick={resetEmail} className="text-xs text-teal-600 hover:underline">
                    更换账号
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="account"
                  type="text"
                  value={account}
                  readOnly={accountExists !== null}
                  onChange={(e) => {
                    setAccount(e.target.value);
                    setError("");
                    setAccountExists(null);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  placeholder="name@example.com 或 13800138000"
                  className={`h-11 w-full rounded-lg border border-gray-300 px-3 pr-10 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
                    accountExists !== null ? "bg-gray-50 text-gray-500" : ""
                  }`}
                  required
                />
                {checkingAccount && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-teal-600" />
                )}
              </div>
            </div>

            {/* dynamic fields */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                accountExists === null ? "max-h-0 opacity-0" : "max-h-[420px] opacity-100"
              }`}
            >
              {accountExists === true && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="pwd" className="text-sm font-medium text-gray-700">密码</label>
                    <input
                      id="pwd"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-lg bg-teal-600 font-medium text-white shadow-lg shadow-teal-600/25 transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "登录中…" : "登录"}
                  </button>
                </form>
              )}

              {accountExists === false && !isPhone(account) && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="pwd" className="text-sm font-medium text-gray-700">设置密码</label>
                    <input
                      id="pwd"
                      type="password"
                      placeholder="至少 6 位字符"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="cpwd" className="text-sm font-medium text-gray-700">确认密码</label>
                    <input
                      id="cpwd"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-lg bg-teal-600 font-medium text-white shadow-lg shadow-teal-600/25 transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "注册中…" : "注册"}
                  </button>
                </form>
              )}

              {accountExists === false && isPhone(account) && (
                <form onSubmit={handlePhoneRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="sms-code" className="text-sm font-medium text-gray-700">短信验证码</label>
                    <div className="flex gap-2">
                      <input
                        id="sms-code"
                        type="text"
                        inputMode="numeric"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="6位验证码"
                        className="h-11 flex-1 rounded-lg border border-gray-300 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                        required
                      />
                      <button
                        type="button"
                        disabled={sendingCode || countdown > 0}
                        onClick={handleSendCode}
                        className="h-11 min-w-[112px] rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {sendingCode ? "发送中…" : countdown > 0 ? `${countdown}s` : "获取验证码"}
                      </button>
                    </div>
                    {debugCode && (
                      <p className="text-xs text-amber-600">
                        调试验证码：{debugCode}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="pwd-phone" className="text-sm font-medium text-gray-700">设置密码</label>
                    <input
                      id="pwd-phone"
                      type="password"
                      placeholder="至少 6 位字符"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="cpwd-phone" className="text-sm font-medium text-gray-700">确认密码</label>
                    <input
                      id="cpwd-phone"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-lg bg-teal-600 font-medium text-white shadow-lg shadow-teal-600/25 transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "注册中…" : "验证码注册"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            继续即表示您同意我们的{" "}
            <a href="#" onClick={(e) => e.preventDefault()} className="underline hover:text-teal-600">服务条款</a> 和{" "}
            <a href="#" onClick={(e) => e.preventDefault()} className="underline hover:text-teal-600">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────── Landing Page Sections ───────── */

function HowItWorks() {
  const steps = [
    { icon: MessageSquare, title: "描述症状", desc: "用户输入自己的健康问题" },
    { icon: Brain, title: "AI 初步分析", desc: "AI提出追问并分析症状" },
    { icon: Stethoscope, title: "医生专业解答", desc: "必要时连接真人医生" },
  ];
  return (
    <section className="bg-white py-24 px-6 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">运作方式</h2>
          <p className="mt-4 text-lg text-gray-500">简单的三步，即可获得专业的健康建议</p>
        </div>
        <div className="grid gap-10 md:grid-cols-3 relative">
          <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-0.5 bg-gray-100 z-0"></div>
          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center group cursor-default">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl shadow-teal-900/5 ring-1 ring-gray-900/5 transition-transform duration-300 group-hover:-translate-y-2">
                <step.icon className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Zap, title: "AI智能问诊", desc: "通过AI快速分析健康问题" },
    { icon: UserCheck, title: "医生在线咨询", desc: "真人医生在线解答" },
    { icon: HeartPulse, title: "智能健康建议", desc: "AI提供健康建议" },
    { icon: Shield, title: "隐私安全保护", desc: "医疗数据安全保护" },
  ];
  return (
    <section className="bg-slate-50 py-24 px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">核心功能</h2>
          <p className="mt-4 text-lg text-gray-500">全方位保护您的健康，随时随地触手可及</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div key={i} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600 mb-6">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const items = [
    "AI辅助诊断",
    "专业医生支持",
    "数据隐私保护"
  ];
  return (
    <section className="bg-gradient-to-r from-teal-900 to-emerald-800 py-16 px-6 relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="mx-auto max-w-4xl text-center relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-8">值得信赖的AI医疗助手</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-emerald-100 font-medium">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-300">
                <Shield className="h-4 w-4" />
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-white py-24 px-6 text-center">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">立即开始您的健康咨询</h2>
        <p className="mt-4 text-lg text-gray-500 mb-10 max-w-xl mx-auto">不论是日常健康小问题，还是需要专业医疗建议，医问诊时刻在您身边。</p>
        <a href="#auth-card" className="inline-flex h-14 items-center justify-center rounded-xl bg-teal-600 px-8 text-lg font-semibold text-white shadow-xl shadow-teal-600/25 transition-all hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-2xl hover:shadow-teal-600/30">
          开始 AI 问诊
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-gray-200 py-12 px-6">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Activity className="h-6 w-6 text-teal-600" />
          医问诊
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-teal-600 transition-colors">关于我们</a>
          <a href="#" className="hover:text-teal-600 transition-colors">隐私政策</a>
          <a href="#" className="hover:text-teal-600 transition-colors">服务条款</a>
          <a href="#" className="hover:text-teal-600 transition-colors">联系方式</a>
        </div>
        <div className="text-sm text-gray-400">
          © 2026 Medical Consultation Platform
        </div>
      </div>
    </footer>
  );
}

/* ───────── Page shell ───────── */

export function LoginPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900 scroll-smooth">
      {/* keyframes injected once */}
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-18px) rotate(6deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 1. Hero Section (Split Layout) */}
      <section className="grid min-h-screen lg:grid-cols-2">
        <HeroPanel />
        <AuthCard />
      </section>

      {/* 2. How It Works */}
      <HowItWorks />

      {/* 3. Features */}
      <Features />

      {/* 4. Trust Section */}
      <TrustSection />

      {/* 5. CTA Section */}
      <CTASection />

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}
