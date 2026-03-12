import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, UserRole } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Heart, Stethoscope } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl text-primary">医问诊</h1>
          <p className="text-muted-foreground mt-2">智能医疗问诊平台</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle>欢迎使用</CardTitle>
            <CardDescription>选择您的角色并登录或注册</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role selector */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  role === "patient"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <Heart className="w-5 h-5" />
                <span>患者</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  role === "doctor"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <Stethoscope className="w-5 h-5" />
                <span>医生</span>
              </button>
            </div>

            <Tabs value={tab} onValueChange={(v) => { setTab(v); setError(""); }}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="login" className="flex-1">登录</TabsTrigger>
                <TabsTrigger value="register" className="flex-1">注册</TabsTrigger>
              </TabsList>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg mb-4">
                  {error}
                </p>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">邮箱</label>
                    <Input
                      type="email"
                      placeholder="请输入邮箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">密码</label>
                    <Input
                      type="password"
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "登录中..." : "登录"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">姓名</label>
                    <Input
                      placeholder="请输入姓名"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">邮箱</label>
                    <Input
                      type="email"
                      placeholder="请输入邮箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">密码</label>
                    <Input
                      type="password"
                      placeholder="请设置密码（至少6位）"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "注册中..." : "注册"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
