/**
 * 八字主算法
 *
 * 输入：BirthInput（公历或农历的年/月/日/时分 + 性别）
 * 输出：BaziChart（完整命盘 + 大运 / 流年 + 简析）
 *
 * 依赖：tyme4ts
 *
 * 实现要点：
 *  1. 公历直接走 SolarTime，农历走 LunarHour 转 SolarTime（保证起运、节气计算一致）
 *  2. 四柱：EightChar（年/月/日/时）→ SixtyCycle.{HeavenStem, EarthBranch}
 *  3. 十神：HeavenStem.getTenStar(dayMaster) → tyme4ts 已实现 10 神
 *  4. 五行权重：天干 1.0 + 地支藏干（本气 0.7 / 中气 0.2 / 余气 0.1），按月令 ×1.5 加成
 *  5. 旺衰：日主五行得分 vs 平均分（5 档）
 *  6. 喜用神：弱→生我/同我；旺→克我/我克/我泄（取调候后 1-2 个）
 *  7. 起运：ChildLimit.fromSolarTime(birth, gender)
 *  8. 大运：ChildLimit.getStartDecadeFortune() + .next(i) 取 8 段
 *  9. 流年：从当年开始向后 10 年，逐年 SixtyCycleYear
 *
 * 注意：tyme4ts 内置了节气交接判断，无需手动处理换月。
 */

import {
  SolarTime,
  SolarDay,
  LunarHour,
  ChildLimit,
  Gender,
  HeavenStem,
  EarthBranch,
  SixtyCycle,
  SixtyCycleYear,
  HideHeavenStemType,
} from 'tyme4ts'

import type {
  BaziChart,
  ChartMeta,
  PillarInfo,
  HideStem,
  ElementsScore,
  ElementCell,
  ElementName,
  StrengthLevel,
  TenGodType,
  Tendency,
  DecadeFortune as DecadeFortuneItem,
  FlowYear,
  InterpretSummary,
  PatternInfo,
} from '../types'
import type { BirthInput } from '@/stores/user'

import { detectPattern } from './pattern'
import { getDecadeHint } from '../data/fortuneHints'
import { getFlowYearHint } from '../data/flowYearHints'
import {
  PARAGRAPH_1_TEMPLATE,
  PARAGRAPH_2_TEMPLATE,
  STRENGTH_DESC,
  PATTERN_DEFAULT,
  ELEMENT_TIPS,
  getParagraph1ByDayMaster,
  getPatternHint,
} from '../data/interpretTemplate'

// ---------------------------------------------------------------------------
// 常量与映射
// ---------------------------------------------------------------------------

/** tyme4ts TenStar.NAMES 顺序：比肩 劫财 食神 伤官 偏财 正财 七杀 正官 偏印 正印 */
const TEN_STAR_INDEX_TO_TYPE: TenGodType[] = [
  '比肩', '劫财',
  '食神', '伤官',
  '偏财', '正财',
  '七杀', '正官',
  '偏印', '正印',
]

const ELEMENT_NAMES: ElementName[] = ['木', '火', '土', '金', '水']

/** 五行 ElementName -> ElementsScore 的 key */
const ELEMENT_SCORE_KEY: Record<ElementName, keyof ElementsScore> = {
  木: 'wood',
  火: 'fire',
  土: 'earth',
  金: 'metal',
  水: 'water',
}

/** 月令权重（节气定的本气月） */
const SEASON_WEIGHT = 1.5

// ---------------------------------------------------------------------------
// 入口
// ---------------------------------------------------------------------------

/**
 * 八字主入口。
 * 任何输入异常都抛出，调用方需在 try/catch 里处理。
 */
export function calculateBazi(birth: BirthInput): BaziChart {
  const solar = toSolarTime(birth)
  const eightChar = toEightChar(solar, birth)

  const dayMasterStem = eightChar.getDay().getHeavenStem()
  const dayMaster = dayMasterStem.getName()
  const dayMasterElement = dayMasterStem.getElement().getName() as ElementName
  const dayMasterYinYang: '阴' | '阳'
    = dayMasterStem.getYinYang() === 1 ? '阳' : '阴'

  const monthZhi = eightChar.getMonth().getEarthBranch()

  const yearPillar = buildPillar(eightChar.getYear(), dayMasterStem, false)
  const monthPillar = buildPillar(eightChar.getMonth(), dayMasterStem, false)
  const dayPillar = buildPillar(eightChar.getDay(), dayMasterStem, true)
  const hourPillar = buildPillar(eightChar.getHour(), dayMasterStem, false)

  const elements = sumElements([yearPillar, monthPillar, dayPillar, hourPillar], monthZhi)
  const elementCells = buildElementCells(elements)
  const strength = judgeStrength(elements, dayMasterElement)
  const { favorable, unfavorable } = pickFavorable(strength, dayMasterElement)

  const meta = buildMeta(solar, birth)
  const pattern = detectPattern(monthPillar, yearPillar, hourPillar, dayMaster)
  const interpret = buildInterpret({
    dayMaster,
    dayMasterYinYang,
    dayMasterElement,
    monthZhiName: monthZhi.getName(),
    strength,
    favorable,
    unfavorable,
    pattern,
  })

  // 起运 + 大运
  const childLimit = ChildLimit.fromSolarTime(
    solar,
    birth.gender === 'male' ? Gender.MAN : Gender.WOMAN,
  )
  const startAge = {
    year: childLimit.getYearCount(),
    months: childLimit.getMonthCount(),
  }

  const decades = buildDecades(childLimit, dayMasterStem, favorable, unfavorable)
  const currentSolarYear = new Date().getFullYear()
  const currentDecadeIdx = decades.findIndex(d => currentSolarYear >= d.startYear && currentSolarYear <= d.endYear)
  if (currentDecadeIdx >= 0) decades[currentDecadeIdx].current = true

  // 流年：当年 + 后 9 年
  const flowYears = buildFlowYears(currentSolarYear, dayMasterStem, favorable, unfavorable)
  const currentFlowYearIdx = 0

  return {
    meta,
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    },
    dayMaster,
    dayMasterElement,
    dayMasterYinYang,
    elements,
    elementCells,
    strength,
    favorableElements: favorable,
    unfavorableElements: unfavorable,
    interpret,
    pattern,
    startAge,
    decades,
    flowYears,
    currentDecadeIdx,
    currentFlowYearIdx,
  }
}

// ---------------------------------------------------------------------------
// 输入归一化
// ---------------------------------------------------------------------------

function toSolarTime(birth: BirthInput): SolarTime {
  if (birth.calendar === 'solar') {
    return SolarTime.fromYmdHms(
      birth.year,
      birth.month,
      birth.day,
      birth.hour,
      birth.minute,
      0,
    )
  }
  // lunar: 用 LunarHour 拿到对应的公历时间
  const lunarHour = LunarHour.fromYmdHms(
    birth.year,
    birth.month,
    birth.day,
    birth.hour,
    birth.minute,
    0,
  )
  return lunarHour.getSolarTime()
}

function toEightChar(solar: SolarTime, _birth: BirthInput) {
  return solar.getLunarHour().getEightChar()
}

// ---------------------------------------------------------------------------
// 单柱
// ---------------------------------------------------------------------------

function buildPillar(
  cycle: SixtyCycle,
  dayMaster: HeavenStem,
  isDayPillar: boolean,
): PillarInfo {
  const stem = cycle.getHeavenStem()
  const branch = cycle.getEarthBranch()

  const ganElement = stem.getElement().getName() as ElementName
  const zhiElement = branch.getElement().getName() as ElementName

  const ganYinYang: '阴' | '阳' = stem.getYinYang() === 1 ? '阳' : '阴'
  const zhiYinYang: '阴' | '阳' = branch.getYinYang() === 1 ? '阳' : '阴'

  const tenGod: TenGodType = isDayPillar
    ? '日主'
    : tenStarFromStem(stem, dayMaster)

  const hideStems = collectHideStems(branch)

  return {
    gan: stem.getName(),
    zhi: branch.getName(),
    ganzhi: cycle.getName(),
    ganElement,
    zhiElement,
    ganYinYang,
    zhiYinYang,
    nayin: cycle.getSound().getName(),
    tenGod,
    hideStems,
    hideStemSingle: hideStems.length === 1,
  }
}

function tenStarFromStem(stem: HeavenStem, dayMaster: HeavenStem): TenGodType {
  const idx = dayMaster.getTenStar(stem).getIndex()
  return TEN_STAR_INDEX_TO_TYPE[idx]
}

function collectHideStems(branch: EarthBranch): HideStem[] {
  const list = branch.getHideHeavenStems()
  if (list.length === 1) {
    const it = list[0]
    return [{
      gan: it.getHeavenStem().getName(),
      element: it.getHeavenStem().getElement().getName() as ElementName,
      weight: 0.7,
      type: 'main',
    }]
  }

  return list.map((it) => {
    const t = it.getType()
    let weight: 0.7 | 0.2 | 0.1
    let type: HideStem['type']
    if (t === HideHeavenStemType.MAIN) {
      weight = 0.7
      type = 'main'
    } else if (t === HideHeavenStemType.MIDDLE) {
      weight = 0.2
      type = 'middle'
    } else {
      weight = 0.1
      type = 'residual'
    }
    return {
      gan: it.getHeavenStem().getName(),
      element: it.getHeavenStem().getElement().getName() as ElementName,
      weight,
      type,
    }
  })
}

// ---------------------------------------------------------------------------
// 五行权重
// ---------------------------------------------------------------------------

function sumElements(
  pillars: PillarInfo[],
  monthZhi: EarthBranch,
): ElementsScore {
  const score: ElementsScore = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0,
  }
  const monthElement = monthZhi.getElement().getName() as ElementName

  for (const p of pillars) {
    score[ELEMENT_SCORE_KEY[p.ganElement]] += 1.0
    for (const h of p.hideStems) {
      score[ELEMENT_SCORE_KEY[h.element]] += h.weight
    }
  }

  // 月令五行 ×1.5（按 design doc 规则）
  const monthKey = ELEMENT_SCORE_KEY[monthElement]
  score[monthKey] = +(score[monthKey] * SEASON_WEIGHT).toFixed(3)
  return score
}

function buildElementCells(elements: ElementsScore): ElementCell[] {
  const total = Object.values(elements).reduce((a, b) => a + b, 0) || 1
  const avg = total / 5

  return ELEMENT_NAMES.map((name) => {
    const score = elements[ELEMENT_SCORE_KEY[name]]
    const percent = score / total
    let status: ElementCell['status']
    if (score > avg * 1.2) status = 'strong'
    else if (score < avg * 0.8) status = 'weak'
    else status = 'balanced'
    return { name, score: +score.toFixed(2), percent: +percent.toFixed(3), status }
  })
}

// ---------------------------------------------------------------------------
// 旺衰 + 喜用神（MVP 简化版）
// ---------------------------------------------------------------------------

function judgeStrength(
  elements: ElementsScore,
  dayMasterElement: ElementName,
): StrengthLevel {
  const total = Object.values(elements).reduce((a, b) => a + b, 0) || 1
  const me = elements[ELEMENT_SCORE_KEY[dayMasterElement]]
  const avg = total / 5
  const ratio = me / avg

  if (ratio >= 1.6) return '极旺'
  if (ratio >= 1.2) return '偏旺'
  if (ratio >= 0.8) return '中和'
  if (ratio >= 0.4) return '偏弱'
  return '极弱'
}

/**
 * 喜用神 / 忌神（MVP 版规则）：
 *  - 弱：取生我（印） + 同我（比劫）
 *  - 旺：取克我（官杀） + 我泄（食伤）+ 我克（财）中的弱者
 *  - 中和：补不足、抑过旺
 */
function pickFavorable(
  strength: StrengthLevel,
  dayMasterElement: ElementName,
): { favorable: ElementName[]; unfavorable: ElementName[] } {
  // 五行相生：木→火→土→金→水→木
  const sheng: Record<ElementName, ElementName> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
  // 五行相克：木→土，火→金，土→水，金→木，水→火
  const ke: Record<ElementName, ElementName> = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' }

  const isStrong = strength === '极旺' || strength === '偏旺'
  const isWeak = strength === '极弱' || strength === '偏弱'

  if (isWeak) {
    // 印 + 比劫
    const yin = inverse(sheng, dayMasterElement) // 生我者
    return {
      favorable: [yin, dayMasterElement],
      unfavorable: [ke[dayMasterElement], sheng[dayMasterElement]],
    }
  }
  if (isStrong) {
    // 官杀 + 食伤 + 财（取相对弱者，先简化为取 2 个）
    const guan = inverse(ke, dayMasterElement) // 克我者
    const shang = sheng[dayMasterElement] // 我生者（食伤）
    return {
      favorable: [guan, shang],
      unfavorable: [dayMasterElement, inverse(sheng, dayMasterElement)],
    }
  }
  // 中和
  return {
    favorable: [sheng[dayMasterElement], ke[dayMasterElement]],
    unfavorable: [],
  }
}

/** 在映射 m 中找到 value 对应的 key（"被生者→生者"反查） */
function inverse(m: Record<ElementName, ElementName>, target: ElementName): ElementName {
  const found = (Object.entries(m) as [ElementName, ElementName][]).find(([, v]) => v === target)
  return found ? found[0] : target
}

// ---------------------------------------------------------------------------
// 大运
// ---------------------------------------------------------------------------

function buildDecades(
  childLimit: ChildLimit,
  dayMaster: HeavenStem,
  favorable: ElementName[],
  unfavorable: ElementName[],
): DecadeFortuneItem[] {
  const list: DecadeFortuneItem[] = []
  let cur = childLimit.getStartDecadeFortune()
  for (let i = 0; i < 8; i++) {
    const cycle = cur.getSixtyCycle()
    const stem = cycle.getHeavenStem()
    const branch = cycle.getEarthBranch()
    const element = stem.getElement().getName() as ElementName

    const tenGodGan = tenStarFromStem(stem, dayMaster)
    const tenGodZhi: TenGodType = tenStarFromBranchHidden(branch, dayMaster)

    const tendency = judgeTendency(element, favorable, unfavorable)
    const startYear = cur.getStartSixtyCycleYear().getYear()
    const endYear = cur.getEndSixtyCycleYear().getYear()

    list.push({
      gan: stem.getName(),
      zhi: branch.getName(),
      ganzhi: cycle.getName(),
      element,
      startAge: cur.getStartAge(),
      endAge: cur.getEndAge(),
      startYear,
      endYear,
      tenGod: `${tenGodGan} · ${tenGodZhi}`,
      tenGodGan,
      tendency,
      hint: getDecadeHint(tenGodGan, tendency),
      current: false,
    })
    cur = cur.next(1)
  }
  return list
}

/** 地支本气十神（用于大运/流年第二字段） */
function tenStarFromBranchHidden(branch: EarthBranch, dayMaster: HeavenStem): TenGodType {
  const main = branch.getHideHeavenStemMain()
  return tenStarFromStem(main, dayMaster)
}

// ---------------------------------------------------------------------------
// 流年
// ---------------------------------------------------------------------------

function buildFlowYears(
  startYear: number,
  dayMaster: HeavenStem,
  favorable: ElementName[],
  unfavorable: ElementName[],
): FlowYear[] {
  const list: FlowYear[] = []
  for (let i = 0; i < 10; i++) {
    const year = startYear + i
    const cycleYear = SixtyCycleYear.fromYear(year)
    const cycle = cycleYear.getSixtyCycle()
    const stem = cycle.getHeavenStem()
    const branch = cycle.getEarthBranch()
    const element = stem.getElement().getName() as ElementName
    const tenGod = tenStarFromStem(stem, dayMaster)
    const tendency = judgeTendency(element, favorable, unfavorable)
    const hint = getFlowYearHint(tenGod, tendency)
    list.push({
      year,
      ganzhi: cycle.getName(),
      gan: stem.getName(),
      zhi: branch.getName(),
      element,
      tenGod,
      tendency,
      hint: hint.hint,
      tags: hint.tags,
      current: i === 0,
    })
  }
  return list
}

// ---------------------------------------------------------------------------
// 吉凶判断（与喜用神比对）
// ---------------------------------------------------------------------------

function judgeTendency(
  element: ElementName,
  favorable: ElementName[],
  unfavorable: ElementName[],
): Tendency {
  if (favorable.includes(element)) return 'favorable'
  if (unfavorable.includes(element)) return 'unfavorable'
  return 'neutral'
}

// ---------------------------------------------------------------------------
// 元信息 + 简析
// ---------------------------------------------------------------------------

function buildMeta(solar: SolarTime, birth: BirthInput): ChartMeta {
  const day = solar.getSolarDay()
  const lunarDay = day.getLunarDay()
  const hourLabel = formatHourLabel(birth.hour)

  return {
    solar: `${day.toString()} ${hourLabel}`,
    solarEn: `${day.toString()} ${birth.hour}:${String(birth.minute).padStart(2, '0')}`,
    lunar: lunarDay.toString(),
    lunarEn: lunarDay.toString(),
    genderTitle: birth.gender === 'male' ? '乾造' : '坤造',
  }
}

function formatHourLabel(hour: number): string {
  const labels = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时']
  let idx = Math.floor((hour + 1) / 2) % 12
  if (hour === 23 || hour === 0) idx = 0
  return labels[idx]
}

interface InterpretInput {
  dayMaster: string
  dayMasterYinYang: '阴' | '阳'
  dayMasterElement: ElementName
  monthZhiName: string
  strength: StrengthLevel
  favorable: ElementName[]
  unfavorable: ElementName[]
  pattern: PatternInfo
}

function buildInterpret(input: InterpretInput): InterpretSummary {
  const hasFav = input.favorable.length > 0
  const hasUnf = input.unfavorable.length > 0
  const fav = hasFav ? input.favorable.join('、') : '中和无偏'
  const unf = hasUnf ? input.unfavorable.join('、') : '无明显'
  const tip = ELEMENT_TIPS[input.favorable[0] || input.dayMasterElement]

  // 第一段：优先按"日主×旺衰"差异化模板，未命中退回通用模板
  const customP1 = getParagraph1ByDayMaster(input.dayMaster, input.strength)
  const baseP1 = customP1
    ?? PARAGRAPH_1_TEMPLATE
      .replace('{dayMaster}', input.dayMaster)
      .replace('{dayMasterYinYang}', input.dayMasterYinYang)
      .replace('{element}', input.dayMasterElement)
      .replace('{monthZhi}', input.monthZhiName)
      .replace('{strengthDesc}', STRENGTH_DESC[input.strength])
      .replace('{strength}', input.strength)
      .replace('{favorable}', fav)

  // 差异化模板已包含日主气质 + 旺衰意象，但不含具体月令；统一在末尾追加"生于X月，喜用以Y为主"
  const paragraph1 = customP1
    ? `${baseP1}生于${input.monthZhiName}月，月令${STRENGTH_DESC[input.strength]}，喜用以${fav}为主。`
    : baseP1

  // 第二段：使用 pattern.ts 识别出的真实格局对应 hint
  const patternHint = getPatternHint(input.pattern.name)
  const paragraph2 = hasUnf
    ? `${patternHint}喜用神为${fav}，忌神为${unf}。日常宜亲近${fav}属性的人事物，避免${unf}属性过盛带来的失衡。喜用属性参考：${tip.color}、${tip.dir}、${tip.industry}。`
    : `${patternHint}喜用神为${fav}，五行整体趋于均衡。日常宜亲近${fav}属性的人事物（如颜色、方位、行业），保持当前平衡即可。喜用属性参考：${tip.color}、${tip.dir}、${tip.industry}。`

  return {
    paragraph1,
    paragraph2,
    tags: [
      `身 · ${input.strength}`,
      `格 · ${input.pattern.name}`,
      `用神 · ${fav}`,
      `忌神 · ${unf}`,
    ],
  }
}
