/**
 * 流年一句话模板（C 类规则化产品模板）
 *
 * ⚠ 溯源状态：**非古籍逐条可溯源**（class-level isClassical = false）
 *
 * 定位说明：
 *   - 见 `design/bazi/2026-04-21-03-八字文案校验报告.md` § 6
 *   - `design/bazi/extracted/04-flowyear.md` 已明确：古籍里没有"60 甲子流年模板库"
 *   - 商业 App 的同类模板多为团队内部写作
 *   - 改造计划：`design/bazi/2026-04-22-03-八字文案溯源改造方案TODO.md` § 2.7
 *
 * 当前定位：产品层规则化提示语，可继续使用，但不计入 raw 校验完成成果。
 *
 * 用于：FlowYears.vue 在每年下面显示一句话提示 + 标签 chip。
 *
 * 设计：以 "天干十神 × 与喜用神关系（吉/中/凶）" 为 Key
 *      共 10 (十神) × 3 (吉/中/凶) = 30 段
 *
 * 与大运模板的区别：流年口径更短、更具体到"年内"。
 *
 * 2026-04-22 T-2.7-B 审查（按 TODO P-6 原则）：
 *   - 过窄现代词改为更通用现代词（禁止改为古代词，保持现代化可读性）：
 *     · hint 内「合伙纠纷」→「合作分歧」、「文创」→「文化艺术」
 *     · hint 内「自媒体」→「内容创作」、「立人设」→「树立形象」、「体制内」→「机关单位」
 *     · tags 同步：「防合伙纠纷」→「防合作分歧」、「文创」→「文化艺术」、「自媒体」→「内容创作」
 *   - 通用词保留：理财 / 升迁 / 婚配 / 创业 / 贸易 / 担保 / 副业 / 投资 / 餐饮 / 教育 / 设计 等
 *   - 古法术语底层保留：流年 / 十神 / 比肩 / 伤官 …（产品外壳现代语，底层规则古法）
 */

import type { TenGodType, Tendency } from '../types'

/**
 * 文件级溯源状态标记。
 * false 表示本文件为产品模板，UI 层可相应标注"产品模板 · 非古籍"。
 */
export const FLOW_YEAR_HINTS_IS_CLASSICAL = false

export type FlowYearHintKey = `${TenGodType}_${Tendency}`

export interface FlowYearHint {
  /** 一句话 */
  hint: string
  /** UI 上的标签 chip */
  tags: string[]
}

export const FLOW_YEAR_HINTS: Record<FlowYearHintKey, FlowYearHint> = {
  // 比肩
  比肩_favorable: { hint: '本年得同辈相助，利于团队合作与拓展人脉。', tags: ['合作', '人脉'] },
  比肩_neutral: { hint: '本年与友相伴起伏，宜稳步推进既定计划。', tags: ['平稳', '协作'] },
  比肩_unfavorable: { hint: '本年防合作分歧与口舌，宜独立决断、留足现金流。', tags: ['防合作分歧', '现金流'] },

  // 劫财
  劫财_favorable: { hint: '本年行动力强、利借势突破，宜结交可信之人。', tags: ['行动力', '突破'] },
  劫财_neutral: { hint: '本年朋友相助亦防财耗，宜慎处感情与金钱。', tags: ['谨慎理财'] },
  劫财_unfavorable: { hint: '本年防破财、口舌与感情波动，宜守不宜攻。', tags: ['防破财', '保守'] },

  // 食神
  食神_favorable: { hint: '本年才艺显发、口福绵长，利文化艺术、教育、餐饮。', tags: ['才艺', '文化艺术'] },
  食神_neutral: { hint: '本年生活平稳，宜在享受过程中持续输出作品。', tags: ['平稳', '输出'] },
  食神_unfavorable: { hint: '本年防过于松弛，宜借兴趣立身，避免懒散。', tags: ['防懒散'] },

  // 伤官
  伤官_favorable: { hint: '本年才华爆发、表达突出，利于艺术、技术、内容创作。', tags: ['创意', '内容创作'] },
  伤官_neutral: { hint: '本年灵感涌现亦需谨言，宜借作品树立形象。', tags: ['作品', '谨言'] },
  伤官_unfavorable: { hint: '本年防言多招怨、与上司冲突，宜以柔克刚。', tags: ['防口舌', '柔克刚'] },

  // 正财
  正财_favorable: { hint: '本年收入稳健、家庭和睦，利于置产理财与婚配。', tags: ['理财', '婚配'] },
  正财_neutral: { hint: '本年财务平稳，宜量入为出、长线规划。', tags: ['长线', '量入为出'] },
  正财_unfavorable: { hint: '本年为财劳累，需防固守而失机，宜节制。', tags: ['防劳累', '节制'] },

  // 偏财
  偏财_favorable: { hint: '本年外财机遇多、人缘广，利副业与短线投资。', tags: ['外财', '副业'] },
  偏财_neutral: { hint: '本年机遇与风险并存，宜多元布局、勿孤注。', tags: ['多元布局'] },
  偏财_unfavorable: { hint: '本年防被人牵累，慎做担保与保证人。', tags: ['防担保'] },

  // 正官
  正官_favorable: { hint: '本年名分提升、贵人扶持，利机关单位升迁与婚配。', tags: ['升迁', '婚配'] },
  正官_neutral: { hint: '本年规矩多、机会稳，宜按部就班、积累资历。', tags: ['按部就班'] },
  正官_unfavorable: { hint: '本年压力与拘束并行，需防是非官非，宜守规矩。', tags: ['防官非', '守规矩'] },

  // 七杀
  七杀_favorable: { hint: '本年权威与决断力强，利竞争、开拓与创业。', tags: ['竞争', '开拓'] },
  七杀_neutral: { hint: '本年挑战与机遇并行，宜借力化压为势。', tags: ['化压为势'] },
  七杀_unfavorable: { hint: '本年压力大、易冲突，需防伤灾与官非，宜低调蓄势。', tags: ['防伤灾', '低调'] },

  // 正印
  正印_favorable: { hint: '本年学业、文书、贵人提携俱佳，利进修与名声。', tags: ['学业', '贵人'] },
  正印_neutral: { hint: '本年宜静修内炼、积累根基。', tags: ['静修'] },
  正印_unfavorable: { hint: '本年防过于依赖、行动力下降，宜主动出击。', tags: ['防依赖'] },

  // 偏印
  偏印_favorable: { hint: '本年灵感与偏门技艺显发，利设计、研究与玄学命理。', tags: ['灵感', '研究'] },
  偏印_neutral: { hint: '本年思路活跃，宜专注一项深耕。', tags: ['专注'] },
  偏印_unfavorable: { hint: '本年需防多疑、犹豫与饮食起居失调，宜规律生活。', tags: ['规律生活'] },

  // 日主（保留兜底）
  日主_favorable: { hint: '本年本命气场聚集，宜主动谋事。', tags: ['主动'] },
  日主_neutral: { hint: '本年平稳过渡，宜守住本心。', tags: ['平稳'] },
  日主_unfavorable: { hint: '本年自我消耗较大，宜量力而行。', tags: ['量力'] },
}

export function getFlowYearHint(tenGod: TenGodType, tendency: Tendency): FlowYearHint {
  return FLOW_YEAR_HINTS[`${tenGod}_${tendency}` as FlowYearHintKey]
    || { hint: `本年 ${tenGod}，宜结合用神综合判断。`, tags: ['综合判断'] }
}
