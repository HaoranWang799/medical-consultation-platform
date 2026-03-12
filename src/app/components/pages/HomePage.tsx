import React from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Bot,
  Stethoscope,
  ClipboardList,
  Shield,
  ArrowRight,
  Activity,
  CheckCircle2,
} from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar Placeholder - assuming AppNav is used in layout, but here we just ensure spacing */}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
        
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Activity className="w-4 h-4" />
            <span className="tracking-wide">AI 驱动的智能医疗助手</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8 leading-[1.1]">
            您的健康 <span className="text-primary relative">
              全天候
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span> 守护
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            结合尖端 AI 技术与专业医生团队，为您提供快速、准确、私密的医疗咨询服务。随时随地，呵护身心。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              onClick={() => navigate("/symptoms")}
            >
              立即咨询 AI
              <Bot className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50"
              onClick={() => navigate("/consultations")}
            >
              查看历史记录
            </Button>
          </div>

          {/* Stats / Trust */}
          <div className="mt-20 flex justify-center gap-8 md:gap-16 text-muted-foreground opacity-80">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">24/7</span>
              <span className="text-sm">在线服务</span>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">98%</span>
              <span className="text-sm">好评率</span>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">1s</span>
              <span className="text-sm">极速响应</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">为什么选择我们</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              我们将传统医疗与人工智能完美结合，提供前所未有的就医体验
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={Bot} 
              title="AI 智能初诊" 
              desc="秒级分析症状，无论是感冒发烧还是复杂不适，AI 为您提供科学的初步建议。"
              delay={0}
            />
            <FeatureCard 
              icon={Stethoscope} 
              title="专业医生复核" 
              desc="三甲医院资深医生在线坐诊，为 AI 诊断结果提供专业把关和深度建议。"
              delay={100}
            />
            <FeatureCard 
              icon={ClipboardList} 
              title="健康档案管理" 
              desc="自动生成结构化病历，长期追踪您的健康状况，让每一次问诊都有据可循。"
              delay={200}
            />
            <FeatureCard 
              icon={Shield} 
              title="隐私三重加密" 
              desc="采用银行级数据加密技术，确保您的病情隐私绝不外泄，安全无忧。"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-2xl transform rotate-3" />
              <div className="relative bg-card border rounded-3xl shadow-xl p-8 space-y-6">
                <ProcessStep 
                  num="01" 
                  title="描述您的症状" 
                  desc="像聊天一样告诉我们哪里不舒服，支持语音和文字输入。" 
                />
                <ProcessStep 
                  num="02" 
                  title="获取 AI 分析" 
                  desc="系统根据千万级医疗数据，即时生成初步诊断报告。" 
                />
                <ProcessStep 
                  num="03" 
                  title="医生介入治疗" 
                  desc="必要时一键转接真人医生，获取处方和治疗方案。" 
                />
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="inline-block p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                <Activity className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold leading-tight">
                简单三步，<br/>开启智慧医疗新体验
              </h2>
              <p className="text-lg text-muted-foreground">
                告别繁琐的挂号排队，只需一部手机，专业医疗资源触手可及。我们要做的，是让看病变得像通过社交软件聊天一样简单。
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-foreground/80">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>无需下载 App，网页端直接使用</span>
                </li>
                <li className="flex items-center gap-3 text-foreground/80">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>支持多轮对话，深度理解病情</span>
                </li>
                <li className="flex items-center gap-3 text-foreground/80">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>24小时无休，随时待命</span>
                </li>
              </ul>
              <div className="pt-6">
                 <Button onClick={() => navigate("/symptoms")} size="lg" className="rounded-full px-8">立即体验</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
             <Activity className="w-6 h-6 text-primary" />
             医问诊
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Medical Consultation Platform. AI 建议仅供参考，急重症请及时就医。
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
      <CardContent className="pt-8 px-6 pb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 transition-colors group-hover:bg-primary group-hover:text-white">
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  )
}

function ProcessStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
        {num}
      </div>
      <div>
        <h4 className="text-lg font-bold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
