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

/** 阳干集合（用于建禄/月刃判别） */
const YANG_STEMS = new Set(['甲', '丙', '戊', '庚', '壬'])

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
    const isYangDay = YANG_STEMS.has(dayMaster)
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
// 工具：天干 vs 日主 → 十神（独立实现，避免循环依赖 core/bazi.ts）
// ---------------------------------------------------------------------------

/** 天干阴阳 */
function isYang(stem: string): boolean {
  return YANG_STEMS.has(stem)
}

/** 天干五行 */
const STEM_ELEMENT: Record<string, string> = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
}

/** 五行生克：源 → 目标 的关系 */
function relation(src: string, dst: string): 'same' | 'src_gen_dst' | 'dst_gen_src' | 'src_ke_dst' | 'dst_ke_src' {
  if (src === dst) return 'same'
  // 木→火→土→金→水→木
  const order = ['木', '火', '土', '金', '水']
  const i = order.indexOf(src)
  const j = order.indexOf(dst)
  const next = (i + 1) % 5
  const prev = (i + 4) % 5
  if (j === next) return 'src_gen_dst'
  if (j === prev) return 'dst_gen_src'
  // 木克土 (i+2)、土克水 (i+2)...
  const ke = (i + 2) % 5
  if (j === ke) return 'src_ke_dst'
  return 'dst_ke_src'
}

/** stem vs dayMaster → 十神 */
function stemTenGod(stem: string, dayMaster: string): TenGodType {
  if (stem === dayMaster) return '比肩'
  const sameYY = isYang(stem) === isYang(dayMaster)
  const sEle = STEM_ELEMENT[stem]
  const dEle = STEM_ELEMENT[dayMaster]
  const r = relation(dEle, sEle) // 站在日主立场看 stem
  switch (r) {
    case 'same':
      return sameYY ? '比肩' : '劫财'
    case 'src_gen_dst':
      // 日主生 stem → 食神 / 伤官
      return sameYY ? '食神' : '伤官'
    case 'src_ke_dst':
      // 日主克 stem → 正财 / 偏财
      return sameYY ? '偏财' : '正财'
    case 'dst_ke_src':
      // stem 克日主 → 七杀 / 正官
      return sameYY ? '七杀' : '正官'
    case 'dst_gen_src':
      // stem 生日主 → 偏印 / 正印
      return sameYY ? '偏印' : '正印'
  }
}
