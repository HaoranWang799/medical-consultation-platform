import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useConsultations, ConsultationStatus } from "../../context/ConsultationContext";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Stethoscope,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  LogOut,
  Activity,
  MessageCircle,
} from "lucide-react";

const statusConfig: Record<ConsultationStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "待处理", color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertCircle },
  doctor_replied: { label: "已回复", color: "bg-blue-100 text-blue-700 border-blue-200", icon: MessageCircle },
  completed: { label: "已完成", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
};

type FilterStatus = "all" | ConsultationStatus;

export function DoctorDashboardPage() {
  const { consultations, fetchConsultations } = useConsultations();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>("all");

  // 每 10 秒自动刷新咨询列表
  useEffect(() => {
    const timer = setInterval(() => {
      fetchConsultations();
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchConsultations]);

  const filtered =
    filter === "all"
      ? consultations
      : consultations.filter((c) => c.status === filter);

  const stats = [
    {
      label: "总咨询",
      value: consultations.length,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "待处理",
      value: consultations.filter((c) => c.status === "pending").length,
      icon: AlertCircle,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "已回复",
      value: consultations.filter((c) => c.status === "doctor_replied").length,
      icon: Clock,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "已完成",
      value: consultations.filter((c) => c.status === "completed").length,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="leading-tight">医生工作台</h2>
              <p className="text-xs text-muted-foreground">
                欢迎回来,{user?.name || "张医生"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            退出
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {(
            [
              { key: "all" as FilterStatus, label: "全部" },
              { key: "pending" as FilterStatus, label: "待处理" },
              { key: "doctor_replied" as FilterStatus, label: "已回复" },
              { key: "completed" as FilterStatus, label: "已完成" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === t.key
                  ? "bg-primary text-white"
                  : "bg-white border text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Consultation List */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              患者咨询列表
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Table Header - Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-muted-foreground border-b">
              <div className="col-span-2">患者</div>
              <div className="col-span-5">症状描述</div>
              <div className="col-span-2">时间</div>
              <div className="col-span-2">状态</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y">
              {filtered.map((c) => {
                const status = statusConfig[c.status];
                return (
                  <div
                    key={c.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-4 hover:bg-muted/50 cursor-pointer transition-colors rounded-lg group"
                    onClick={() => navigate(`/consultation/${c.id}`)}
                  >
                    <div className="md:col-span-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{c.patientName}</span>
                    </div>
                    <div className="md:col-span-5">
                      <p className="text-sm text-muted-foreground truncate">
                        {c.symptoms}
                      </p>
                    </div>
                    <div className="md:col-span-2 flex items-center">
                      <span className="text-xs text-muted-foreground">
                        {c.createdAt}
                      </span>
                    </div>
                    <div className="md:col-span-2 flex items-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="md:col-span-1 flex items-center justify-end">
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Stethoscope className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">暂无咨询记录</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
