/**
 * lunisolar 辅助工具（仅供八字模块的"神煞"子模块使用）
 *
 * 职责：把 BirthInput（公历/农历）统一归一为 char8ex 实例（带十神/神煞/纳音）。
 *
 * 注意：八字主算法（四柱/十神/藏干/纳音/流年/起运/大运）继续用 tyme4ts。
 *      本模块仅服务 `core/shensha.ts`，不被 `core/bazi.ts` 引用。
 */

import lunisolar from 'lunisolar'
import { char8ex, type Char8Ex } from '@lunisolar/plugin-char8ex'

import type { BirthInput } from '@/stores/user'

let pluginRegistered = false
function ensurePlugin(): void {
  if (pluginRegistered) return
  lunisolar.extend(char8ex)
  pluginRegistered = true
}

/**
 * 24 时制 → 地支索引 0-11。
 * 子时跨日：23:00-01:00 都属于子（索引 0），与 tyme4ts 默认规则一致。
 */
function hourToBranchIndex(hour: number): number {
  if (hour === 23) return 0
  return Math.floor((hour + 1) / 2) % 12
}

/**
 * 把 BirthInput 转成已加载 char8ex 插件的 Lunisolar 实例。
 *
 * - 公历：直接构造 lunisolar('YYYY-MM-DD HH:mm:ss')
 * - 农历：lunisolar.fromLunar({year, month, day, hour: branchIndex})；
 *   注意 lunisolar 的 lunar.hour 是地支索引而非 24 时制。
 */
function birthToLunisolar(birth: BirthInput): ReturnType<typeof lunisolar> {
  ensurePlugin()
  if (birth.calendar === 'solar') {
    const yy = birth.year
    const mm = String(birth.month).padStart(2, '0')
    const dd = String(birth.day).padStart(2, '0')
    const hh = String(birth.hour).padStart(2, '0')
    const mi = String(birth.minute).padStart(2, '0')
    return lunisolar(`${yy}-${mm}-${dd} ${hh}:${mi}:00`)
  }
  const branchIdx = hourToBranchIndex(birth.hour)
  const lsr = lunisolar.fromLunar({
    year: birth.year,
    month: birth.month,
    day: birth.day,
    hour: branchIdx,
  })
  return birth.minute > 0 ? lsr.add(birth.minute, 'minute') : lsr
}

/** 取得 char8ex 实例（带十神 + 神煞 + 纳音） */
export function birthToChar8Ex(birth: BirthInput): Char8Ex {
  const lsr = birthToLunisolar(birth)
  const sexValue: 0 | 1 = birth.gender === 'male' ? 1 : 0
  return lsr.char8ex(sexValue)
}
