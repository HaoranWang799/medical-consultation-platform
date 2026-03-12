import { Router } from "express";
import type { Response } from "express";
import { authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// 支持 OpenAI / DeepSeek / 通义千问 等兼容接口
const AI_API_KEY    = process.env.AI_API_KEY    ?? "";
const AI_API_BASE   = process.env.AI_API_BASE   ?? "https://api.openai.com/v1";
const AI_MODEL      = process.env.AI_MODEL      ?? "gpt-4o-mini";

const SYSTEM_PROMPT = `你是一位专业、耐心的AI医疗助手。
职责：
1. 根据患者描述的症状提供初步分析和健康建议
2. 用简洁、易懂的中文回复，适当使用换行和列表提高可读性
3. 每次回复末尾提醒：AI建议仅供参考，不能替代专业医生诊断

注意事项：
- 不能确诊，只提供参考
- 遇到急症症状（胸痛、呼吸困难、意识障碍等）立即建议就医或拨打120
- 鼓励用户咨询真人医生做进一步诊断`;

/**
 * POST /api/ai/chat
 * Body: { messages: Array<{role: "patient"|"doctor"|"ai"; content: string}>, symptoms: string }
 * Returns: { content: string }
 */
router.post("/chat", async (req: AuthRequest, res: Response): Promise<void> => {
  const { messages = [], symptoms = "" } = req.body as {
    messages?: Array<{ role: string; content: string }>;
    symptoms?: string;
  };

  // 没有配置 API Key 时降级为本地回复
  if (!AI_API_KEY) {
    const userCount = messages.filter((m) => m.role === "patient").length;
    const fallbacks = [
      "根据您描述的症状，我需要了解更多信息。请问这些症状持续多长时间了？",
      "感谢您的补充。根据描述，初步分析可能与上呼吸道感染或疲劳综合征有关。建议多休息、多饮水，体温超过38.5°C可服用布洛芬。\n\n⚠️ AI建议仅供参考，不能替代专业医生诊断。",
      "还有其他不适症状吗？如症状持续加重，建议及时就医。您也可以点击下方按钮咨询真人医生。\n\n⚠️ AI建议仅供参考，不能替代专业医生诊断。",
      "建议咨询真人医生获取更准确的诊断和治疗方案。\n\n⚠️ AI建议仅供参考，不能替代专业医生诊断。",
    ];
    res.json({ content: fallbacks[Math.min(userCount, fallbacks.length - 1)] });
    return;
  }

  // 将前端消息历史转换为 OpenAI 格式
  const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  // 如果是首条消息，把症状作为 user 消息传入
  if (messages.length === 0 && symptoms) {
    chatMessages.push({ role: "user", content: `患者主诉：${symptoms}` });
  } else {
    for (const m of messages) {
      if (m.role === "patient") {
        chatMessages.push({ role: "user", content: m.content });
      } else if (m.role === "ai" || m.role === "doctor") {
        chatMessages.push({ role: "assistant", content: m.content });
      }
    }
  }

  try {
    const apiUrl = `${AI_API_BASE}/chat/completions`;
    console.log(`🤖 调用 AI API: ${apiUrl}，模型: ${AI_MODEL}`);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: chatMessages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`❌ AI API 错误 (${response.status}):`, err);
      res.status(502).json({ message: "AI 服务暂时不可用，请稍后重试" });
      return;
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "AI 暂时无法回复，请稍后重试。";
    res.json({ content });
  } catch (err) {
    console.error("AI 请求失败:", err);
    res.status(502).json({ message: "AI 服务连接失败，请稍后重试" });
  }
});

export default router;
