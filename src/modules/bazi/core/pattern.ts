/**
 * 命局格局识别（八字 8 大正格 + 建禄/月刃 + 杂气）
 *
 * 判别规则（公认版，MVP 简化）：
 * 1. 取月支本气十神
 *    - 若本气十神为日主同类（比肩/劫财），归入"建禄/月刃"
 *      · 阳干同性 → 建禄；阳干异性（月支为劫）→ 月刃
 *    - 否则取本气十神作为候选格局
 * 2. 看候选十神是否在年/月/时柱"透干"
 *    - 透 → 立此格（透出位置作为 through 字段）
 *    - 不透但月令本气得用 → 仍可立此格（设为 through=null，强度稍弱）
 * 3. 月支为辰戌丑未（杂气库）且本气未透 → 标为"杂气格"，
 *    简化处理：仍以本气十神命名（如"杂气正财格"），name 落到既有格局名之一即可
 */

import type { PillarInfo, PatternInfo, PatternName, TenGodType } from '../types'
import { isYangStem } from '@/lib/element'
import { calcTenGod } from '@/lib/tenGod'

/** 月支本气十神 → 候选格局名映射 */
const TENGOD_TO_PATTERN: Record<TenGodType, PatternName | null> = {
  正官: '正官格',
  七杀: '七杀格',
  正财: '正财格',
  偏财: '偏财格',
  正印: '正印格',
  偏印: '偏印格',
  食神: '食神格',
  伤官: '伤官格',
  比肩: null, // 走 建禄/月刃 分支
  劫财: null,
  日主: null,
}

/** 杂气库：辰戌丑未 */
const ZAQI_BRANCHES = new Set(['辰', '戌', '丑', '未'])

/** 格局点评（一句话简评模板） */
const PATTERN_COMMENT: Record<PatternName, string> = {
  正官格: '正气端方，宜守正道而成名',
  七杀格: '锋芒外显，制化得宜可立威权',
  正财格: '勤俭务实，按部就班可成富局',
  偏财格: '机变灵活，长袖善舞而聚财',
  正印格: '学识深厚，得长辈与文凭之助',
  偏印格: '心思缜密，宜技术 / 玄学 / 宗教',
  食神格: '温润和顺，重生活与艺术',
  伤官格: '才华横溢，需配印或财方为大用',
  建禄格: '自坐根气，独立自强可成大事',
  月刃格: '刚强果断，宜动不宜静，得制可贵',
  杂气格: '财官印俱在墓库，需冲开方显',
}

/**
 * 主入口：识别命局格局
 *
 * @param month   月柱
 * @param year    年柱
 * @param hour    时柱
 * @param dayMaster 日主天干名（"甲"/"乙"/...）
 */
export function detectPattern(
  month: PillarInfo,
  year: PillarInfo,
  hour: PillarInfo,
  dayMaster: string,
): PatternInfo {
  // 1. 月支本气十神（藏干第一项一定是 main，此前已建模）
  const monthMain = month.hideStems.find(h => h.type === 'main')
  if (!monthMain) {
    // 理论不会发生，兜底
    return {
      name: '杂气格',
      monthMainTenGod: '日主',
      through: null,
      comment: PATTERN_COMMENT['杂气格'],
    }
  }

  const monthMainTenGod = stemTenGod(monthMain.gan, dayMaster)

  // 2. 比肩 / 劫财 → 建禄 / 月刃
  if (monthMainTenGod === '比肩' || monthMainTenGod === '劫财') {
    const isYangDay = isYangStem(dayMaster)
    // 阳日干 + 月支同性（如 甲日见寅）→ 建禄；
    // 阳日干 + 月支异性（如 甲日见卯）→ 月刃；
    // 阴日干同样规则（仅极少数命局会出现"阴干月刃"，简化按阴阳判断）
    let name: PatternName
    if (monthMainTenGod === '比肩') {
      name = '建禄格'
    } else {
      // 劫财
      name = isYangDay ? '月刃格' : '建禄格'
    }
    return {
      name,
      monthMainTenGod,
      through: null,
      comment: PATTERN_COMMENT[name],
    }
  }

  // 3. 其他十神 → 候选格局
  const candidate = TENGOD_TO_PATTERN[monthMainTenGod]
  if (!candidate) {
    return {
      name: '杂气格',
      monthMainTenGod,
      through: null,
      comment: PATTERN_COMMENT['杂气格'],
    }
  }

  // 4. 透干判断：看 year/month/hour 哪一柱天干十神 == 候选十神
  let through: PatternInfo['through'] = null
  if (year.tenGod === monthMainTenGod) through = 'year'
  else if (month.tenGod === monthMainTenGod) through = 'month'
  else if (hour.tenGod === monthMainTenGod) through = 'hour'

  // 5. 月支为杂气库 + 本气未透 → 退化为杂气格（保留候选名作为参考标签也可，这里直接命名"杂气格"）
  if (!through && ZAQI_BRANCHES.has(month.zhi)) {
    return {
      name: '杂气格',
      monthMainTenGod,
      through: null,
      comment: PATTERN_COMMENT['杂气格'],
    }
  }

  return {
    name: candidate,
    monthMainTenGod,
    through,
    comment: PATTERN_COMMENT[candidate],
  }
}

// ---------------------------------------------------------------------------
// 工具：天干 vs 日主 → 十神
//
// G-5（2026-04-28）收敛：原本的 `isYang / STEM_ELEMENT / relation / stemTenGod`
// 私有副本已下线，改为消费 `lib/tenGod.ts` 中的 `calcTenGod()`。
// 保留同名 `stemTenGod()` 仅作 module-local 适配层（含 `null` 兜底降级），
// 上游的 detectPattern 调用语义保持不变。
// ---------------------------------------------------------------------------

/** stem vs dayMaster → 十神（lib/tenGod.calcTenGod 的 module-local 适配层） */
function stemTenGod(stem: string, dayMaster: string): TenGodType {
  // 上游（detectPattern）始终用 EightChar 解析的合法天干，不会触发 null 分支；
  // 但保留兜底以满足类型契约 —— 命理语境下 fallback 「比肩」是最不破坏后续判断的中立值。
  return calcTenGod(stem, dayMaster) ?? '比肩'
}
