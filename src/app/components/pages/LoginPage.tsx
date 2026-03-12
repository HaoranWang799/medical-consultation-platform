import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, UserRole } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Heart, Stethoscope, Activity, ArrowRight } from "lucide-react";

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState<UserRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password, role);
      navigate(role === "doctor" ? "/doctor" : "/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, password, role);
      navigate(role === "doctor" ? "/doctor" : "/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请重试");
    } finally {
      setSubmitting(false);
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {tab === "login" ? "欢迎回来" : "创建账户"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {tab === "login" ? "请输入您的账号信息以登录" : "填写信息以开始使用服务"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-muted rounded-xl">
              <button
                type="button"
                onClick={() => setRole("patient")}
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
                onClick={() => setRole("doctor")}
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

            <Tabs value={tab} onValueChange={(v) => { setTab(v); setError(""); }} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="register">注册</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 data-[state=inactive]:hidden animate-in fade-in slide-in-from-right-4 duration-300">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">邮箱</label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none">密码</label>
                        <a href="#" className="text-xs text-primary hover:underline" onClick={(e) => e.preventDefault()}>忘记密码?</a>
                     </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow" disabled={submitting}>
                    {submitting ? "登录中..." : (
                      <span className="flex items-center gap-2">
                        登录 <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 data-[state=inactive]:hidden animate-in fade-in slide-in-from-right-4 duration-300">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">姓名</label>
                    <Input
                      placeholder="您的真实姓名"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">邮箱</label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
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
                  <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow" disabled={submitting}>
                    {submitting ? "注册中..." : "创建账户"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

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
