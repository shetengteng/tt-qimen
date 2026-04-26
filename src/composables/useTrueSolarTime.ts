/**
 * useTrueSolarTime — 把生辰输入按真太阳时修正
 *
 * 当前用途：
 *   纯工具 composable，**未被任何 core 模块消费**。提供给后续 V2 排盘接入：
 *     - 模块 page 在调 `calculateBazi(birth)` 之前，可改为
 *       `calculateBazi(useTrueSolarTime(birth))`
 *     - BirthForm 可暴露经度输入或城市选择，供本 composable 读取
 *
 * 行为：
 *   - 若 `birth.longitude` 缺省 → 直接返回原 birth（noop，向后兼容）
 *   - 若 `birth.longitude` 有效 → 修正 hour / minute，必要时把日期向前/后挪一天
 *
 * 设计取舍：
 *   纯函数实现（无 reactive）。如需响应式，调用方包一层 `computed(() => useTrueSolarTime(birth))`
 *   即可。把响应式注入推迟到使用现场，避免本工具依赖 store / pinia。
 */
import {
  applyTrueSolarTime,
  STANDARD_MERIDIAN_BEIJING,
} from '@/lib/trueSolarTime'
import type { BirthInput } from '@/stores/user'

/**
 * 把 BirthInput 修正为真太阳时。
 *
 * @param birth 原始生辰（来自 store / 表单）
 * @param opts.standardMeridian 标准子午线（默认 120°E，即北京时间）。
 *        境外出生者若在不同区时（如美东 -75°E），需要传入对应值。
 *        本字段属于"算法参数"，不写进 BirthInput store（避免污染数据结构）。
 * @returns 修正后的 BirthInput。原始输入未被改动（不可变）。
 */
export function useTrueSolarTime(
  birth: BirthInput,
  opts: { standardMeridian?: number } = {},
): BirthInput {
  if (typeof birth.longitude !== 'number' || !Number.isFinite(birth.longitude)) {
    return birth
  }

  const standardMeridian = opts.standardMeridian ?? STANDARD_MERIDIAN_BEIJING

  const { hour, minute, dayShift } = applyTrueSolarTime(
    birth.year,
    birth.month,
    birth.day,
    birth.hour,
    birth.minute,
    birth.longitude,
    standardMeridian,
  )

  if (dayShift === 0 && hour === birth.hour && minute === birth.minute) {
    return birth
  }

  if (dayShift === 0) {
    return { ...birth, hour, minute }
  }

  const shifted = shiftDay(birth.year, birth.month, birth.day, dayShift)
  return { ...birth, year: shifted.year, month: shifted.month, day: shifted.day, hour, minute }
}

/**
 * 公历日期加 / 减天数。
 *
 * 不引入第三方日期库（避免给前端 bundle 增加负担）；用原生 Date 在 UTC
 * 时区下计算，避免 DST 跨越的歧义。
 */
function shiftDay(year: number, month: number, day: number, delta: number): { year: number; month: number; day: number } {
  const d = new Date(Date.UTC(year, month - 1, day))
  d.setUTCDate(d.getUTCDate() + delta)
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}
