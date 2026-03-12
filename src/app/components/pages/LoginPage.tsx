import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, UserRole } from "../../context/AuthContext";
import { api } from "../../../lib/api";
import { Activity, Heart, Loader2, Plus, Stethoscope } from "lucide-react";

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
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const requestIdRef = useRef(0);

  const [role, setRole] = useState<UserRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── 500ms debounced email check ── */
  useEffect(() => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setEmailExists(null);
      setCheckingEmail(false);
      setPassword("");
      setConfirmPassword("");
      return;
    }

    setError("");
    setCheckingEmail(true);
    const rid = ++requestIdRef.current;

    const timer = window.setTimeout(async () => {
      try {
        const res = await api.get<{ exists: boolean }>(
          `/auth/check-email?email=${encodeURIComponent(normalized)}&role=${role}`
        );
        if (requestIdRef.current !== rid) return;
        setEmail(normalized);
        setEmailExists(res.exists);
      } catch (err) {
        if (requestIdRef.current !== rid) return;
        setEmailExists(null);
        setError(err instanceof Error ? err.message : "邮箱检测失败，请重试");
      } finally {
        if (requestIdRef.current === rid) setCheckingEmail(false);
      }
    }, 500);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, role);
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
      await register(email.split("@")[0] || "用户", email, password, role);
      navigate(role === "doctor" ? "/doctor" : "/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const resetEmail = () => {
    setEmail("");
    setEmailExists(null);
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const modeLabel =
    emailExists === null
      ? "输入邮箱，系统自动识别登录或注册"
      : emailExists
        ? "已检测到账号，请输入密码"
        : "新邮箱，请设置密码完成注册";

  return (
    <div
      id="auth-card"
      className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-white px-6 py-12 lg:px-12"
    >
      <div className="w-full max-w-md animate-[fadeSlideIn_0.7s_ease-out_0.2s_both]">
        {/* Mobile-only brand line */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-teal-800 lg:hidden">
          <Activity className="h-6 w-6" /> 医问诊
        </div>

        <div className="rounded-xl bg-white p-6 shadow-xl ring-1 ring-black/[0.04]">
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
                <label htmlFor="email" className="text-sm font-medium text-gray-700">邮箱</label>
                {emailExists !== null && (
                  <button type="button" onClick={resetEmail} className="text-xs text-teal-600 hover:underline">
                    更换邮箱
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly={emailExists !== null}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setEmailExists(null);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  placeholder="name@example.com"
                  className={`h-11 w-full rounded-lg border border-gray-300 px-3 pr-10 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
                    emailExists !== null ? "bg-gray-50 text-gray-500" : ""
                  }`}
                  required
                />
                {checkingEmail && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-teal-600" />
                )}
              </div>
            </div>

            {/* dynamic fields */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                emailExists === null ? "max-h-0 opacity-0" : "max-h-[420px] opacity-100"
              }`}
            >
              {emailExists === true && (
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

              {emailExists === false && (
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

/* ───────── Page shell ───────── */

export function LoginPage() {
  return (
    <>
      {/* keyframes injected once */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-18px) rotate(6deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="grid min-h-screen lg:grid-cols-2">
        <HeroPanel />
        <AuthCard />
      </div>
    </>
  );
}
