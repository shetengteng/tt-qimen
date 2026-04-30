/**
 * DeepSeek Provider 实现
 *
 * 历史背景（2026-04-30 多 Provider 重构前）：
 *   该文件曾经手写完整的 OpenAI SDK 调用 + thinking / reasoning_content 处理逻辑。
 *   Phase 2 把 6 家 OpenAI 兼容 Provider 共用的代码抽到 `openaiCompatible.ts` 工厂，
 *   DeepSeek 现在只是该工厂的实例化，**行为零变化**。
 *
 * DeepSeek 特殊处理（与其他 OpenAI 兼容 Provider 不同的两点）：
 *   1. V4 模型默认开启 thinking，输出分 `reasoning_content` + `content` 两段。
 *      仅消费 `delta.content` 会在思考阶段一直收到空字符串，用户体验是"长时间无输出"。
 *      策略：
 *        - V4-Flash（model 名含 "flash"）默认关 thinking（速度优先），仅取 `content` 直出
 *        - V4-Pro / 其他 reasoner 模型保留 thinking，把 reasoning_content 也并入流
 *          （让用户感知"AI 在推理"）
 *        - 通过 `extra_body.thinking.type` 控制（OpenAI SDK 不识别 `thinking` 顶级字段，
 *          需走 extra body 透传）
 *   2. `delta.reasoning_content` 字段是 DeepSeek 私有扩展，其它家流式 chunk 没有这个字段，
 *      所以 `consumeReasoningContent: true` 仅对 DeepSeek 启用
 */

import { createOpenAiCompatibleProvider } from './openaiCompatible'

/**
 * 是否对该 model 关闭 thinking。Flash = 速度优先 → 关；Pro = 推理优先 → 开。
 * 旧版 reasoner / chat 已 sanitize 到 v4-flash，不会再出现。
 */
function shouldDisableThinking(model: string): boolean {
  return /flash/i.test(model)
}

export const deepseekProvider = createOpenAiCompatibleProvider({
  id: 'deepseek',
  shouldDisableThinking,
  consumeReasoningContent: true,
})
