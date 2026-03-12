import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useConsultations, ChatMessage } from "../../context/ConsultationContext";
import { api } from "../../../lib/api";
import { Bot, Send, UserRound, Stethoscope, Loader2, Sparkles } from "lucide-react";

export function AIChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addConsultation } = useConsultations();
  const symptoms = (location.state as { symptoms?: string; premium?: boolean })?.symptoms || "";
  const isPremium = (location.state as { premium?: boolean })?.premium === true;
  const aiEndpoint = isPremium ? "/ai/chat-premium" : "/ai/chat";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  /** 调用后端 AI 接口并追加回复消息 */
  const fetchAiReply = async (currentMessages: ChatMessage[]) => {
    setIsTyping(true);
    try {
      const { content } = await api.post<{ content: string }>(aiEndpoint, {
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
    setTransferError("");
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
    if (isTransferring) return;

    const symptomSummary =
      symptoms.trim() ||
      messages.find((message) => message.sender === "patient")?.content.trim() ||
      "AI 问诊转人工咨询";

    setTransferError("");
    setIsTransferring(true);
    try {
      const id = await addConsultation(symptomSummary, messages);
      navigate(`/consultation/${id}`);
    } catch (error) {
      setTransferError(error instanceof Error ? error.message : "转人工失败，请稍后重试");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPremium ? "bg-violet-100" : "bg-primary/10"}`}>
            {isPremium ? <Sparkles className="w-5 h-5 text-violet-600" /> : <Bot className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <h3 className="leading-tight flex items-center gap-2">
              {isPremium ? "高级AI深度分析" : "AI智能问诊"}
              {isPremium && (
                <span className="text-[10px] font-medium bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">DeepSeek-Reasoner</span>
              )}
            </h3>
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
                  : isPremium
                    ? "bg-violet-100 text-violet-600"
                    : "bg-primary/10 text-primary"
              }`}
            >
              {msg.sender === "patient" ? (
                <UserRound className="w-5 h-5" />
              ) : isPremium ? (
                <Sparkles className="w-5 h-5" />
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
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isPremium ? "bg-violet-100" : "bg-primary/10"}`}>
              {isPremium ? <Sparkles className="w-5 h-5 text-violet-600" /> : <Bot className="w-5 h-5 text-primary" />}
            </div>
            <div className="bg-white border shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isPremium ? "DeepSeek 深度分析中..." : "AI正在分析..."}
              </div>
            </div>
          </div>
        )}

        {transferError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {transferError}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4 shrink-0">
        <div className="mx-auto mb-3 flex max-w-3xl items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleConsultDoctor}
            disabled={isTransferring}
            className="h-11 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
          >
            <Stethoscope className="mr-2 h-4 w-4" />
            {isTransferring ? "正在转接医生..." : "转人工医生"}
          </Button>
          <p className="text-xs text-muted-foreground">
            可随时转入真人医生会话，保留当前 AI 问诊记录。
          </p>
        </div>
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
