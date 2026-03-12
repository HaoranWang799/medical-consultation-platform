import React from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Bot,
  Stethoscope,
  ClipboardList,
  Shield,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI智能问诊",
    description: "基于AI技术,快速分析您的症状,提供初步诊断建议",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Stethoscope,
    title: "真人医生咨询",
    description: "专业医生在线解答,为您提供个性化的医疗建议",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: ClipboardList,
    title: "咨询记录管理",
    description: "完整的咨询历史记录,随时查看和跟进",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Shield,
    title: "隐私安全保障",
    description: "严格保护您的个人信息和医疗数据安全",
    color: "bg-amber-50 text-amber-600",
  },
];

const steps = [
  { step: "01", title: "描述症状", desc: "详细描述您的身体症状和不适感受" },
  { step: "02", title: "AI初诊", desc: "AI智能分析,给出初步诊断和建议" },
  { step: "03", title: "医生咨询", desc: "如需进一步诊断,可转接真人医生" },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-6 text-sm backdrop-blur-sm">
                <MessageCircle className="w-4 h-4" />
                <span>24小时在线问诊服务</span>
              </div>
              <h1 className="text-4xl md:text-5xl mb-6 leading-tight text-white">
                您的健康,<br />我们用心守护
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-lg">
                通过AI智能问诊和专业医生在线咨询,随时随地获取医疗建议,让看病不再困难。
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-white/90 px-8"
                  onClick={() => navigate("/symptoms")}
                >
                  开始咨询
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 px-8"
                  onClick={() => navigate("/consultations")}
                >
                  查看咨询记录
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758691461916-dc7894eb8f94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZG9jdG9yJTIwY29uc3VsdGF0aW9uJTIwaGVhbHRoY2FyZXxlbnwxfHx8fDE3NzMzMDIzMzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="医疗问诊"
                className="rounded-2xl shadow-2xl w-full object-cover max-h-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl mb-3">我们的服务</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            为您提供全方位的在线医疗咨询服务
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Card
              key={f.title}
              className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <CardContent className="pt-6">
                <div
                  className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl mb-3">如何使用</h2>
            <p className="text-muted-foreground">简单三步,获取专业医疗建议</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                <div className="text-5xl text-primary/10 mb-4">{s.step}</div>
                <h3 className="mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-6 h-6 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <CardContent className="py-12 px-8 md:px-16 text-center relative z-10">
            <h2 className="text-3xl mb-4 text-white">立即开始您的健康咨询</h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto">
              无需预约,随时在线咨询,专业医生为您解答
            </p>
            <Button
              size="lg"
              className="bg-white text-teal-700 hover:bg-white/90 px-10"
              onClick={() => navigate("/symptoms")}
            >
              开始咨询
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>医问诊 - 智能医疗问诊平台 &copy; 2026</p>
          <p className="mt-1">本平台仅供参考,不替代线下医疗诊断</p>
        </div>
      </footer>
    </div>
  );
}
