import { Router } from "express";
import type { Response } from "express";
import { authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

/**
 * 基于轮次索引的 AI 回复列表。
 * 在真实场景中可替换为 OpenAI / 其他 LLM 的 API 调用。
 */
const RESPONSES = [
  "根据您描述的症状，我需要了解更多信息。请问这些症状持续多长时间了？",

  "感谢您的补充信息。根据您的描述，初步分析可能与以下几个方面有关：\n\n"
    + "1. **上呼吸道感染**：头痛、发热和乏力是常见的感冒或流感症状\n"
    + "2. **疲劳综合征**：如果您近期工作压力大，也可能引起类似症状\n\n"
    + "**建议**：\n"
    + "- 多休息，保证充足睡眠\n"
    + "- 多饮温水\n"
    + "- 如体温超过 38.5°C，可服用布洛芬退热\n"
    + "- 注意监测体温变化",

  "还有其他不适症状吗？如果症状持续加重或出现新症状，建议您及时就医。\n\n"
    + "您也可以选择咨询真人医生获取更专业的诊断建议。",

  "如果您有更多问题，建议咨询真人医生获取更详细的诊断和治疗方案。点击下方按钮即可转接医生。",
];

/**
 * POST /api/ai/chat
 * Body: { messages: Array<{role: string; content: string}>, symptoms: string }
 * Returns: { content: string }
 */
router.post("/chat", (req: AuthRequest, res: Response): void => {
  const { messages = [] } = req.body as {
    messages?: Array<{ role: string; content: string }>;
    symptoms?: string;
  };

  // 根据对话轮次选择回复（每2条用户消息算一轮）
  const userMsgCount = messages.filter((m) => m.role === "patient").length;
  const index = Math.min(userMsgCount, RESPONSES.length - 1);

  res.json({ content: RESPONSES[index] });
});

export default router;
