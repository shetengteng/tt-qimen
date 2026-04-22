/**
 * 9 类事由关键词映射
 *
 * 用于把 tyme4ts.getRecommends() / getAvoids() 返回的"宜/忌"词汇
 * 反向映射到 9 类事由的评判结果。
 *
 * 关键词来源：通行黄历与《协纪辨方书》术语（公版）。
 * 规则：
 *   - 若某事由的关键词在"宜"列表命中 → verdict: 'yi'
 *   - 若在"忌"列表命中         → verdict: 'ji'
 *   - 两侧都不命中              → verdict: 'ping'
 *   - 宜/忌同词冲突时取"忌"（防误导：保守处理）
 */

import type { HuangliMatterKey, MatterVerdict } from '../types'

/**
 * 每个事由对应一组关键词。
 * 关键词使用 tyme4ts 原始文案的短句字形，子串命中即算命中。
 * 一个事由的多个关键词命中任一即算命中该事由。
 */
export const MATTER_KEYWORDS: Readonly<Record<HuangliMatterKey, readonly string[]>> = {
  // 祭祀：祭祀、祭祖、祈福、设醮、祭海
  jisi:     ['祭祀', '祭祖', '设醮', '祭海'],
  // 祈福：祈福、还愿、酬神、谢土、上香、开光
  qifu:     ['祈福', '还愿', '酬神', '谢土', '开光'],
  // 嫁娶：嫁娶、纳采、订盟、纳婿、合帐、安床（择日中常绑婚事）
  jiaqu:    ['嫁娶', '纳采', '订盟', '纳婿', '合帐', '结婚'],
  // 出行：出行、远行、上官赴任、启程、移徙（远）
  chuxing:  ['出行', '远行', '上官赴任', '启程'],
  // 签约：立券、交易、签约、纳财
  qianyue:  ['立券', '交易', '签约', '纳财'],
  // 开市：开市、开业、开张、挂匾、开仓库
  kaishi:   ['开市', '开业', '开张', '挂匾', '开仓'],
  // 动土：动土、修造、起基、兴造、筑堤、修墙
  dongtu:   ['动土', '修造', '起基', '兴造', '筑堤', '修墙'],
  // 入宅：入宅、移徙、安床、安香、归宁、搬家
  ruzhai:   ['入宅', '移徙', '安床', '安香', '归宁', '搬家'],
  // 破土：破土、启攒、修坟、安葬（与"动土"语义不同：破土专指墓地）
  potu:     ['破土', '启攒', '修坟', '安葬'],
}

/**
 * 判断某事由在"宜/忌"文案下的评判。
 * 命中忌关键词时直接返回 'ji'（保守策略：忌>宜）。
 *
 * @param matter    事由 key
 * @param recommends tyme4ts.getRecommends() 返回的词数组
 * @param avoids     tyme4ts.getAvoids() 返回的词数组
 */
export function judgeMatter(
  matter: HuangliMatterKey,
  recommends: readonly string[],
  avoids: readonly string[],
): MatterVerdict {
  const keywords = MATTER_KEYWORDS[matter]
  const hitIn = (list: readonly string[]) =>
    list.some((w) => keywords.some((k) => w.includes(k)))

  if (hitIn(avoids)) return 'ji'
  if (hitIn(recommends)) return 'yi'
  return 'ping'
}

/**
 * 同时判断 9 个事由。保持定义中的顺序。
 */
export function judgeAllMatters(
  recommends: readonly string[],
  avoids: readonly string[],
): Array<{ key: HuangliMatterKey; verdict: MatterVerdict }> {
  return (Object.keys(MATTER_KEYWORDS) as HuangliMatterKey[]).map((key) => ({
    key,
    verdict: judgeMatter(key, recommends, avoids),
  }))
}
