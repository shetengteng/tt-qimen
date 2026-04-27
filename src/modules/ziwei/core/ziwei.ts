/**
 * 紫微斗数核心计算 — iztro 适配层
 *
 * 职责：
 *  - 输入：BirthInput（来自 user store）
 *  - 输出：领域对象 ZiweiChart（与 mock 同 shape，UI 无感切换）
 *
 * 设计依据：design/modules/17-紫微斗数模块.md §3.1 / §4 / §8
 *
 * 性能策略（§3.2）：
 *  - iztro（≈ 320KB）使用动态 import，仅在用户点击"排盘"时下载
 *  - 首屏只需加载 ZiweiPage 表单部分，进入页面更快
 *  - 单次排盘 < 100ms（iztro 在浏览器实测）
 *  - 同一会话首次需多 ~150ms 网络/解码，之后 dynamic import 命中缓存
 */

import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe'
import type { IFunctionalPalace } from 'iztro/lib/astro/FunctionalPalace'
import type {
  EarthlyBranchName,
  GenderName,
  PalaceName as IztroPalaceName,
  StarName,
} from 'iztro/lib/i18n'

/** iztro `astro` 命名空间的精简类型；只暴露我们用到的两个方法 */
type IztroAstro = {
  byLunar: (
    dateStr: string,
    timeIndex: number,
    gender: GenderName,
    isLeapMonth: boolean,
    fixLeap: boolean,
    locale: string,
  ) => IFunctionalAstrolabe
  bySolar: (
    dateStr: string,
    timeIndex: number,
    gender: GenderName,
    fixLeap: boolean,
    locale: string,
  ) => IFunctionalAstrolabe
}

/** 单例 Promise，避免并发排盘时重复 import iztro */
let astroPromise: Promise<IztroAstro> | null = null

function loadAstro(): Promise<IztroAstro> {
  if (!astroPromise) {
    astroPromise = import('iztro').then((mod) => mod.astro as unknown as IztroAstro)
  }
  return astroPromise
}

import type { BirthInput } from '@/stores/user'
import { FortuneError } from '@/lib/errors'
import { useTrueSolarTime } from '@/composables/useTrueSolarTime'
import {
  EARTHLY_BRANCH_TO_SLOT,
  IZTRO_PALACE_TO_KEY,
  MUTAGEN_TO_SIHUA_KEY,
  joinGanZhi,
  type Brightness,
  type DaxianCell,
  type InterpretCard,
  type Palace,
  type DaxianMutagenStar,
  type DecadalDetail,
  type FlowYearCell,
  type MinorStarReading,
  type PalaceKey,
  type PalaceMajorReading,
  type SihuaKey,
  type SihuaPalaceMap,
  type SoulPalaceCard,
  type Star,
  type StarKind,
  type TagTone,
  type XiaoxianCell,
  type ZiweiChart,
  type ZiweiMetaInfo,
} from '../types'
import {
  LUCKY_MINOR_STARS,
  ZH_MINOR_STAR_TO_KEY,
  ZH_STAR_TO_KEY,
} from '../data'

/**
 * 12 宫六冲对宫表（与 PalaceKey 对齐，用于借宫）
 *
 * 紫微"空宫看对宫"是基本原则；六冲组合在紫微术语中亦称对照宫。
 *   - 命 ↔ 迁 · 兄 ↔ 友 · 夫 ↔ 官 · 子 ↔ 田
 *   - 财 ↔ 福 · 疾 ↔ 父
 *
 * 备注：六冲 ≠ 阴阳对称；这里以"星情参照"为目的，与三方四正不同。
 */
const OPPOSITE_PALACE: Record<PalaceKey, PalaceKey> = {
  ming: 'qianyi',
  qianyi: 'ming',
  xiongdi: 'jiaoyou',
  jiaoyou: 'xiongdi',
  fuqi: 'guanlu',
  guanlu: 'fuqi',
  zinv: 'tianzhai',
  tianzhai: 'zinv',
  caibo: 'fude',
  fude: 'caibo',
  jie: 'fumu',
  fumu: 'jie',
}

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

/** 12 地支顺序：子0、丑1、寅2、…、亥11；用于斗君取地支文案 */
const EARTHLY_BRANCHES = [
  '子', '丑', '寅', '卯', '辰', '巳',
  '午', '未', '申', '酉', '戌', '亥',
] as const

/**
 * 斗君（子年斗君）地支
 *
 * 公式：起寅宫数正月，顺数到生月；再从该宫起子时，逆数到生时；最终落点即斗君地支。
 * 等价为单步公式：`branchIndex = (2 + (lunarMonth - 1) - timeIndex + 12 * N) mod 12`
 *   - 寅地支序为 2，正月对应"加 0"
 *   - timeIndex 0..11 = 子..亥；晚子时（iztro hourLabel=12）按"子时"折算（与紫微"子时归本日"惯例对齐）
 *
 * 说明：紫微斗数中斗君以阴历月 + 时辰为本，与节气月柱（八字）有别。
 *
 * @param lunarMonth 阴历月（1-12，闰月按本月计）
 * @param timeIndex 12 时辰索引（0-11，晚子时折算为 0）
 * @returns 斗君地支字符（如「卯」）；非法输入返回空串
 */
function calcDoujun(lunarMonth: number, timeIndex: number): string {
  if (!Number.isInteger(lunarMonth) || lunarMonth < 1 || lunarMonth > 12) return ''
  if (!Number.isInteger(timeIndex) || timeIndex < 0 || timeIndex > 11) return ''
  const idx = ((2 + (lunarMonth - 1) - timeIndex) % 12 + 12) % 12
  return EARTHLY_BRANCHES[idx]
}

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
 * 小限 6 段：当前公历年 -2 ~ +3（含当前年，前看 2 年、后看 3 年）。
 *
 * 设计依据：
 * - 6 段长度由 UI（DaxianGrid 蛇形 6 段）固定
 * - 含当前年是"运限定位"刚需
 * - 用户对未来感知比过去稍重一格，故偏未来 1 段；类型注释 §"当前 ±2，含当前年" 在 6 段下
 *   语义更新为 `-2 ~ +3` 不对称窗口
 *
 * 对每年通过 horoscope(date).age 拿到落宫；用每年 6 月 15 日作为查询锚点
 * 避开年初岁前后 / 年末晚子时的边界，性能足够。
 */
function buildXiaoxianCells(
  astrolabe: IFunctionalAstrolabe,
  birthYear: number,
  currentYear: number,
): XiaoxianCell[] {
  const cells: XiaoxianCell[] = []
  for (let i = -2; i <= 3; i++) {
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
 *  - mingPalace：命宫主星 + 亮度 + 命宫四化；空宫则借迁移宫对宫主星（紫微"空宫看对宫"）
 *  - sihua：四化落宫缩写
 *  - minorStars：命宫副星 / 煞星；空宫显示"清宫"标签
 *  - shenZhu：身宫主星；空宫亦借对宫（迁移）
 *
 * 设计文档 §3.2 的完整模板（500 段）在 data/ziwei/*.json 中持久化，本轮先用启发式覆盖，
 * 后续替换 builder 不影响 UI。
 */
/**
 * 命宫主星论命派生（设计文档 §3.3 / §5 步骤 4）
 *
 * 派生策略：
 *   1. 命宫主星（kind === 'main'）→ 取第一颗主星生成卡片（多主星同宫如紫微天府只取首位代表）
 *   2. 命宫无主星 → 借迁移宫主星，borrowed = true
 *   3. 借宫亦无主星 → 返回 null（极小概率，UI 隐藏整段）
 *
 * 注：UI 文本来自 i18n + data/soulPalace.{lang}.ts；本函数只产 starKey/borrowed/亮度/四化等数据维度。
 *
 * @param palaces 完整 12 宫位
 * @returns SoulPalaceCard 或 null
 */
function buildSoulPalaceCard(palaces: Palace[]): SoulPalaceCard | null {
  const ming = palaces.find((p) => p.isMing)
  if (!ming) return null

  const pickFirstMain = (p: Palace | undefined) =>
    p?.stars.find((s) => s.kind === 'main' && ZH_STAR_TO_KEY[s.name])

  let star = pickFirstMain(ming)
  let borrowed = false
  if (!star) {
    const qianyi = palaces.find((p) => p.key === 'qianyi')
    star = pickFirstMain(qianyi)
    borrowed = !!star
  }
  if (!star) return null

  const starKey = ZH_STAR_TO_KEY[star.name]
  if (!starKey) return null

  return {
    starKey,
    starName: star.name,
    borrowed,
    brightness: star.brightness,
    sihua: star.sihua,
  }
}

/**
 * 各宫主星简析数组派生（设计文档 §3.3 第二行 / §5 步骤 4）
 *
 * 派生策略：
 *   1. 遍历 12 宫，按 slot 升序
 *   2. 该宫含主星 → 每颗主星生成一段 reading（borrowed=false）
 *   3. 该宫无主星 → 借对宫主星，每颗借星生成一段 reading（borrowed=true）
 *      - 借宫保留对宫主星的亮度与四化（与紫微"空宫看对宫"传统呼应）
 *   4. 借宫亦无主星 → 跳过（极少数双空宫，UI 不渲染该宫的简析）
 *
 * 注：此函数只返回 starKey/palaceKey/亮度/四化等"数据维度"；
 * UI 实际文本来自 i18n + data/palaceMajor.{lang}.ts，UI 层运行时拼接。
 *
 * @param palaces 完整 12 宫位
 * @returns PalaceMajorReading[]（按 slot 升序，每宫多主星按 iztro 原序）
 */
function buildPalaceMajorReadings(palaces: Palace[]): PalaceMajorReading[] {
  const out: PalaceMajorReading[] = []
  const sorted = [...palaces].sort((a, b) => a.slot - b.slot)

  for (const palace of sorted) {
    const mains = palace.stars.filter((s) => s.kind === 'main' && ZH_STAR_TO_KEY[s.name])

    if (mains.length > 0) {
      for (const star of mains) {
        const starKey = ZH_STAR_TO_KEY[star.name]
        if (!starKey) continue
        out.push({
          palaceKey: palace.key,
          starKey,
          starName: star.name,
          borrowed: false,
          brightness: star.brightness,
          sihua: star.sihua,
        })
      }
      continue
    }

    // 空宫 → 借对宫主星
    const oppositeKey = OPPOSITE_PALACE[palace.key]
    if (!oppositeKey) continue
    const opposite = palaces.find((p) => p.key === oppositeKey)
    if (!opposite) continue
    const oppositeMains = opposite.stars.filter((s) => s.kind === 'main' && ZH_STAR_TO_KEY[s.name])
    for (const star of oppositeMains) {
      const starKey = ZH_STAR_TO_KEY[star.name]
      if (!starKey) continue
      out.push({
        palaceKey: palace.key,
        starKey,
        starName: star.name,
        borrowed: true,
        brightness: star.brightness,
        sihua: star.sihua,
      })
    }
  }

  return out
}

/**
 * 六吉六煞入宫数组派生（设计文档 §3.3 第三行 / §5 步骤 4）
 *
 * 派生策略：
 *   1. 遍历 12 宫，按 slot 升序
 *   2. 每宫内扫 stars[]，命中 ZH_MINOR_STAR_TO_KEY 的副星生成一段 reading
 *   3. 副星不存在借宫概念（其落宫在排盘时已确定）→ 不命中即跳过
 *   4. 同一宫多颗副星 → 按 iztro 原序产生多段 reading
 *
 * 注：UI 文本来自 i18n + data/minorStars.{lang}.ts；本函数只产出
 * starKey/palaceKey/isLucky 等数据维度，UI 层运行时拼接文案与配色。
 *
 * @param palaces 完整 12 宫位
 * @returns MinorStarReading[]（按 slot 升序）
 */
function buildMinorStarsReadings(palaces: Palace[]): MinorStarReading[] {
  const out: MinorStarReading[] = []
  const luckySet = new Set<string>(LUCKY_MINOR_STARS)
  const sorted = [...palaces].sort((a, b) => a.slot - b.slot)

  for (const palace of sorted) {
    for (const star of palace.stars) {
      const starKey = ZH_MINOR_STAR_TO_KEY[star.name]
      if (!starKey) continue
      out.push({
        palaceKey: palace.key,
        starKey,
        starName: star.name,
        isLucky: luckySet.has(starKey),
      })
    }
  }

  return out
}

function buildInterpretCards(palaces: Palace[], sihuaMap: SihuaPalaceMap): InterpretCard[] {
  const ming = palaces.find((p) => p.isMing)
  const shen = palaces.find((p) => p.isShen)
  // 迁移宫（命宫对宫）— 用于空宫借星
  const qianyi = palaces.find((p) => p.key === 'qianyi')

  const mingMains = ming?.stars.filter((s) => s.kind === 'main') ?? []
  const mingTags: { label: string; tone?: TagTone }[] = mingMains.slice(0, 3).map((s) => ({
    label: s.brightness ? `${s.name}${s.brightness}` : s.name,
    tone: 'gold',
  }))
  const mingSihuaStar = mingMains.find((s) => s.sihua)
  if (mingSihuaStar) {
    mingTags.unshift({
      label: `${mingSihuaStar.name}化${labelOfSihua(mingSihuaStar.sihua!)}`,
      tone: 'gold',
    })
  }

  // 命宫无主星 → 借对宫（迁移）主星，标记为"借宫"
  if (!mingTags.length && qianyi) {
    const qianyiMains = qianyi.stars.filter((s) => s.kind === 'main')
    if (qianyiMains.length) {
      qianyiMains.slice(0, 3).forEach((s) => {
        const label = s.brightness ? `${s.name}${s.brightness}` : s.name
        mingTags.push({ label: `借${label}`, tone: 'jade' })
      })
    }
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

  // 身宫无主星 → 借对宫（身宫的对宫）的主星
  if (!shenTags.length && shen) {
    const shenOpposite = palaces.find((p) => p.slot === oppositeSlot(shen.slot))
    const shenOppMains = shenOpposite?.stars.filter((s) => s.kind === 'main') ?? []
    shenOppMains.slice(0, 3).forEach((s) => {
      const label = s.brightness ? `${s.name}${s.brightness}` : s.name
      shenTags.push({ label: `借${label}`, tone: 'plain' as const })
    })
  }

  // 空宫无副煞 → 显示"清宫"，避免裸 "—"
  const minorFallback: { label: string; tone?: TagTone }[] = mingTags.length === 0 && !ming?.stars.length
    ? [{ label: '清宫', tone: 'plain' as const }]
    : [{ label: '—' }]

  return [
    { key: 'mingPalace', tags: mingTags.length ? mingTags : [{ label: '空宫', tone: 'plain' as const }] },
    { key: 'sihua',     tags: sihuaTags.length ? sihuaTags : [{ label: '—' as string }] },
    { key: 'minorStars', tags: minorTags.length ? minorTags : minorFallback },
    { key: 'shenZhu',   tags: shenTags.length ? shenTags : [{ label: '—' as string }] },
  ]
}

/**
 * 4×4 紫微 slot（行优先 1..16）的对宫 slot
 *
 * 紫微 12 宫只用网格的外环 12 格，地支六冲对应对宫：
 *   子(15)↔午(2) · 丑(14)↔未(3) · 寅(13)↔申(4) · 卯(9)↔酉(8) · 辰(5)↔戌(12) · 巳(1)↔亥(16)
 */
function oppositeSlot(slot: number): number {
  const map: Record<number, number> = {
    1: 16, 16: 1,    // 巳 ↔ 亥
    2: 15, 15: 2,    // 午 ↔ 子
    3: 14, 14: 3,    // 未 ↔ 丑
    4: 13, 13: 4,    // 申 ↔ 寅
    5: 12, 12: 5,    // 辰 ↔ 戌
    8: 9,  9: 8,     // 酉 ↔ 卯
  }
  return map[slot] ?? slot
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
  const timeIndex = hourToTimeIndex(hour)
  const hourLabel = HOUR_LABELS[timeIndex] ?? ''
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

  // 起运岁数：命宫所在 Palace 的 decadal.range[0] 即"几岁起运"
  // 晚子时 hour=23 在 iztro 中已用 timeIndex=12 处理，无需特判
  let qiyunAge = 0
  const mingPalace = astrolabe.palaces.find((p) => p.name === '命宫')
  if (mingPalace?.decadal?.range && mingPalace.decadal.range[0] > 0) {
    qiyunAge = mingPalace.decadal.range[0]
  }

  // 斗君：用阴历月 + 时辰索引（晚子时 iztro=12 折算回 0）
  // 阴历月优先取自 iztro 解析的 rawDates，避免阳历输入下用错月
  const lunarMonth = astrolabe.rawDates?.lunarDate?.lunarMonth ?? birth.month
  const timeIndexForDoujun = timeIndex >= 12 ? 0 : timeIndex
  const doujun = calcDoujun(lunarMonth, timeIndexForDoujun)

  return {
    solar: `${solar} ${hourLabel}`,
    lunar,
    fiveElementsClass: astrolabe.fiveElementsClass,
    qiyunAge,
    mingZhu: astrolabe.soul,
    shenZhu: astrolabe.body,
    doujun,
    ownerName: '',
    gender: toGender(birth.gender),
    currentAge,
    currentYear,
    currentYearGz,
  }
}

/* ---------------- 大限详情 / 流年卡 ---------------- */

/** SihuaKey 顺序（与 iztro horoscope.mutagen[] 顺序对齐：禄/权/科/忌） */
const SIHUA_ORDER: SihuaKey[] = ['lu', 'quan', 'ke', 'ji']

/**
 * 把"运限四化星名"映射回"该星落入本命哪个宫"
 *
 * iztro 的 `HoroscopeItem.mutagen` 是 `[禄星名, 权星名, 科星名, 忌星名]`；
 * 我们扫描本命 palaces.stars 找到同名星，记录其落入的本命 PalaceKey。
 *
 * 当本命中找不到同名星（极少数辅星不在 IMPORTANT_AUX_STARS 白名单）时返回 undefined。
 */
function resolveMutagenLandings(
  palaces: Palace[],
  mutagenStarNames: readonly string[],
): DaxianMutagenStar[] {
  const out: DaxianMutagenStar[] = []
  for (let i = 0; i < SIHUA_ORDER.length && i < mutagenStarNames.length; i++) {
    const starName = mutagenStarNames[i]
    if (!starName) continue
    const sihua = SIHUA_ORDER[i]
    const palaceKey = palaces.find((p) => p.stars.some((s) => s.name === starName))?.key
    out.push({ name: starName, sihua, palaceKey })
  }
  return out
}

/**
 * 当前大限详情卡数据（M2 §10）
 *
 * 输入：当前大限索引 + 已构建好的 palaces；从 iztro horoscope 取大限四化。
 * 输出：宫位 + 干支 + 主星 + 大限四化（含星落本命宫）。
 *
 * 异常静默：horoscope 越界等情况返回 null，UI 不渲染该卡。
 */
function buildCurrentDecadal(
  astrolabe: IFunctionalAstrolabe,
  palaces: Palace[],
  currentYear: number,
): DecadalDetail | null {
  try {
    const h = astrolabe.horoscope(`${currentYear}-06-15`)
    const decadalIndex = h.decadal.index
    if (decadalIndex < 0) return null

    const iztroPalace = astrolabe.palaces[decadalIndex]
    if (!iztroPalace) return null

    const palaceKey = IZTRO_PALACE_TO_KEY[iztroPalace.name as IztroPalaceName]
    if (!palaceKey) return null

    const targetPalace = palaces.find((p) => p.key === palaceKey)
    const mainStars = (targetPalace?.stars ?? [])
      .filter((s) => s.kind === 'main')
      .map((s) => ({ name: s.name, brightness: s.brightness }))

    const r = iztroPalace.decadal?.range
    const age = Array.isArray(r) && r[0] > 0 ? `${r[0]}-${r[1]}` : '—'
    const ganzhi = joinGanZhi(h.decadal.heavenlyStem, h.decadal.earthlyBranch)

    return {
      age,
      ganzhi,
      palaceKey,
      mainStars,
      mutagens: resolveMutagenLandings(palaces, h.decadal.mutagen),
    }
  } catch {
    return null
  }
}

/**
 * 流年卡 10 段（M2 §11）
 *
 * 范围：当前年 + 后续 9 年（不向过去看，避免年龄逻辑歧义）。
 * 每段：流年命宫 + 流年干支 + 流年四化（按本命 palaces 反查落宫）。
 *
 * 异常静默：单年 horoscope 越界则跳过该年，剩余年份正常返回。
 */
function buildFlowYears(
  astrolabe: IFunctionalAstrolabe,
  palaces: Palace[],
  currentYear: number,
): FlowYearCell[] {
  const cells: FlowYearCell[] = []
  for (let i = 0; i < 10; i++) {
    const year = currentYear + i
    try {
      const h = astrolabe.horoscope(`${year}-06-15`)
      const palaceName = astrolabe.palaces[h.yearly.index]?.name as IztroPalaceName | undefined
      const palaceKey = palaceName ? IZTRO_PALACE_TO_KEY[palaceName] : undefined
      if (!palaceKey) continue
      cells.push({
        year,
        ganzhi: joinGanZhi(h.yearly.heavenlyStem, h.yearly.earthlyBranch),
        palaceKey,
        mutagens: resolveMutagenLandings(palaces, h.yearly.mutagen),
        current: i === 0,
      })
    } catch {
      continue
    }
  }
  return cells
}

/* ---------------- 主入口 ---------------- */

/**
 * 紫微支持的公历年份区间（与 BirthForm 的 `<Select>` 取值范围一致）。
 *
 * 取值依据：
 *  - 下限 1900：紫微辅星 / 流年四化在 1900 年前公版数据稀缺；BirthForm 已只暴露 1900..currentYear
 *  - 上限 currentYear + 100：留足"未来排盘"余量，但拒收 9999 这类滥输
 *  - iztro probe 实测 1799-2200 仍能算出 12 宫；本前置校验仅防御 localStorage 腐化 / URL 滥参，
 *    不收紧用户在 BirthForm 内的合法操作
 */
const ZIWEI_YEAR_MIN = 1900
const ZIWEI_YEAR_MAX = new Date().getFullYear() + 100

/**
 * BirthInput 前置校验。
 *
 * 设计动机（结合 scripts/ziwei/probe-boundaries.mjs 实测）：
 *  - iztro 仅对 `wrong month` / `wrong hour` 抛错；其它越界（year=0 / day=30 of Feb / hour=-1）
 *    会**静默给出脏数据**（如 lunarDate = "undefined一年..."），下游 UI 渲染空盘 + 一堆空盒子
 *  - BirthForm 的下拉受控组件用户走不到非法值；真实风险来源于 URL deeplink 滥参 + localStorage 腐化
 *  - 因此本函数不依赖 iztro 的边界，主动挡住所有"形状不合法的输入"
 *
 * @throws FortuneError(invalid-input) 输入不合法时抛出，userMessage 由 UI 透传或走 i18n fallback
 */
function assertBirthInput(birth: BirthInput): void {
  const fail = (reason: string, details?: Record<string, unknown>): never => {
    throw new FortuneError({
      module: 'ziwei',
      code: 'invalid-input',
      message: `[ziwei] invalid birth input: ${reason}`,
      details: { birth: { ...birth }, ...details },
    })
  }

  if (birth.calendar !== 'solar' && birth.calendar !== 'lunar') {
    fail(`unknown calendar=${String(birth.calendar)}`)
  }
  if (!Number.isInteger(birth.year) || birth.year < ZIWEI_YEAR_MIN || birth.year > ZIWEI_YEAR_MAX) {
    fail(`year=${birth.year} not in [${ZIWEI_YEAR_MIN}, ${ZIWEI_YEAR_MAX}]`)
  }
  if (!Number.isInteger(birth.month) || birth.month < 1 || birth.month > 12) {
    fail(`month=${birth.month} not in [1, 12]`)
  }
  if (!Number.isInteger(birth.day) || birth.day < 1 || birth.day > 31) {
    fail(`day=${birth.day} not in [1, 31]`)
  }
  if (!Number.isInteger(birth.hour) || birth.hour < 0 || birth.hour > 23) {
    fail(`hour=${birth.hour} not in [0, 23]`)
  }
  if (!Number.isInteger(birth.minute) || birth.minute < 0 || birth.minute > 59) {
    fail(`minute=${birth.minute} not in [0, 59]`)
  }
  if (birth.gender !== 'male' && birth.gender !== 'female') {
    fail(`unknown gender=${String(birth.gender)}`)
  }

  if (birth.calendar === 'solar') {
    const probe = new Date(birth.year, birth.month - 1, birth.day)
    if (
      probe.getFullYear() !== birth.year
      || probe.getMonth() !== birth.month - 1
      || probe.getDate() !== birth.day
    ) {
      fail(`solar date ${birth.year}-${birth.month}-${birth.day} does not exist`)
    }
  }
}

/**
 * 排盘并组装领域对象 ZiweiChart。
 *
 * 异常策略（统一为 FortuneError）：
 *   - 前置 `assertBirthInput` 校验失败 → 抛 FortuneError(invalid-input)
 *   - iztro 因非法日期 / 跨范围而抛出原生 Error → wrap 为 FortuneError(invalid-input)
 *     并把原 err 放入 cause 保留调试上下文
 *   - 调用方可统一用 `FortuneError.is(err)` 区分类型
 */
export async function buildZiweiChart(birth: BirthInput): Promise<ZiweiChart> {
  try {
    assertBirthInput(birth)
    /**
     * 真太阳时修正：与 bazi 一致，在最外层统一处理。
     * - 修正后传给 buildZiweiChartInternal，下游的 timeIndex / dateStr 计算自动获益
     * - longitude 缺省 → noop
     * - 注意：iztro 的 timeIndex 仅取决于 hour 落在哪个时辰，而真太阳时的修正可能
     *   把 hour 推到下一个时辰（甚至跨日），这正是命理实践中"换时辰"的关键点
     */
    return await buildZiweiChartInternal(useTrueSolarTime(birth))
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

/** 预热 iztro chunk —— 在用户聚焦表单时调用，可让排盘点击后无感知加载 */
export function prefetchZiweiEngine(): void {
  void loadAstro()
}

async function buildZiweiChartInternal(birth: BirthInput): Promise<ZiweiChart> {
  const dateStr = fmtDate(birth.year, birth.month, birth.day)
  const timeIndex = hourToTimeIndex(birth.hour)
  const gender = toGender(birth.gender)

  const astro = await loadAstro()
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
  const soulPalaceCard = buildSoulPalaceCard(palaces)
  const palaceMajorReadings = buildPalaceMajorReadings(palaces)
  const minorStarReadings = buildMinorStarsReadings(palaces)
  const currentDecadal = buildCurrentDecadal(astrolabe, palaces, meta.currentYear)
  const flowYears = buildFlowYears(astrolabe, palaces, meta.currentYear)

  return {
    meta,
    palaces,
    sihuaMap,
    daxianCells,
    xiaoxianCells,
    interpretCards,
    soulPalaceCard,
    palaceMajorReadings,
    minorStarReadings,
    sanfangSiZheng: sanfang,
    currentDecadal,
    flowYears,
  }
}
