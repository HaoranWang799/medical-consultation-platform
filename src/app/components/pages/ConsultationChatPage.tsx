import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useConsultations } from "../../context/ConsultationContext";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Send,
  ArrowLeft,
  UserRound,
  Stethoscope,
  Bot,
  CheckCircle,
} from "lucide-react";

export function ConsultationChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { consultations, addMessage, updateStatus, refreshConsultation } = useConsultations();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const consultation = consultations.find((c) => c.id === id);

  // 定时轮询最新消息（每 5 秒）
  useEffect(() => {
    if (!id || consultation?.status === "completed") return;
    const timer = setInterval(() => {
      refreshConsultation(id);
    }, 5000);
    return () => clearInterval(timer);
  }, [id, consultation?.status, refreshConsultation]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [consultation?.messages]);

  if (!consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">咨询记录未找到</p>
          <Button onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>
    );
  }

  const isDoctor = user?.role === "doctor";

  const sendMessage = () => {
    if (!input.trim()) return;
    addMessage(consultation.id, {
      sender: isDoctor ? "doctor" : "patient",
      content: input,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    });
    if (isDoctor && consultation.status === "pending") {
      updateStatus(consultation.id, "doctor_replied");
    }
    setInput("");
  };

  const handleComplete = () => {
    updateStatus(consultation.id, "completed");
  };

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: "待处理", color: "bg-amber-100 text-amber-700" },
    doctor_replied: { label: "医生已回复", color: "bg-blue-100 text-blue-700" },
    completed: { label: "已完成", color: "bg-green-100 text-green-700" },
  };

  const st = statusLabel[consultation.status];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="leading-tight">
                {isDoctor ? consultation.patientName : "医生咨询"}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">#{consultation.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.color}`}>
                  {st.label}
                </span>
              </div>
            </div>
          </div>
        </div>
        {consultation.status !== "completed" && (
          <Button variant="outline" size="sm" onClick={handleComplete}>
            <CheckCircle className="w-4 h-4 mr-1" />
            结束咨询
          </Button>
        )}
      </div>

      {/* Symptom summary */}
      <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 shrink-0">
        <p className="text-xs text-blue-600 mb-1">症状描述</p>
        <p className="text-sm text-blue-900">{consultation.symptoms}</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {consultation.messages.map((msg) => {
          const isMe =
            (isDoctor && msg.sender === "doctor") ||
            (!isDoctor && msg.sender === "patient");
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === "patient"
                    ? "bg-blue-100 text-blue-600"
                    : msg.sender === "doctor"
                    ? "bg-green-100 text-green-600"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {msg.sender === "patient" ? (
                  <UserRound className="w-5 h-5" />
                ) : msg.sender === "doctor" ? (
                  <Stethoscope className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  isMe
                    ? "bg-primary text-white rounded-tr-sm"
                    : msg.sender === "ai"
                    ? "bg-primary/5 border border-primary/10 rounded-tl-sm"
                    : "bg-white border shadow-sm rounded-tl-sm"
                }`}
              >
                {msg.sender === "ai" && (
                  <p className="text-[10px] text-primary mb-1">AI问诊记录</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1.5 ${
                    isMe ? "text-white/60" : "text-muted-foreground"
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      {consultation.status !== "completed" ? (
        <div className="border-t bg-white p-4 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3 max-w-3xl mx-auto"
          >
            <Input
              placeholder="输入消息..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="border-t bg-muted/50 p-4 text-center text-sm text-muted-foreground shrink-0">
          此咨询已结束
        </div>
      )}
    </div>
  );
}
