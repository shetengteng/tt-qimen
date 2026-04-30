/**
 * Path A fixture 生成器：在 tt-qimen 项目里调真实的 calculate / buildZiweiChart 等函数，
 * 把结果归一化为与 research/fixtures-native/ 同 shape 的 JSON，输出到 research/fixtures-ttqimen/。
 *
 * 用途：
 *   验证 "tt-qimen 包装层" 是否对底层算法库（tyme4ts/iztro）的输出引入了差异。
 *   path B（fixtures-native）已经验证 Python 库 vs 原生 JS 库 100% 对齐；
 *   path A 在此基础上回答 "tt-qimen 是否在包装层引入额外差异"。
 *
 * 覆盖范围：
 *   只覆盖 4 个 tyme4ts/iztro 主导且与 fixtures-native shape 兼容的模块：
 *     - bazi (calculateBazi)
 *     - ziwei (buildZiweiChart, async)
 *     - chenggu (calculateChenggu)
 *     - huangli (getHuangliDay)
 *
 *   其余 4 个模块（liuren / lingqian / xingming / jiemeng）由于算法或数据集与
 *   fixtures-native 不同，不适合机械化对齐验证，已用 path B 充分覆盖。
 *
 * 运行：
 *   cd /Users/.../tt-divination
 *   npx tsx scripts/research-fixtures/export-path-a.ts
 */

import { promises as fs } from 'fs'
import * as path from 'path'

import { SolarTime, LunarHour, ChildLimit, Gender } from 'tyme4ts'

import { calculateBazi } from '@/modules/bazi/core/bazi'
import { buildZiweiChart } from '@/modules/ziwei/core/ziwei'
import { calculateChenggu } from '@/modules/chenggu/core/chenggu'
import { getHuangliDay } from '@/modules/huangli/core/huangli'
import type { BirthInput } from '@/stores/user'

// ---------------------------------------------------------------------------
// 路径
// ---------------------------------------------------------------------------

const RESEARCH_DIR = path.resolve(
  process.cwd(),
  '../tt-qimen-skills/research',
)
const INPUTS_DIR = path.join(RESEARCH_DIR, 'case-inputs')
const OUT_DIR = path.join(RESEARCH_DIR, 'fixtures-ttqimen')

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------

interface CaseRecord {
  id: string
  tag?: string[]
  input: Record<string, unknown>
  expected?: Record<string, unknown>
  source?: string
  exportedAt?: string
}

const META = {
  source: `ttqimen@${new Date().toISOString().slice(0, 10)}`,
  exportedAt: new Date().toISOString(),
}

async function loadInputs(module: string): Promise<CaseRecord[]> {
  const file = path.join(INPUTS_DIR, `${module}-inputs.json`)
  const text = await fs.readFile(file, 'utf-8')
  return JSON.parse(text) as CaseRecord[]
}

async function writeFixtures(module: string, cases: CaseRecord[]): Promise<void> {
  await fs.mkdir(OUT_DIR, { recursive: true })
  const file = path.join(OUT_DIR, `${module}-cases.json`)
  await fs.writeFile(file, JSON.stringify(cases, null, 2) + '\n', 'utf-8')
  console.log(`  ✓ ${file}`)
}

function asBirthInput(c: CaseRecord): BirthInput {
  const i = c.input as Record<string, unknown>
  return {
    calendar: (i.calendar as 'solar' | 'lunar') ?? 'solar',
    year: i.year as number,
    month: i.month as number,
    day: i.day as number,
    hour: i.hour as number,
    minute: (i.minute as number) ?? 0,
    gender: (i.gender as 'male' | 'female') ?? 'male',
    longitude: i.longitude as number | undefined,
    birthplace: i.birthplace as string | undefined,
  }
}

// ---------------------------------------------------------------------------
// 八字
// ---------------------------------------------------------------------------

function birthToSolarTime(birth: BirthInput): SolarTime {
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

function calcBaziTtqimen(birth: BirthInput): Record<string, unknown> {
  const r = calculateBazi(birth)

  const solar = birthToSolarTime(birth)
  const childLimit = ChildLimit.fromSolarTime(
    solar,
    birth.gender === 'male' ? Gender.MAN : Gender.WOMAN,
  )
  let cur = childLimit.getStartDecadeFortune()
  const decades10: { ageStart: number; ganzhi: string }[] = []
  for (let i = 0; i < 10; i++) {
    decades10.push({ ageStart: cur.getStartAge(), ganzhi: cur.getSixtyCycle().getName() })
    cur = cur.next(1)
  }

  return {
    pillars: {
      year: r.pillars.year.ganzhi,
      month: r.pillars.month.ganzhi,
      day: r.pillars.day.ganzhi,
      hour: r.pillars.hour.ganzhi,
    },
    dayMaster: {
      stem: r.dayMaster,
      element: r.dayMasterElement,
      yinYang: r.dayMasterYinYang,
    },
    childLimit: {
      yearCount: r.startAge.year,
      monthCount: r.startAge.months,
    },
    decades: decades10,
  }
}

async function genBazi(): Promise<void> {
  console.log('[bazi] 生成 fixtures-ttqimen...')
  const cases = await loadInputs('bazi')
  for (const c of cases) {
    try {
      c.expected = calcBaziTtqimen(asBirthInput(c))
      c.source = META.source
      c.exportedAt = META.exportedAt
    } catch (err) {
      c.expected = { __error__: (err as Error).message }
      c.source = META.source
      c.exportedAt = META.exportedAt
    }
  }
  await writeFixtures('bazi', cases)
}

// ---------------------------------------------------------------------------
// 紫微
// ---------------------------------------------------------------------------

const PALACE_KEY_TO_NAME: Record<string, string> = {
  fumu: '父母',
  fude: '福德',
  tianzhai: '田宅',
  guanlu: '官禄',
  ming: '命宫',
  jiaoyou: '仆役',
  xiongdi: '兄弟',
  qianyi: '迁移',
  fuqi: '夫妻',
  zinv: '子女',
  caibo: '财帛',
  jie: '疾厄',
}

const BRANCH_ORDER = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']

async function calcZiweiTtqimen(birth: BirthInput): Promise<Record<string, unknown>> {
  const r = await buildZiweiChart(birth)

  const rawPalaces = r.palaces.map((p) => {
    const stem = p.ganzhi[0] ?? ''
    const branch = p.ganzhi[1] ?? ''
    const majorStars = p.stars
      .filter((s) => s.kind === 'main')
      .map((s) => s.name)
      .sort()
    const minorStars = p.stars
      .filter((s) => s.kind !== 'main')
      .map((s) => s.name)
      .sort()
    return {
      name: PALACE_KEY_TO_NAME[p.key] ?? p.key,
      heavenlyStem: stem,
      earthlyBranch: branch,
      majorStars,
      minorStars,
    }
  })

  const palaces = rawPalaces.sort(
    (a, b) => BRANCH_ORDER.indexOf(a.earthlyBranch) - BRANCH_ORDER.indexOf(b.earthlyBranch),
  )

  return {
    soul: r.meta.mingZhu ?? '',
    body: r.meta.shenZhu ?? '',
    fiveElementsClass: r.meta.fiveElementsClass ?? '',
    palaces,
  }
}

async function genZiwei(): Promise<void> {
  console.log('[ziwei] 生成 fixtures-ttqimen...')
  const cases = await loadInputs('ziwei')
  for (const c of cases) {
    try {
      c.expected = await calcZiweiTtqimen(asBirthInput(c))
      c.source = META.source
      c.exportedAt = META.exportedAt
    } catch (err) {
      c.expected = { __error__: (err as Error).message }
      c.source = META.source
      c.exportedAt = META.exportedAt
    }
  }
  await writeFixtures('ziwei', cases)
}

// ---------------------------------------------------------------------------
// 称骨
// ---------------------------------------------------------------------------

const HOUR_BRANCH_FROM_HOUR = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function clockToBranchName(hour: number): string {
  if (hour === 23 || hour === 0) return '子'
  return HOUR_BRANCH_FROM_HOUR[Math.floor((hour + 1) / 2) % 12]
}

function calcChengguTtqimen(birth: BirthInput): Record<string, unknown> {
  const r = calculateChenggu(birth)
  const labelMonth = r.breakdown.month.label.replace(/生$/, '')
  const labelDay = r.breakdown.day.label.replace(/日$/, '')

  const monthDayParse = parseLunarMonthDay(labelMonth + labelDay)

  return {
    yearGz: r.breakdown.year.label.replace(/年$/, ''),
    monthLunar: monthDayParse.month,
    dayLunar: monthDayParse.day,
    hourBranch: clockToBranchName(birth.hour),
    weights: {
      year: r.breakdown.year.weight,
      month: r.breakdown.month.weight,
      day: r.breakdown.day.weight,
      hour: r.breakdown.hour.weight,
    },
    totalWeight: r.totalWeight,
  }
}

async function genChenggu(): Promise<void> {
  console.log('[chenggu] 生成 fixtures-ttqimen...')
  const cases = await loadInputs('chenggu')
  for (const c of cases) {
    try {
      c.expected = calcChengguTtqimen(asBirthInput(c))
      c.source = META.source
      c.exportedAt = META.exportedAt
    } catch (err) {
      c.expected = { __error__: (err as Error).message }
      c.source = META.source
      c.exportedAt = META.exportedAt
    }
  }
  await writeFixtures('chenggu', cases)
}

// ---------------------------------------------------------------------------
// 黄历
// ---------------------------------------------------------------------------

interface HuangliInput {
  year: number
  month: number
  day: number
}

/**
 * 解析 tt-qimen 的 lunarMonthDay 字符串（如 "三月十四" / "十二月廿一" / "正月初一" / "十一月十三"）
 * → { month: 1..12, day: 1..30 }
 *
 * tt-qimen 的月名规律（来自 tyme4ts.LunarMonth.getName()）：
 *   - 正月、二月、...、十月、冬月（11月）、腊月（12月）  按"传统名称"
 *   - 但 tyme4ts 实测偶尔会输出 "十一月" / "十二月"（按数字）—— 都要兼容
 */
function parseLunarMonthDay(s: string): { month: number | null; day: number | null } {
  const CN_NUM_LOW: Record<string, number> = {
    一: 1, 二: 2, 三: 3, 四: 4, 五: 5,
    六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
  }
  const MONTH_NAME_TO_NUM: Record<string, number> = {
    正: 1, 冬: 11, 腊: 12,
  }

  const monthMatch =
    s.match(/^(闰)?(十一|十二)月/) ??
    s.match(/^(闰)?(正|二|三|四|五|六|七|八|九|十|冬|腊)月/)

  let month: number | null = null
  let monthEndIdx = 0
  if (monthMatch) {
    const monthChar = monthMatch[2]
    if (monthChar === '十一') month = 11
    else if (monthChar === '十二') month = 12
    else month = MONTH_NAME_TO_NUM[monthChar] ?? CN_NUM_LOW[monthChar] ?? null
    monthEndIdx = monthMatch[0].length
  }

  const dayPart = s.slice(monthEndIdx)
  let day: number | null = null
  if (dayPart === '三十') {
    day = 30
  } else if (dayPart === '二十') {
    day = 20
  } else if (dayPart.startsWith('初')) {
    const tail = dayPart.slice(1)
    if (tail === '十') day = 10
    else day = CN_NUM_LOW[tail] ?? null
  } else if (dayPart.startsWith('廿')) {
    const tail = dayPart.slice(1)
    if (!tail) day = 20
    else day = 20 + (CN_NUM_LOW[tail] ?? 0)
  } else if (dayPart.startsWith('十')) {
    const tail = dayPart.slice(1)
    if (!tail) day = 10
    else day = 10 + (CN_NUM_LOW[tail] ?? 0)
  }

  return { month, day }
}

function calcHuangliTtqimen(input: HuangliInput): Record<string, unknown> {
  const r = getHuangliDay(input.year, input.month, input.day)
  const lunar = parseLunarMonthDay(r.lunarMonthDay)

  // 农历年推断：当 input.month === 1 且农历仍在去年腊月 / 冬月时，lunarYear 应 = input.year - 1
  let lunarYear = input.year
  if (input.month === 1 && lunar.month != null && lunar.month >= 11) {
    lunarYear = input.year - 1
  }
  if (input.month === 12 && lunar.month != null && lunar.month === 1) {
    lunarYear = input.year + 1
  }

  return {
    solarDate: { y: input.year, m: input.month, d: input.day },
    lunarDate: { year: lunarYear, month: lunar.month, day: lunar.day },
    ganzhi: {
      year: r.pillarYear,
      month: r.pillarMonth,
      day: r.pillarDay,
    },
    term: r.term,
    constellation: r.constellation,
    duty: r.duty,
  }
}

async function genHuangli(): Promise<void> {
  console.log('[huangli] 生成 fixtures-ttqimen...')
  const cases = await loadInputs('huangli')
  for (const c of cases) {
    try {
      c.expected = calcHuangliTtqimen(c.input as unknown as HuangliInput)
      c.source = META.source
      c.exportedAt = META.exportedAt
    } catch (err) {
      c.expected = { __error__: (err as Error).message }
      c.source = META.source
      c.exportedAt = META.exportedAt
    }
  }
  await writeFixtures('huangli', cases)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('=== 生成 fixtures-ttqimen（路径 A：tt-qimen 包装层）===')
  console.log(`输入：${INPUTS_DIR}`)
  console.log(`输出：${OUT_DIR}`)
  console.log('')

  const tasks = [genBazi, genZiwei, genChenggu, genHuangli]
  const errors: string[] = []
  for (const task of tasks) {
    try {
      await task()
    } catch (err) {
      const name = task.name
      console.error(`  ✗ ${name} 失败: ${(err as Error).message}`)
      errors.push(`${name}: ${(err as Error).message}`)
    }
  }

  console.log('')
  if (errors.length > 0) {
    console.log(`⚠ 完成（含 ${errors.length} 个模块失败）：`)
    errors.forEach((e) => console.log(`  - ${e}`))
    process.exit(1)
  } else {
    console.log('✓ 全部 4 个模块（bazi/ziwei/chenggu/huangli）生成完毕。')
  }
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
