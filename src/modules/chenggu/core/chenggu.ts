/**
 * 称骨算命主算法
 *
 * 输入：BirthInput（公历或农历的年/月/日/时分 + 性别）
 * 输出：ChengguResult（四项骨重 + 总骨重 + 歌诀 + 白话解读）
 *
 * 流程：
 *   1. 公历 → SolarTime（农历直接走 LunarHour 转 SolarTime，保持跨立春的年柱一致）
 *   2. 年柱：solar.getLunarHour().getEightChar().getYear() —— 用立春切换的八字年柱
 *      这与 bazi 模块保持一致，避免两套口径冲突（如腊月末立春日，bazi 已进入下一年，称骨也跟随）
 *   3. 农历月/日：lunarHour.getLunarDay() → .getLunarMonth() / .getDay()
 *      月份按数值（1..12）；闰月按主月份查表（不再额外加权）
 *   4. 时辰：按出生时辰的地支 index（子=0 ... 亥=11）查 HOUR_WEIGHT
 *   5. 总骨重 = 四者相加；浮点取整避免 0.6 + 0.9 + 1.6 + 1.0 = 4.0999… 的抖动
 *   6. 歌诀匹配：Math.abs(a - b) < 0.01（设计文档 §8 风险已述）
 *
 * 异常（统一 FortuneError，module: 'chenggu'）：
 *   - 查表缺失 → code: 'invariant'（已通过 51 段 + 60 甲子覆盖所有合法取值，理论不会触发）
 *   - 骨重总和越界（<2.1 或 >7.1）→ code: 'out-of-range'，由 UI 层显示排盘失败
 *   - 歌诀未匹配 → code: 'invariant'（同上理论不该发生，是兜底防御）
 *
 * i18n（locale 参数，默认 'zh-CN'）：
 *   - zh-TW：歌诀 / 白话解读 / displayWeight / breakdown labels 全部走 chinese-conv.tify 转繁体（沿用 liuren palacesLocale 模式）
 *   - en   ：古文不译，与 zh-CN 同步原中文（用户口径：歌诀文化属性强，禁止意译）
 *   - 仅文本字段受影响；数值 / level / weightNumber 等数据本体不变
 */

import { SolarTime, LunarHour } from 'tyme4ts'
import { tify } from 'chinese-conv'
import type { BirthInput } from '@/stores/user'
import { FortuneError } from '@/lib/errors'
import type { ChengguResult } from '../types'
import {
  YEAR_WEIGHT,
  MONTH_WEIGHT,
  DAY_WEIGHT,
  HOUR_WEIGHT,
  HOUR_BRANCH_NAMES,
  WEIGHT_MIN,
  WEIGHT_MAX,
} from '../data/weights'
import { formatWeight } from '../data/poems'
import { getLocalizedPoem, type ChengguLocale } from '../data/poemsLocale'

/** 把 BirthInput 统一映射到 SolarTime —— 与 bazi 模块同一思路 */
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

/** 四舍五入到 1 位小数（避免 0.6+0.9+1.6+1.0 = 4.0999… 的精度抖动） */
function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** 小时 → 地支 index（0=子, 1=丑, ...）
 *  子时跨 23:00 / 0:00，两端都归入 index 0；其余按 (hour+1)/2 切分。
 */
function hourToBranchIndex(hour: number): number {
  if (hour === 23 || hour === 0) return 0
  return Math.floor((hour + 1) / 2) % 12
}

/** 把"月份"渲染为中文："正月"/"二月"..."腊月" 用于 UI 展示 */
const MONTH_CN_NAMES = [
  '正月', '二月', '三月', '四月',
  '五月', '六月', '七月', '八月',
  '九月', '十月', '冬月', '腊月',
] as const

function formatLunarMonth(m: number, leap: boolean): string {
  const name = MONTH_CN_NAMES[m - 1] ?? `${m}月`
  return leap ? `闰${name}` : name
}

/** 把"日"渲染为中文："初一"/"十五"/"廿一"/"三十" 等 */
function formatLunarDay(d: number): string {
  if (d <= 10) return `初${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][d - 1]}`
  if (d === 20) return '二十'
  if (d === 30) return '三十'
  if (d < 20) return `十${['一', '二', '三', '四', '五', '六', '七', '八', '九'][d - 11]}`
  // 21..29
  return `廿${['一', '二', '三', '四', '五', '六', '七', '八', '九'][d - 21]}`
}

/**
 * 主函数：生辰 → 称骨结果
 *
 * locale 参数仅影响 result 内的文本字段：
 *   - displayWeight / breakdown.{year,month,day,hour}.label / poem.{weight,poem,description}
 *   - zh-TW：通过 tify 把简体转繁体（与 liuren palacesLocale 同款方案）
 *   - zh-CN / en：保持原中文（古文不译；用户口径）
 *
 * 数值 / 等级 / 内部 enum 不受 locale 影响。
 */
export function calculateChenggu(
  birth: BirthInput,
  locale: ChengguLocale = 'zh-CN',
): ChengguResult {
  const solar = toSolarTime(birth)
  const lunarHour = solar.getLunarHour()
  const eightChar = lunarHour.getEightChar()
  const lunarDay = lunarHour.getLunarDay()
  const lunarMonth = lunarDay.getLunarMonth()

  const yearGanzhi = eightChar.getYear().getName()
  const monthNum = lunarMonth.getMonth()
  const dayNum = lunarDay.getDay()
  const hourIndex = hourToBranchIndex(birth.hour)

  const y = YEAR_WEIGHT[yearGanzhi]
  const m = MONTH_WEIGHT[monthNum]
  const d = DAY_WEIGHT[dayNum]
  const h = HOUR_WEIGHT[hourIndex]

  if (y === undefined || m === undefined || d === undefined || h === undefined) {
    throw new FortuneError({
      module: 'chenggu',
      code: 'invariant',
      message: `[chenggu] weight table miss: year=${yearGanzhi} month=${monthNum} day=${dayNum} hour=${hourIndex}`,
      details: { yearGanzhi, monthNum, dayNum, hourIndex, hasY: y !== undefined, hasM: m !== undefined, hasD: d !== undefined, hasH: h !== undefined },
    })
  }

  const total = round1(y + m + d + h)

  if (total < WEIGHT_MIN - 0.01 || total > WEIGHT_MAX + 0.01) {
    throw new FortuneError({
      module: 'chenggu',
      code: 'out-of-range',
      message: `[chenggu] total weight ${total} out of range [${WEIGHT_MIN}, ${WEIGHT_MAX}]`,
      details: { total, min: WEIGHT_MIN, max: WEIGHT_MAX, breakdown: { y, m, d, h } },
    })
  }

  const poem = getLocalizedPoem(total, locale)
  if (!poem) {
    throw new FortuneError({
      module: 'chenggu',
      code: 'invariant',
      message: `[chenggu] no poem matched for weight ${total}`,
      details: { total, breakdown: { y, m, d, h } },
    })
  }

  const tx = (s: string) => (locale === 'zh-TW' ? tify(s) : s)

  return {
    totalWeight: total,
    displayWeight: tx(formatWeight(total)),
    breakdown: {
      year: { label: tx(`${yearGanzhi}年`), weight: y },
      month: { label: tx(`${formatLunarMonth(monthNum, lunarMonth.isLeap())}生`), weight: m },
      day: { label: tx(`${formatLunarDay(dayNum)}日`), weight: d },
      hour: { label: tx(`${HOUR_BRANCH_NAMES[hourIndex]}时生`), weight: h },
    },
    poem,
  }
}
