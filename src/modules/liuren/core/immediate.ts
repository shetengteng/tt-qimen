/**
 * 即时起卦工具：公历 Date → { 农历月, 农历日, 时辰序号, 汉字展示 }
 *
 * 设计思路：
 *   - tyme4ts.SolarTime.fromYmdHms 把公历时间转换为 SolarTime
 *   - .getLunarHour().getLunarDay() 拿到农历 LunarDay（与 chenggu 同一口径）
 *   - 时辰序号直接走 (hour+1)/2 规则，兼容跨日子时
 *
 * 返回值可直接传给 calculateLiuren。
 */

import { SolarTime } from 'tyme4ts'
import { clockHourToBranchIndex, HOUR_BRANCH_NAMES, type HourBranch } from './liuren'

/** 把"日"渲染为中文：初一/十五/廿一/三十 —— 与 chenggu/core 同一版本 */
function formatLunarDay(d: number): string {
  if (d <= 10) return `初${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][d - 1]}`
  if (d === 20) return '二十'
  if (d === 30) return '三十'
  if (d < 20) return `十${['一', '二', '三', '四', '五', '六', '七', '八', '九'][d - 11]}`
  return `廿${['一', '二', '三', '四', '五', '六', '七', '八', '九'][d - 21]}`
}

const MONTH_CN_NAMES = [
  '正月', '二月', '三月', '四月',
  '五月', '六月', '七月', '八月',
  '九月', '十月', '冬月', '腊月',
] as const

function formatLunarMonth(m: number, leap: boolean): string {
  const name = MONTH_CN_NAMES[m - 1] ?? `${m}月`
  return leap ? `闰${name}` : name
}

export interface ImmediateSeed {
  month: number
  day: number
  hour: number
  lunarDateLabel: string
  hourBranchLabel: string
}

export function seedFromDate(date: Date = new Date()): ImmediateSeed {
  const solar = SolarTime.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  )
  const lunarHour = solar.getLunarHour()
  const lunarDay = lunarHour.getLunarDay()
  const lunarMonth = lunarDay.getLunarMonth()

  const month = lunarMonth.getMonth()
  const day = lunarDay.getDay()
  const hourIndex1Based = clockHourToBranchIndex(date.getHours())

  const branchName: HourBranch = HOUR_BRANCH_NAMES[hourIndex1Based - 1]

  return {
    month,
    day,
    hour: hourIndex1Based,
    lunarDateLabel: `${formatLunarMonth(month, lunarMonth.isLeap())}${formatLunarDay(day)}`,
    hourBranchLabel: `${branchName}时`,
  }
}

/** 自定输入（month/day/hourIndex）的展示字符串（农历汉字） */
export function formatCustomLabel(month: number, day: number, hourIndex: number): {
  lunarDateLabel: string
  hourBranchLabel: string
} {
  const branchName: HourBranch = HOUR_BRANCH_NAMES[hourIndex - 1]
  return {
    lunarDateLabel: `${formatLunarMonth(month, false)}${formatLunarDay(day)}`,
    hourBranchLabel: `${branchName}时`,
  }
}
