import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Bot, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

const quickSymptoms = [
  "头痛", "发热", "咳嗽", "胃痛", "腹泻", "皮疹",
  "关节疼痛", "失眠", "胸闷", "呼吸困难",
];

export function SymptomsPage() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");

  const handleStart = () => {
    if (!symptoms.trim()) return;
    navigate("/ai-chat", { state: { symptoms } });
  };

  const handlePremiumStart = () => {
    if (!symptoms.trim()) return;
    navigate("/ai-chat", { state: { symptoms, premium: true } });
  };

  const addSymptom = (s: string) => {
    setSymptoms((prev) => (prev ? `${prev}, ${s}` : s));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl mb-2">描述您的症状</h1>
          <p className="text-muted-foreground">
            请尽可能详细地描述您的症状,AI将为您提供初步分析
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>症状描述</CardTitle>
            <CardDescription>
              包括症状持续时间、严重程度、伴随症状等
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <textarea
              className="w-full h-48 p-4 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base"
              placeholder="例如:我最近三天持续头痛,主要在太阳穴两侧,伴有轻微发热(37.5度左右),感觉全身乏力..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />

            <div>
              <p className="text-sm text-muted-foreground mb-3">快速选择常见症状:</p>
              <div className="flex flex-wrap gap-2">
                {quickSymptoms.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-colors px-3 py-1.5"
                    onClick={() => addSymptom(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                AI问诊仅供参考,不能替代专业医生的诊断。如遇紧急情况,请立即就医或拨打120。
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={!symptoms.trim()}
              onClick={handleStart}
            >
              开始AI咨询
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 hover:from-violet-100 hover:to-purple-100 hover:text-violet-800 hover:border-violet-300"
              disabled={!symptoms.trim()}
              onClick={handlePremiumStart}
            >
              <Sparkles className="mr-2 w-5 h-5" />
              高级AI深度分析 (GPT-4o)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
