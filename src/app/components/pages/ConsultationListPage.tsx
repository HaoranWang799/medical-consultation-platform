import React from "react";
import { useNavigate } from "react-router";
import { useConsultations, ConsultationStatus } from "../../context/ConsultationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ClipboardList, ChevronRight, MessageCircle, Plus } from "lucide-react";

const statusConfig: Record<ConsultationStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; color: string }> = {
  pending: { label: "待处理", variant: "secondary", color: "bg-amber-100 text-amber-700 border-amber-200" },
  doctor_replied: { label: "医生已回复", variant: "default", color: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "已完成", variant: "outline", color: "bg-green-100 text-green-700 border-green-200" },
};

export function ConsultationListPage() {
  const { consultations } = useConsultations();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl flex items-center gap-3">
              <ClipboardList className="w-7 h-7 text-primary" />
              我的咨询
            </h1>
            <p className="text-muted-foreground mt-1">查看和管理您的所有咨询记录</p>
          </div>
          <Button onClick={() => navigate("/symptoms")}>
            <Plus className="w-4 h-4 mr-2" />
            新建咨询
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "总咨询", value: consultations.length, color: "text-primary" },
            { label: "待处理", value: consultations.filter((c) => c.status === "pending").length, color: "text-amber-600" },
            { label: "已完成", value: consultations.filter((c) => c.status === "completed").length, color: "text-green-600" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="py-4 text-center">
                <p className={`text-2xl ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {consultations.map((c) => {
            const status = statusConfig[c.status];
            return (
              <Card
                key={c.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(`/consultation/${c.id}`)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-muted-foreground font-mono">
                          #{c.id}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm truncate text-foreground mb-1">{c.symptoms}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{c.createdAt}</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {c.messages.length} 条消息
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {consultations.length === 0 && (
            <div className="text-center py-16">
              <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">暂无咨询记录</p>
              <Button className="mt-4" onClick={() => navigate("/symptoms")}>
                开始第一次咨询
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
