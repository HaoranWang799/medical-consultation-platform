import React, { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { EditProfileForm } from "../profile/EditProfileForm";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { BellRing, ShieldCheck, UserCog } from "lucide-react";

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[linear-gradient(180deg,_#f9fbfb_0%,_#f2f7f6_100%)] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-teal-700">账户设置</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">管理个人账户</h1>
          <p className="max-w-2xl text-sm text-slate-500">
            调整公开信息、完善执业或健康档案，并保持你的账户资料始终最新。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-[28px] border-slate-200/80 bg-white shadow-lg md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <UserCog className="h-5 w-5 text-teal-600" />
                资料维护
              </CardTitle>
              <CardDescription>所有资料变更都会同步到个人中心与导航账户区域。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">当前账户</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{user.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">身份角色</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{user.role === "doctor" ? "医生" : "患者"}</p>
                  <p className="mt-1 text-sm text-slate-500">可在这里维护与你角色相关的资料字段。</p>
                </div>
              </div>

              <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">编辑个人资料</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      支持更新头像链接、手机号，以及患者或医生专属信息字段。
                    </p>
                  </div>
                  <Badge className="bg-white text-teal-700 shadow-sm">实时同步</Badge>
                </div>
                <Button className="mt-4 bg-teal-600 hover:bg-teal-700" onClick={() => setEditing(true)}>
                  修改资料
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-slate-200/80 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">账户提示</CardTitle>
              <CardDescription>让资料页更完善的小建议。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  资料完整度
                </div>
                建议补充手机号和身份相关字段，便于后续沟通与资料展示。
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-900">
                  <BellRing className="h-4 w-4 text-teal-600" />
                  体验建议
                </div>
                头像、简介和专业信息越完整，越容易建立用户信任感。
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditProfileForm
        open={editing}
        onOpenChange={setEditing}
        user={user}
        title="账户设置"
        onSave={async (payload) => {
          await updateProfile(payload);
          toast.success("账户设置已保存");
        }}
      />
    </div>
  );
}
