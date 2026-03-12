import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useConsultations, ChatMessage } from "../../context/ConsultationContext";
import { api } from "../../../lib/api";
import { Bot, Send, UserRound, Stethoscope, Loader2 } from "lucide-react";

export function AIChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addConsultation } = useConsultations();
  const symptoms = (location.state as { symptoms?: string })?.symptoms || "";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /** 调用后端 AI 接口并追加回复消息 */
  const fetchAiReply = async (currentMessages: ChatMessage[]) => {
    setIsTyping(true);
    try {
      const { content } = await api.post<{ content: string }>("/ai/chat", {
        messages: currentMessages.map((m) => ({ role: m.sender, content: m.content })),
        symptoms,
      });
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        content,
        timestamp: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // 网络异常时给出友好提示
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          content: "抱歉，AI 暂时无法响应，请稍后重试或直接咨询真人医生。",
          timestamp: new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (!symptoms) return;
    const userMsg: ChatMessage = {
      id: "init",
      sender: "patient",
      content: symptoms,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([userMsg]);
    fetchAiReply([userMsg]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "patient",
      content: input,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    await fetchAiReply(updated);
  };

  const handleConsultDoctor = async () => {
    const id = await addConsultation(symptoms, messages);
    navigate(`/consultation/${id}`);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="leading-tight">AI智能问诊</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">在线</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/home")}>
          返回首页
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* System message */}
        <div className="text-center">
          <Badge variant="secondary" className="text-xs px-3 py-1">
            AI问诊仅供参考,不替代专业医疗诊断
          </Badge>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "patient" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === "patient"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {msg.sender === "patient" ? (
                <UserRound className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.sender === "patient"
                  ? "bg-primary text-white rounded-tr-sm"
                  : "bg-white border shadow-sm rounded-tl-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p
                className={`text-[10px] mt-1.5 ${
                  msg.sender === "patient" ? "text-white/60" : "text-muted-foreground"
                }`}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-white border shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                AI正在分析...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Consult Doctor Banner */}
      {messages.length >= 3 && (
        <div className="px-4 pb-2">
          <button
            onClick={handleConsultDoctor}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <Stethoscope className="w-5 h-5" />
            <span>咨询真人医生</span>
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t bg-white p-4 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3 max-w-3xl mx-auto"
        >
          <Input
            placeholder="输入您的问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
