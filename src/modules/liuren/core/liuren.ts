/**
 * 小六壬主算法
 *
 * 三步累加：
 *   起点 = 大安（index 0）
 *   1. (pos + month - 1) % 6 → P1
 *   2. (P1 + day   - 1) % 6 → P2
 *   3. (P2 + hour  - 1) % 6 → P3
 *
 * 说明：
 *   - month/day/hour 均为 1-based
 *   - path 数组记录三步落点（不含"起点大安"）
 *
 * 时辰序号：
 *   子时(23-1)=1, 丑时(1-3)=2, ..., 亥时(21-23)=12
 *   跨日子时：23:00-01:00 归入同一个"子时"
 */

import type { Aspect, LiurenResult, PalaceName } from '../types'
import { PALACES_ORDER } from '../data/palaces'
import { getLocalizedPalace, type LiurenLocale } from '../data/palacesLocale'
import { FortuneError } from '@/lib/errors'

export interface CalculateInput {
  /** 农历月 1-12 */
  month: number
  /** 农历日 1-30 */
  day: number
  /** 时辰序号 1-12（子=1, 亥=12） */
  hour: number
  /** UI 展示用：该天农历汉字，如"三月初二" */
  lunarDateLabel: string
  /** UI 展示用：时辰汉字，如"午时" */
  hourBranchLabel: string
  /** 问事分面 */
  aspect: Aspect
  /** 问事心念（可选） */
  question?: string
}

function assertIntInRange(v: number, min: number, max: number, name: string): void {
  if (!Number.isInteger(v) || v < min || v > max) {
    throw new FortuneError({
      module: 'liuren',
      code: 'invalid-input',
      message: `[liuren] ${name} must be integer in [${min}, ${max}], got ${v}`,
      details: { field: name, min, max, raw: v },
    })
  }
}

export function calculateLiuren(
  input: CalculateInput,
  locale: LiurenLocale = 'zh-CN',
): LiurenResult {
  assertIntInRange(input.month, 1, 12, 'month')
  assertIntInRange(input.day, 1, 30, 'day')
  assertIntInRange(input.hour, 1, 12, 'hour')

  let pos = 0
  const path: PalaceName[] = []

  pos = (pos + input.month - 1) % 6
  path.push(PALACES_ORDER[pos])

  pos = (pos + input.day - 1) % 6
  path.push(PALACES_ORDER[pos])

  pos = (pos + input.hour - 1) % 6
  path.push(PALACES_ORDER[pos])

  const finalName = PALACES_ORDER[pos]
  const palace = getLocalizedPalace(finalName, locale)

  return {
    palace,
    steps: {
      month: input.month,
      day: input.day,
      hour: input.hour,
    },
    path,
    aspect: input.aspect,
    question: input.question,
    lunarDateLabel: input.lunarDateLabel,
    hourBranchLabel: input.hourBranchLabel,
  }
}

/** 时辰汉字 → 时辰序号（1..12） */
export const HOUR_BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
export type HourBranch = typeof HOUR_BRANCH_NAMES[number]

/** 小时 → 时辰序号（1-based，子时跨 23:00/0:00） */
export function clockHourToBranchIndex(clockHour: number): number {
  if (clockHour === 23 || clockHour === 0) return 1
  return (Math.floor((clockHour + 1) / 2) % 12) + 1
}
