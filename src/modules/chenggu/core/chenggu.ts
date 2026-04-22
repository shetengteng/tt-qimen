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
 * 异常：
 *   - 查表缺失 → 抛 Error（已通过 51 段 + 60 甲子覆盖所有合法取值，理论不会触发）
 *   - 骨重总和越界（<2.1 或 >7.1）→ 抛 Error 由 UI 层显示排盘失败
 */

import { SolarTime, LunarHour } from 'tyme4ts'
import type { BirthInput } from '@/stores/user'
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
import { findPoem, formatWeight } from '../data/poems'

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

/** 主函数：生辰 → 称骨结果 */
export function calculateChenggu(birth: BirthInput): ChengguResult {
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
    throw new Error(
      `[chenggu] weight table miss: year=${yearGanzhi} month=${monthNum} day=${dayNum} hour=${hourIndex}`,
    )
  }

  const total = round1(y + m + d + h)

  if (total < WEIGHT_MIN - 0.01 || total > WEIGHT_MAX + 0.01) {
    throw new Error(`[chenggu] total weight ${total} out of range [${WEIGHT_MIN}, ${WEIGHT_MAX}]`)
  }

  const poem = findPoem(total)
  if (!poem) {
    throw new Error(`[chenggu] no poem matched for weight ${total}`)
  }

  return {
    totalWeight: total,
    displayWeight: formatWeight(total),
    breakdown: {
      year: { label: `${yearGanzhi}年`, weight: y },
      month: {
        label: `${formatLunarMonth(monthNum, lunarMonth.isLeap())}生`,
        weight: m,
      },
      day: { label: `${formatLunarDay(dayNum)}日`, weight: d },
      hour: {
        label: `${HOUR_BRANCH_NAMES[hourIndex]}时生`,
        weight: h,
      },
    },
    poem,
  }
}
