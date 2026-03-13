import React, { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useConsultations } from "../../context/ConsultationContext";
import { ProfileCard } from "../profile/ProfileCard";
import { EditProfileForm } from "../profile/EditProfileForm";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  ArrowRight,
  CalendarDays,
  FileHeart,
  HeartPulse,
  Hospital,
  ShieldPlus,
  UserRound,
} from "lucide-react";

function FieldRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <span className="text-sm text-slate-700">{value || "未填写"}</span>
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { consultations } = useConsultations();
  const [editing, setEditing] = useState(false);

  const stats = useMemo(() => {
    const total = consultations.length;
    const completed = consultations.filter((item) => item.status === "completed").length;
    const active = consultations.filter((item) => item.status !== "completed").length;
    return { total, completed, active };
  }, [consultations]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const recentConsultations = consultations.slice(0, 3);

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[linear-gradient(180deg,_#f8fbfb_0%,_#f3f7f7_45%,_#eef6f5_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-teal-700">个人中心</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">我的资料</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            在这里管理你的个人信息、查看问诊统计，并快速回到最近的咨询记录。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <ProfileCard user={user} onEdit={() => setEditing(true)} onEditAvatar={() => setEditing(true)} />

          <div className="space-y-6">
            <Card className="rounded-[28px] border-slate-200/80 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">基础信息</CardTitle>
                <CardDescription>根据你的身份展示对应资料字段。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FieldRow label="姓名" value={user.name} />
                <FieldRow label="邮箱" value={user.email} />
                {user.role === "patient" ? (
                  <>
                    <FieldRow label="手机号" value={user.phone} />
                    <FieldRow label="出生日期" value={user.birthDate} />
                    <FieldRow label="性别" value={user.gender} />
                    <FieldRow label="过敏史" value={user.allergies} />
                    <div className="md:col-span-2">
                      <FieldRow label="既往病史" value={user.medicalHistory} />
                    </div>
                  </>
                ) : (
                  <>
                    <FieldRow label="医院" value={user.hospital} />
                    <FieldRow label="科室" value={user.department} />
                    <FieldRow label="职称" value={user.title} />
                    <FieldRow label="手机号" value={user.phone} />
                    <div className="md:col-span-2">
                      <FieldRow label="个人简介" value={user.bio} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-[28px] border-slate-200/80 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">咨询统计</CardTitle>
                  <CardDescription>帮助你快速了解近期问诊活跃度。</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-teal-50 p-4">
                    <div className="flex items-center gap-2 text-teal-700"><FileHeart className="h-4 w-4" /> 总咨询</div>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.total}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-700"><HeartPulse className="h-4 w-4" /> 进行中</div>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.active}</p>
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-4">
                    <div className="flex items-center gap-2 text-sky-700"><ShieldPlus className="h-4 w-4" /> 已完成</div>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.completed}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-slate-200/80 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">资料概览</CardTitle>
                  <CardDescription>根据身份给出简洁的职业或健康档案摘要。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="mb-2 flex items-center gap-2 text-slate-900">
                      {user.role === "doctor" ? <Hospital className="h-4 w-4 text-teal-600" /> : <UserRound className="h-4 w-4 text-teal-600" />}
                      <span className="font-medium">{user.role === "doctor" ? "医生执业信息" : "个人健康档案"}</span>
                    </div>
                    {user.role === "doctor"
                      ? `${user.hospital || "未填写医院"} · ${user.department || "未填写科室"} · ${user.title || "未填写职称"}`
                      : `${user.gender || "未填写性别"} · ${user.birthDate || "未填写出生日期"} · ${user.phone || "未填写手机号"}`}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="mb-2 flex items-center gap-2 text-slate-900">
                      <CalendarDays className="h-4 w-4 text-teal-600" />
                      <span className="font-medium">最近咨询趋势</span>
                    </div>
                    最近共有 {stats.total} 条咨询记录，可进入咨询记录页查看完整内容。
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[28px] border-slate-200/80 bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-900">咨询记录</CardTitle>
                  <CardDescription>展示最近的问诊记录，便于快速回顾。</CardDescription>
                </div>
                <Button variant="outline" onClick={() => navigate("/consultations")}>
                  查看全部
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentConsultations.length > 0 ? (
                  recentConsultations.map((consultation) => (
                    <button
                      key={consultation.id}
                      type="button"
                      onClick={() => navigate(`/consultation/${consultation.id}`)}
                      className="flex w-full flex-col items-start rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left transition hover:border-teal-200 hover:bg-teal-50/50"
                    >
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="font-medium text-slate-900">{consultation.patientName || consultation.symptoms}</span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-500">{consultation.status}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{consultation.symptoms}</p>
                      <span className="mt-3 text-xs text-slate-400">{consultation.createdAt}</span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-500">
                    暂无咨询记录，开始一次 AI 问诊后会在这里显示。
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EditProfileForm
        open={editing}
        onOpenChange={setEditing}
        user={user}
        onSave={async (payload) => {
          await updateProfile(payload);
          toast.success("个人资料已更新");
        }}
      />
    </div>
  );
}
