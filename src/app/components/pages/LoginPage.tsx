import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, UserRole } from "../../context/AuthContext";
import { api } from "../../../lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Heart, Stethoscope, Activity, ArrowRight } from "lucide-react";

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetEmailCheckState = () => {
    setEmailChecked(false);
    setEmailExists(false);
    setPassword("");
    setConfirmPassword("");
  };

  const handleCheckEmail = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("请输入邮箱地址");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await api.get<{ exists: boolean }>(
        `/auth/check-email?email=${encodeURIComponent(normalizedEmail)}&role=${role}`
      );
      setEmail(normalizedEmail);
      setEmailExists(result.exists);
      setEmailChecked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "邮箱校验失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

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
      const derivedName = email.split("@")[0] || "用户";
      await register(derivedName, email, password, role);
      navigate(role === "doctor" ? "/doctor" : "/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Hero / Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/40 to-transparent" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-2">
            <Activity className="w-8 h-8 text-primary" />
            医问诊
          </div>
          <p className="text-white/60">智能医疗问诊平台</p>
        </div>

        <div className="relative z-10 max-w-lg">
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            "结合人工智能与专业医疗资源，为您提供准确、快速的健康咨询服务。每一份健康，都值得被认真对待。"
          </blockquote>
          <cite className="text-white/60 not-italic block">— 医问诊团队</cite>
        </div>

        <div className="relative z-10 text-sm text-white/40">
          © 2026 Medical Consultation Platform
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">欢迎使用医问诊</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {!emailChecked ? "请输入邮箱，系统将自动识别登录或注册" : emailExists ? "检测到账号，请输入密码登录" : "未检测到账号，请设置密码完成注册"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-muted rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setRole("patient");
                  setError("");
                  if (emailChecked) {
                    resetEmailCheckState();
                  }
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  role === "patient"
                    ? "bg-white text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className="w-4 h-4" />
                患者
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("doctor");
                  setError("");
                  if (emailChecked) {
                    resetEmailCheckState();
                  }
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  role === "doctor"
                    ? "bg-white text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                医生
              </button>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                 <span>⚠️</span> {error}
              </div>
            )}

            <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
              {!emailChecked && (
                <form onSubmit={handleCheckEmail} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">邮箱</label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                        if (emailChecked) {
                          resetEmailCheckState();
                        }
                      }}
                      onBlur={() => {
                        if (!emailChecked && email.trim()) {
                          void handleCheckEmail();
                        }
                      }}
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow" disabled={loading}>
                    {loading ? "检测中..." : (
                      <span className="flex items-center gap-2">
                        下一步 <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              )}

              {emailChecked && emailExists && (
                <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">邮箱</label>
                    <Input value={email} readOnly className="h-11 bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium leading-none">密码</label>
                      <button
                        type="button"
                        onClick={resetEmailCheckState}
                        className="text-xs text-primary hover:underline"
                      >
                        更换邮箱
                      </button>
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow" disabled={loading}>
                    {loading ? "登录中..." : "登录"}
                  </Button>
                </form>
              )}

              {emailChecked && !emailExists && (
                <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">邮箱</label>
                    <Input value={email} readOnly className="h-11 bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">设置密码</label>
                    <Input
                      type="password"
                      placeholder="至少 6 位字符"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium leading-none">确认密码</label>
                      <button
                        type="button"
                        onClick={resetEmailCheckState}
                        className="text-xs text-primary hover:underline"
                      >
                        更换邮箱
                      </button>
                    </div>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow" disabled={loading}>
                    {loading ? "注册中..." : "注册"}
                  </Button>
                </form>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground mt-6">
              继续即表示您同意我们的<br/>
              <a href="#" className="underline underline-offset-4 hover:text-primary">服务条款</a> 和 <a href="#" className="underline underline-offset-4 hover:text-primary">隐私政策</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
