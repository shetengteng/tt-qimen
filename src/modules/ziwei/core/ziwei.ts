/**
 * 紫微斗数核心计算 — iztro 适配层
 *
 * 职责：
 *  - 输入：BirthInput（来自 user store）
 *  - 输出：领域对象 ZiweiChart（与 mock 同 shape，UI 无感切换）
 *
 * 设计依据：design/modules/17-紫微斗数模块.md §3.1 / §4 / §8
 *
 * 性能策略：
 *  - 同步调用，单次排盘 < 100ms（iztro 在浏览器实测）
 *  - Worker 化的边界仅在本文件 → buildZiweiChart()，可后续无破坏地包一层 Worker
 */

import { astro } from 'iztro'
import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe'
import type { IFunctionalPalace } from 'iztro/lib/astro/FunctionalPalace'
import type {
  EarthlyBranchName,
  PalaceName as IztroPalaceName,
  StarName,
} from 'iztro/lib/i18n'

import type { BirthInput } from '@/stores/user'
import { FortuneError } from '@/lib/errors'
import {
  EARTHLY_BRANCH_TO_SLOT,
  IZTRO_PALACE_TO_KEY,
  MUTAGEN_TO_SIHUA_KEY,
  joinGanZhi,
  type Brightness,
  type DaxianCell,
  type InterpretCard,
  type Palace,
  type PalaceKey,
  type SihuaKey,
  type SihuaPalaceMap,
  type Star,
  type StarKind,
  type TagTone,
  type XiaoxianCell,
  type ZiweiChart,
  type ZiweiMetaInfo,
} from '../types'

/* ---------------- 公共工具 ---------------- */

/** BirthForm 内部 hourIdx ↔ hour 的映射规则（与 BirthForm.vue 保持一致） */
function hourToTimeIndex(hour: number): number {
  if (hour === 23) return 12
  if (hour === 0) return 0
  return Math.floor((hour + 1) / 2)
}

/** 'YYYY-MM-DD' 格式化（iztro 接受 'YYYY-M-D' 或 'YYYY-MM-DD'，统一用补 0 形式更稳） */
function fmtDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** male/female → 男/女（iztro 的 GenderName 在 zh-CN 下） */
function toGender(g: 'male' | 'female'): '男' | '女' {
  return g === 'male' ? '男' : '女'
}

/** 12 时辰中文（与 BirthForm hours 一致：早子/丑/寅/卯/辰/巳/午/未/申/酉/戌/亥/晚子） */
const HOUR_LABELS = [
  '早子时', '丑时', '寅时', '卯时', '辰时', '巳时',
  '午时', '未时', '申时', '酉时', '戌时', '亥时', '晚子时',
] as const

/* ---------------- 星耀映射 ---------------- */

/**
 * 设计文档 §2 MVP 范围内的"重要星"白名单 —— 杂耀只挑这些进 UI，避免 12 宫挤压。
 * 其它杂耀依旧由 iztro 计算并保留在 chart.palaces 里（如未来需要可改 UI）。
 */
const IMPORTANT_AUX_STARS: ReadonlySet<StarName> = new Set<StarName>([
  '左辅', '右弼', '文昌', '文曲', '天魁', '天钺',
  '禄存', '天马', '红鸾', '天喜',
] as StarName[])

const MALEFIC_STARS: ReadonlySet<StarName> = new Set<StarName>([
  '擎羊', '陀罗', '火星', '铃星', '地空', '地劫',
] as StarName[])

/** 把 iztro 的 Star 按设计要求分到 main / aux / malefic 三类 */
function classifyStarKind(starName: StarName, isMajor: boolean, isMalefic: boolean): StarKind | null {
  if (isMajor) return 'main'
  if (isMalefic || MALEFIC_STARS.has(starName)) return 'malefic'
  if (IMPORTANT_AUX_STARS.has(starName)) return 'aux'
  return null
}

/** Brightness 容错：iztro 给的 brightness 可能为空字符串 / undefined */
function normalizeBrightness(b: unknown): Brightness | undefined {
  if (typeof b !== 'string' || b.length === 0) return undefined
  const allow: Brightness[] = ['庙', '旺', '得', '利', '平', '不', '陷']
  return allow.includes(b as Brightness) ? (b as Brightness) : undefined
}

function normalizeSihua(m: unknown): SihuaKey | undefined {
  if (typeof m !== 'string') return undefined
  return MUTAGEN_TO_SIHUA_KEY[m]
}

/** 把 iztro Palace 内的多个星数组合并为 UI 用的 stars[] */
function mergeStars(p: IFunctionalPalace): Star[] {
  const out: Star[] = []

  for (const s of p.majorStars) {
    out.push({
      name: s.name,
      kind: 'main',
      brightness: normalizeBrightness(s.brightness),
      sihua: normalizeSihua(s.mutagen),
    })
  }

  for (const s of p.minorStars) {
    const kind = classifyStarKind(s.name, false, false)
    if (!kind) continue
    out.push({
      name: s.name,
      kind,
      brightness: normalizeBrightness(s.brightness),
      sihua: normalizeSihua(s.mutagen),
    })
  }

  for (const s of p.adjectiveStars) {
    const kind = classifyStarKind(s.name, false, false)
    if (!kind) continue
    out.push({
      name: s.name,
      kind,
      brightness: normalizeBrightness(s.brightness),
      sihua: normalizeSihua(s.mutagen),
    })
  }

  return out
}

/* ---------------- Palace / 大限 / 小限 ---------------- */

interface BuildPalacesResult {
  palaces: Palace[]
  /** 命宫 PalaceKey */
  benming: PalaceKey
  /** 命宫所在 iztro index（用于派生三方四正） */
  benmingIztroIndex: number
}

function buildPalaces(astrolabe: IFunctionalAstrolabe): BuildPalacesResult {
  const list: Palace[] = []
  let benming: PalaceKey = 'ming'
  let benmingIztroIndex = 0

  astrolabe.palaces.forEach((p, idx) => {
    const key = IZTRO_PALACE_TO_KEY[p.name as IztroPalaceName]
    if (!key) return

    const slot = EARTHLY_BRANCH_TO_SLOT[p.earthlyBranch as EarthlyBranchName] ?? 1
    const range = p.decadal?.range
    const daxianRange = Array.isArray(range) && range[0] > 0
      ? `${range[0]}-${range[1]}`
      : '—'

    list.push({
      key,
      isMing: p.name === '命宫',
      isShen: p.isBodyPalace,
      slot,
      ganzhi: joinGanZhi(p.heavenlyStem, p.earthlyBranch),
      changsheng12: p.changsheng12 || '',
      daxianRange,
      stars: mergeStars(p),
    })

    if (p.name === '命宫') {
      benming = key
      benmingIztroIndex = idx
    }
  })

  list.sort((a, b) => a.slot - b.slot)
  return { palaces: list, benming, benmingIztroIndex }
}

/** 大限：每宫一段，按起始年龄升序排 */
function buildDaxianCells(astrolabe: IFunctionalAstrolabe, currentDecadalIndex: number): DaxianCell[] {
  const cells: DaxianCell[] = []
  astrolabe.palaces.forEach((p, idx) => {
    const r = p.decadal?.range
    if (!Array.isArray(r) || r[0] <= 0) return
    const key = IZTRO_PALACE_TO_KEY[p.name as IztroPalaceName]
    if (!key) return
    cells.push({
      age: `${r[0]}-${r[1]}`,
      palaceKey: key,
      ganzhi: joinGanZhi(p.decadal.heavenlyStem, p.decadal.earthlyBranch),
      current: idx === currentDecadalIndex,
    })
  })
  cells.sort((a, b) => Number(a.age.split('-')[0]) - Number(b.age.split('-')[0]))
  return cells
}

/**
 * 小限 6 段：当前公历年 -1 ~ +4。
 * 对每年通过 horoscope(date).age 拿到落宫；为最小化 horoscope 调用次数，
 * 我们用每年 1 月 1 日（含晚子时）作为查询锚点，性能足够。
 */
function buildXiaoxianCells(
  astrolabe: IFunctionalAstrolabe,
  birthYear: number,
  currentYear: number,
): XiaoxianCell[] {
  const cells: XiaoxianCell[] = []
  for (let i = -1; i <= 4; i++) {
    const year = currentYear + i
    const probeDate = `${year}-06-15`
    let palaceKey: PalaceKey | undefined
    let ganzhi = ''
    try {
      const h = astrolabe.horoscope(probeDate)
      const ageItem = h.age
      const yrItem = h.yearly
      const palaceName = astrolabe.palaces[ageItem.index]?.name as IztroPalaceName | undefined
      if (palaceName) palaceKey = IZTRO_PALACE_TO_KEY[palaceName]
      ganzhi = joinGanZhi(yrItem.heavenlyStem, yrItem.earthlyBranch)
    } catch {
      // 排盘越界年份直接跳过
      continue
    }
    if (!palaceKey) continue
    cells.push({
      year,
      palaceKey,
      ganzhi,
      current: year === currentYear,
    })
  }
  // 兜底：极端情况下没有"current"标记，把最接近 currentYear 的一项标 current
  if (!cells.some((c) => c.current) && cells.length > 0) {
    const target = cells.reduce((a, b) =>
      Math.abs(a.year - currentYear) <= Math.abs(b.year - currentYear) ? a : b,
    )
    target.current = true
  }
  // birthYear 仅用于未来扩展（虚岁推算），暂不影响当前结果
  void birthYear
  return cells
}

/* ---------------- 四化 / 三方四正 / 解读卡 ---------------- */

function buildSihuaMap(palaces: Palace[]): SihuaPalaceMap {
  const empty = { star: '', palaceKey: 'ming' as PalaceKey }
  const map: SihuaPalaceMap = {
    lu: { ...empty },
    quan: { ...empty },
    ke: { ...empty },
    ji: { ...empty },
  }
  for (const p of palaces) {
    for (const s of p.stars) {
      if (!s.sihua) continue
      map[s.sihua] = { star: s.name, palaceKey: p.key }
    }
  }
  return map
}

/** 命宫驱动的三方四正：命/财帛/官禄 + 对宫(迁移) */
function buildSanfang(benming: PalaceKey) {
  return {
    benming,
    triad: [benming, 'caibo', 'guanlu'] as PalaceKey[],
    duigong: 'qianyi' as PalaceKey,
  }
}

/**
 * 解读卡（启发式占位版本）：
 *  - mingPalace：命宫主星 + 亮度 + 命宫四化
 *  - sihua：四化落宫缩写
 *  - minorStars：命宫副星 / 煞星
 *  - shenZhu：身宫主星
 *
 * 设计文档 §3.2 的完整模板（500 段）在 data/ziwei/*.json 中持久化，本轮先用启发式覆盖，
 * 后续替换 builder 不影响 UI。
 */
function buildInterpretCards(palaces: Palace[], sihuaMap: SihuaPalaceMap): InterpretCard[] {
  const ming = palaces.find((p) => p.isMing)
  const shen = palaces.find((p) => p.isShen)

  const mingMains = ming?.stars.filter((s) => s.kind === 'main') ?? []
  const mingTags = mingMains.slice(0, 3).map((s) => ({
    label: s.brightness ? `${s.name}${s.brightness}` : s.name,
    tone: 'gold' as const,
  }))
  const mingSihuaStar = mingMains.find((s) => s.sihua)
  if (mingSihuaStar) {
    mingTags.unshift({
      label: `${mingSihuaStar.name}化${labelOfSihua(mingSihuaStar.sihua!)}`,
      tone: 'gold' as const,
    })
  }

  const sihuaTags = (Object.keys(sihuaMap) as SihuaKey[])
    .filter((k) => sihuaMap[k].star)
    .map((k) => ({
      label: `${labelOfSihua(k)}入${shortPalaceName(sihuaMap[k].palaceKey)}`,
      tone: toneOfSihua(k),
    }))

  const auxStars = ming?.stars.filter((s) => s.kind === 'aux' || s.kind === 'malefic') ?? []
  const minorTags = auxStars.slice(0, 4).map((s) => {
    const tone: TagTone = s.kind === 'malefic' ? 'danger' : 'accent'
    return { label: s.name, tone }
  })

  const shenMains = shen?.stars.filter((s) => s.kind === 'main') ?? []
  const shenTags = shenMains.slice(0, 3).map((s) => ({
    label: s.brightness ? `${s.name}${s.brightness}` : s.name,
    tone: 'plain' as const,
  }))

  return [
    { key: 'mingPalace', tags: mingTags.length ? mingTags : [{ label: '—' as string }] },
    { key: 'sihua',     tags: sihuaTags.length ? sihuaTags : [{ label: '—' as string }] },
    { key: 'minorStars', tags: minorTags.length ? minorTags : [{ label: '—' as string }] },
    { key: 'shenZhu',   tags: shenTags.length ? shenTags : [{ label: '—' as string }] },
  ]
}

function labelOfSihua(k: SihuaKey): string {
  return ({ lu: '禄', quan: '权', ke: '科', ji: '忌' } as const)[k]
}

function toneOfSihua(k: SihuaKey): 'jade' | 'gold' | 'plain' | 'danger' {
  return ({ lu: 'jade', quan: 'gold', ke: 'plain', ji: 'danger' } as const)[k]
}

const PALACE_SHORT: Record<PalaceKey, string> = {
  ming: '命', xiongdi: '兄', fuqi: '夫', zinv: '子',
  caibo: '财', jie: '疾', qianyi: '迁', jiaoyou: '友',
  guanlu: '官', tianzhai: '宅', fude: '福', fumu: '父',
}

function shortPalaceName(k: PalaceKey): string {
  return PALACE_SHORT[k] ?? k
}

/* ---------------- 元信息 ---------------- */

function buildMeta(astrolabe: IFunctionalAstrolabe, birth: BirthInput, hour: number): ZiweiMetaInfo {
  const hourLabel = HOUR_LABELS[hourToTimeIndex(hour)] ?? ''
  // iztro 返回 YYYY-M-D（无补零），统一为 YYYY-MM-DD 与页面其它处对齐
  const solarParts = astrolabe.solarDate.split('-').map(Number)
  const solar = solarParts.length === 3
    ? fmtDate(solarParts[0], solarParts[1], solarParts[2])
    : astrolabe.solarDate
  const lunar = astrolabe.lunarDate
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentAge = currentYear - birth.year + 1

  // 当前流年干支：通过 horoscope(today).yearly 取
  let currentYearGz = ''
  try {
    const h = astrolabe.horoscope(`${currentYear}-06-15`)
    currentYearGz = joinGanZhi(h.yearly.heavenlyStem, h.yearly.earthlyBranch)
  } catch {
    currentYearGz = ''
  }

  return {
    solar: `${solar} ${hourLabel}`,
    lunar,
    fiveElementsClass: astrolabe.fiveElementsClass,
    qiyunAge: 0,
    mingZhu: astrolabe.soul,
    shenZhu: astrolabe.body,
    doujun: '',
    ownerName: '',
    gender: toGender(birth.gender),
    currentAge,
    currentYear,
    currentYearGz,
  }
}

/* ---------------- 主入口 ---------------- */

/**
 * 排盘并组装领域对象 ZiweiChart。
 *
 * 异常策略（统一为 FortuneError）：
 *   - iztro 因非法日期 / 跨范围而抛出原生 Error → wrap 为 FortuneError
 *     code: 'invalid-input'，并把原 err 放入 cause 保留调试上下文
 *   - 调用方可统一用 `FortuneError.is(err)` 区分类型
 */
export function buildZiweiChart(birth: BirthInput): ZiweiChart {
  try {
    return buildZiweiChartInternal(birth)
  } catch (err) {
    if (FortuneError.is(err)) throw err
    throw new FortuneError({
      module: 'ziwei',
      code: 'invalid-input',
      message: `[ziwei] calculate failed: ${(err as Error)?.message ?? 'unknown'}`,
      cause: err,
      details: { birth: { ...birth } },
    })
  }
}

function buildZiweiChartInternal(birth: BirthInput): ZiweiChart {
  const dateStr = fmtDate(birth.year, birth.month, birth.day)
  const timeIndex = hourToTimeIndex(birth.hour)
  const gender = toGender(birth.gender)

  const astrolabe = birth.calendar === 'lunar'
    ? astro.byLunar(dateStr, timeIndex, gender, false, true, 'zh-CN')
    : astro.bySolar(dateStr, timeIndex, gender, true, 'zh-CN')

  const { palaces, benming } = buildPalaces(astrolabe)
  const sihuaMap = buildSihuaMap(palaces)
  const sanfang = buildSanfang(benming)

  const meta = buildMeta(astrolabe, birth, birth.hour)

  // 当前大限：通过 horoscope(today).decadal.index 拿到 iztro 索引
  let currentDecadalIndex = -1
  try {
    const h = astrolabe.horoscope(`${meta.currentYear}-06-15`)
    currentDecadalIndex = h.decadal.index
  } catch {
    /* ignore */
  }

  const daxianCells = buildDaxianCells(astrolabe, currentDecadalIndex)
  const xiaoxianCells = buildXiaoxianCells(astrolabe, birth.year, meta.currentYear)
  const interpretCards = buildInterpretCards(palaces, sihuaMap)

  return {
    meta,
    palaces,
    sihuaMap,
    daxianCells,
    xiaoxianCells,
    interpretCards,
    sanfangSiZheng: sanfang,
  }
}
