/**
 * 黄历择日 · 核心算法
 *
 * 所有数据来自 `tyme4ts`，零额外请求。
 *
 * 公开 API：
 *   - `getHuangliDay(y,m,d)`     单日完整数据（今日卡 / 详情卡）
 *   - `getHuangliMonth(y,m)`     月历 42 格数据（6×7 含跨月）
 *   - `findGoodDaysByMatter(...)` 按事由筛出"宜"的日子
 */

import { SolarDay } from 'tyme4ts'
import type {
  Ecliptic,
  HourStar,
  HuangliDay,
  HuangliMatterKey,
  HuangliMonth,
  HuangliMonthDay,
  TwelveDuty,
} from '../types'
import { judgeMatter } from '../data/matterKeywords'

const WEEKDAY_ZH = ['日', '一', '二', '三', '四', '五', '六'] as const

/**
 * 日干 → 冲日天干（"克我者同阴阳"）。
 * 例：丙（阳火）冲壬（阳水，水克火）。
 */
const STEM_CHONG: Record<string, string> = {
  甲: '庚', 乙: '辛',
  丙: '壬', 丁: '癸',
  戊: '甲', 己: '乙',
  庚: '丙', 辛: '丁',
  壬: '戊', 癸: '己',
}

/**
 * 把 `tyme4ts` 的 tags/avoids 数组转为 string[]。
 * tyme4ts 的 getRecommends/getAvoids 返回 `Taboo[]`，用 `.getName()` 取名。
 */
function namesOf<T extends { getName: () => string }>(list: T[]): string[] {
  return list.map((x) => x.getName())
}

// ---------------------------------------------------------------------------
// 单日
// ---------------------------------------------------------------------------

/**
 * 单日黄历数据。越界或非法日期抛异常（调用方处理）。
 */
export function getHuangliDay(year: number, month: number, day: number): HuangliDay {
  const sd = SolarDay.fromYmd(year, month, day)
  const scd = sd.getSixtyCycleDay()
  const cycle = scd.getSixtyCycle()
  const stem = cycle.getHeavenStem()
  const branch = cycle.getEarthBranch()
  const ld = sd.getLunarDay()

  const twelveStar = scd.getTwelveStar()
  const ecliptic = twelveStar.getEcliptic().getName() as Ecliptic

  const recommends = namesOf(scd.getRecommends())
  const avoids = namesOf(scd.getAvoids())

  // 吉神 / 凶神：tyme4ts.getGods() 每项有 getLuck() 区分吉/凶。
  // Luck index 0=吉(Auspicious) 1=凶(Inauspicious)（1.4.6 兼容两种判法：名字含"吉"或 luck 为 0）
  const gods: string[] = []
  const fiends: string[] = []
  for (const g of scd.getGods()) {
    const name = g.getName()
    const luck = g.getLuck()
    // `Luck.getName()` 返回 "吉" 或 "凶"
    const luckName = luck.getName?.() ?? ''
    if (luckName === '吉') gods.push(name)
    else fiends.push(name)
  }

  const opposite = branch.getOpposite()
  const chongStem = STEM_CHONG[stem.getName()] ?? stem.getName()
  const chong = {
    zodiac: opposite.getZodiac().getName(),
    ganzhi: `${chongStem}${opposite.getName()}`,
  }

  const hours: HourStar[] = scd.getHours().map((h) => {
    const ts = h.getTwelveStar()
    return {
      name: h.getName(),
      ganzhi: h.getSixtyCycle().getName(),
      star: ts.getName(),
      ecliptic: ts.getEcliptic().getName() as Ecliptic,
    }
  })
  const luckyHours = hours.filter((h) => h.ecliptic === '黄道')

  const weekdayIndex = sd.getWeek().getIndex()
  const solarFestival = sd.getFestival()
  const lunarFestival = ld.getFestival()

  const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return {
    year,
    month,
    day,
    dateIso: isoDate,
    weekday: WEEKDAY_ZH[weekdayIndex] ?? '',
    weekdayIndex,
    lunarYearGanzhi: ld.getYearSixtyCycle().getName(),
    zodiac: ld.getYearSixtyCycle().getEarthBranch().getZodiac().getName(),
    lunarMonthDay: `${ld.getLunarMonth().getName()}${ld.getName()}`,
    pillarYear: ld.getYearSixtyCycle().getName(),
    pillarMonth: ld.getMonthSixtyCycle().getName(),
    pillarDay: cycle.getName(),
    duty: scd.getDuty().getName() as TwelveDuty,
    twelveStar: twelveStar.getName(),
    ecliptic,
    recommends,
    avoids,
    gods,
    fiends,
    chong,
    shaDirection: branch.getOminous().getName(),
    fetus: scd.getFetusDay().getName(),
    pengzuGan: stem.getPengZuHeavenStem().getName(),
    pengzuZhi: branch.getPengZuEarthBranch().getName(),
    joyDirection: stem.getJoyDirection().getName(),
    wealthDirection: stem.getWealthDirection().getName(),
    fuDirection: stem.getMascotDirection().getName(),
    yangGuiDirection: stem.getYangDirection().getName(),
    yinGuiDirection: stem.getYinDirection().getName(),
    term: sd.getTerm().getName(),
    solarFestival: solarFestival ? solarFestival.getName() : null,
    lunarFestival: lunarFestival ? lunarFestival.getName() : null,
    constellation: sd.getConstellation().getName(),
    hours,
    luckyHours,
  }
}

// ---------------------------------------------------------------------------
// 月历（42 格，6×7）
// ---------------------------------------------------------------------------

/**
 * 某月第 1 天。
 */
function firstDayOfMonth(year: number, month: number): SolarDay {
  return SolarDay.fromYmd(year, month, 1)
}

/**
 * 当月天数（通过 `SolarMonth.getDayCount()` 更稳，但 SolarMonth 需 index；这里用 Date）。
 */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 把 SolarDay 转为 MonthDay 卡片数据。
 */
function toMonthDay(
  sd: SolarDay,
  y: number,
  m: number,
  d: number,
  inMonth: boolean,
  todayIso: string,
): HuangliMonthDay {
  const scd = sd.getSixtyCycleDay()
  const ld = sd.getLunarDay()
  const twelveStar = scd.getTwelveStar()
  const ecliptic = twelveStar.getEcliptic().getName() as Ecliptic
  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  // 显示优先级：节气交接当天 > 农历初一（显示月名）> 普通农历日名
  let lunarShort = ld.getName()
  const termDay = sd.getTermDay()
  if (termDay && termDay.getDayIndex() === 0) {
    lunarShort = termDay.getName()
  } else if (ld.getName() === '初一') {
    lunarShort = ld.getLunarMonth().getName()
  }

  return {
    day: d,
    year: y,
    month: m,
    lunarShort,
    isToday: iso === todayIso,
    inMonth,
    ecliptic,
    recommends: namesOf(scd.getRecommends()),
    avoids: namesOf(scd.getAvoids()),
  }
}

/**
 * 生成 42 格（6×7）月历，起始于"本月 1 日所在周的周日"。
 * 约定：周日为一周开始（与原型 HTML 一致）。
 */
export function getHuangliMonth(year: number, month: number): HuangliMonth {
  const first = firstDayOfMonth(year, month)
  // 本月 1 号对应的星期（0=周日）
  const firstWeek = first.getWeek().getIndex()
  const total = daysInMonth(year, month)

  // 网格第一格对应的日期偏移（相对于本月 1 号，负数表示上月）
  const startOffset = -firstWeek

  const todayJs = new Date()
  const todayIso = `${todayJs.getFullYear()}-${String(todayJs.getMonth() + 1).padStart(2, '0')}-${String(todayJs.getDate()).padStart(2, '0')}`

  const days: HuangliMonthDay[] = []
  for (let i = 0; i < 42; i++) {
    const offsetFromFirst = startOffset + i
    const dayNumber = 1 + offsetFromFirst
    const inMonth = dayNumber >= 1 && dayNumber <= total
    let y = year
    let m = month
    let d = dayNumber
    if (!inMonth) {
      if (dayNumber < 1) {
        if (month === 1) { y = year - 1; m = 12 }
        else { m = month - 1 }
        const prevLast = daysInMonth(y, m)
        d = prevLast + dayNumber
      } else {
        if (month === 12) { y = year + 1; m = 1 }
        else { m = month + 1 }
        d = dayNumber - total
      }
    }
    const sd = SolarDay.fromYmd(y, m, d)
    days.push(toMonthDay(sd, y, m, d, inMonth, todayIso))
  }

  return { year, month, days }
}

// ---------------------------------------------------------------------------
// 按事由扫月
// ---------------------------------------------------------------------------

/**
 * 在月历中筛出指定事由为"宜"的日期序号集合（仅限本月内）。
 */
export function findGoodDaysByMatter(
  month: HuangliMonth,
  matter: HuangliMatterKey,
): number[] {
  const good: number[] = []
  for (const d of month.days) {
    if (!d.inMonth) continue
    const verdict = judgeMatter(matter, d.recommends, d.avoids)
    if (verdict === 'yi') good.push(d.day)
  }
  return good
}

/**
 * 在月历中筛出指定事由为"忌"的日期序号集合（仅限本月内），用于红点提示。
 */
export function findBadDaysByMatter(
  month: HuangliMonth,
  matter: HuangliMatterKey,
): number[] {
  const bad: number[] = []
  for (const d of month.days) {
    if (!d.inMonth) continue
    const verdict = judgeMatter(matter, d.recommends, d.avoids)
    if (verdict === 'ji') bad.push(d.day)
  }
  return bad
}
