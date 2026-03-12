import { Router } from "express";
import type { Response } from "express";
import { authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// ── AI 提供商配置 ──────────────────────────────────────────────────────────
// 主提供商（AI_API_KEY / AI_API_BASE / AI_MODEL）
// 高级分析提供商（AI_PREMIUM_KEY / AI_PREMIUM_BASE / AI_PREMIUM_MODEL）
// 若主提供商失败，自动尝试备用
const AI_API_KEY    = process.env.AI_API_KEY    ?? "";
const AI_API_BASE   = process.env.AI_API_BASE   ?? "https://api.deepseek.com/v1";
const AI_MODEL      = process.env.AI_MODEL      ?? "deepseek-chat";

const AI_PREMIUM_KEY   = process.env.AI_PREMIUM_KEY   ?? "";
const AI_PREMIUM_BASE  = process.env.AI_PREMIUM_BASE  ?? "";
const AI_PREMIUM_MODEL = process.env.AI_PREMIUM_MODEL ?? "";

const SYSTEM_PROMPT = `你是一位专业、耐心的AI医疗助手。
职责：
1. 根据患者描述的症状提供初步分析和健康建议
2. 用简洁、易懂的中文回复，适当使用换行和列表提高可读性
3. 每次回复末尾提醒：AI建议仅供参考，不能替代专业医生诊断

注意事项：
- 不能确诊，只提供参考
- 遇到急症症状（胸痛、呼吸困难、意识障碍等）立即建议就医或拨打120
- 鼓励用户咨询真人医生做进一步诊断`;

const PREMIUM_SYSTEM_PROMPT = `你是一位资深的AI医学分析专家，使用先进的GPT模型提供深度医疗分析。
职责：
1. 对患者症状进行系统性、全面的医学分析
2. 列出可能的鉴别诊断（按可能性从高到低排列）
3. 针对每种可能的诊断说明依据和需要排除的条件
4. 建议相关的检查项目
5. 给出详细的生活方式和治疗建议
6. 用清晰的分段和列表组织回复

注意事项：
- 这是高级分析模式，回复应更加详尽和专业
- 仍需提醒：AI分析仅供参考，最终诊断需由专业医生做出
- 遇到急症症状立即建议就医或拨打120
- 每次回复末尾标注：⚡ 高级AI分析（DeepSeek-Reasoner）· 仅供参考`;

type ProviderApiError = Error & {
  status?: number;
  code?: string;
};

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
    const content = await callAI(chatMessages);
    res.json({ content });
  } catch (err) {
    console.error("AI 请求失败:", err);
    res.status(502).json({ message: "AI 服务连接失败，请稍后重试" });
  }
});

/**
 * POST /api/ai/chat-premium
 * 高级分析：强制使用深度分析模型（建议 deepseek-reasoner）
 */
router.post("/chat-premium", async (req: AuthRequest, res: Response): Promise<void> => {
  const { messages = [], symptoms = "" } = req.body as {
    messages?: Array<{ role: string; content: string }>;
    symptoms?: string;
  };

  if (!AI_PREMIUM_KEY || !AI_PREMIUM_BASE || !AI_PREMIUM_MODEL) {
    res.status(503).json({ message: "高级 AI 分析服务未配置" });
    return;
  }

  const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: PREMIUM_SYSTEM_PROMPT },
  ];

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
    const content = await callProvider(AI_PREMIUM_BASE, AI_PREMIUM_KEY, AI_PREMIUM_MODEL, chatMessages);
    res.json({ content });
  } catch (err) {
    const error = err as ProviderApiError;
    console.error("Premium AI 请求失败:", err);

    if (isQuotaError(error) && AI_API_KEY) {
      try {
        console.log(`🔄 高级分析额度不足，降级到主 AI: ${AI_MODEL}`);
        const fallbackContent = await callProvider(AI_API_BASE, AI_API_KEY, AI_MODEL, chatMessages);
        res.json({
          content:
            `当前高级 AI 服务额度已用尽，已自动切换为标准 AI 分析。\n\n${fallbackContent}`,
        });
        return;
      } catch (fallbackErr) {
        console.error("Premium AI 降级失败:", fallbackErr);
      }
    }

    if (isQuotaError(error)) {
      res.status(503).json({ message: "高级 AI 服务额度不足，请稍后再试或检查 DeepSeek 账单配置" });
      return;
    }

    res.status(502).json({ message: "高级 AI 服务连接失败，请稍后重试" });
  }
});

/** 调用单个 AI 提供商 */
async function callProvider(apiBase: string, apiKey: string, model: string, messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiUrl = `${apiBase}/chat/completions`;
  console.log(`🤖 调用 AI API: ${apiUrl}，模型: ${model}`);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const rawError = await response.text();
    let parsedMessage = rawError;
    let parsedCode: string | undefined;

    try {
      const parsed = JSON.parse(rawError) as {
        error?: { message?: string; code?: string };
      };
      parsedMessage = parsed.error?.message ?? rawError;
      parsedCode = parsed.error?.code;
    } catch {
      // Keep raw provider response when JSON parsing fails.
    }

    const error = new Error(
      `API error (${response.status})${parsedCode ? ` [${parsedCode}]` : ""}: ${parsedMessage}`
    ) as ProviderApiError;
    error.status = response.status;
    error.code = parsedCode;
    throw error;
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "AI 暂时无法回复，请稍后重试。";
}

/** 主提供商优先，失败时自动切换备用 */
async function callAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  try {
    return await callProvider(AI_API_BASE, AI_API_KEY, AI_MODEL, messages);
  } catch (primaryErr) {
    console.error(`❌ 主 AI (${AI_MODEL}) 失败:`, primaryErr instanceof Error ? primaryErr.message : primaryErr);

    if (AI_PREMIUM_KEY && AI_PREMIUM_BASE && AI_PREMIUM_MODEL) {
      console.log(`🔄 切换高级 AI: ${AI_PREMIUM_MODEL}`);
      return await callProvider(AI_PREMIUM_BASE, AI_PREMIUM_KEY, AI_PREMIUM_MODEL, messages);
    }
    throw primaryErr;
  }
}

function isQuotaError(error: ProviderApiError): boolean {
  return error.status === 429 || error.code === "insufficient_quota";
}

export default router;
