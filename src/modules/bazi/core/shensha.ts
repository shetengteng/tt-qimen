/**
 * 神煞识别模块（Phase 5：Lunisolar 实装）
 *
 * 输入：BirthInput（公历/农历）+ 性别
 * 输出：ShenshaHit[]（吉/中/凶，按柱位归档，已做繁→简转换 + 简短释义填充）
 *
 * 实现策略：
 *  1. 用户输入先走 tyme4ts 的转换（沿用现有链路把农历 → 公历），
 *     与 bazi.ts 保持一致（避免两个库的节气定义偏差导致四柱不一致）。
 *  2. 把公历时间喂给 lunisolar.char8ex(sex)，拿 C8God 列表。
 *  3. 按 luckLevel 映射到 ShenshaCategory：
 *       1  → auspicious
 *       0  → neutral
 *       -1 → inauspicious
 *  4. C8God.key 为繁体（如 "天乙貴人"），用 `chinese-conv.sify` 转简体作为 name，
 *     同时以 key 原样查 SHENSHA_MEANING 表拿 short 释义。
 *
 * 幂等缓存：lunisolar 实例本身不缓存在模块级，交给各次调用即可（算力极低）。
 */

import lunisolar from 'lunisolar'
import { char8ex } from '@lunisolar/plugin-char8ex'
import { sify } from 'chinese-conv'
import { SolarTime, LunarHour } from 'tyme4ts'

import type { BaziChart, ShenshaCategory, ShenshaHit } from '../types'
import { getShenshaMeaning } from '../data/shenshaMeaning'
import type { BirthInput } from '@/stores/user'

type PillarsArg = BaziChart['pillars']

// 全局仅注册一次 plugin。extend 幂等，重复调用 no-op。
let pluginRegistered = false
function ensurePlugin() {
  if (pluginRegistered) return
  lunisolar.extend(char8ex)
  pluginRegistered = true
}

/**
 * 把 BirthInput 转成 lunisolar 可以消费的公历字符串（YYYY-MM-DD HH:mm）。
 * 走 tyme4ts 做农历换算，与 bazi.ts 的主链路一致。
 */
function toSolarDateString(birth: BirthInput): string {
  let solar: SolarTime
  if (birth.calendar === 'solar') {
    solar = SolarTime.fromYmdHms(birth.year, birth.month, birth.day, birth.hour, birth.minute, 0)
  } else {
    const lunar = LunarHour.fromYmdHms(birth.year, birth.month, birth.day, birth.hour, birth.minute, 0)
    solar = lunar.getSolarTime()
  }
  const d = solar.getSolarDay()
  const y = d.getYear()
  const m = d.getMonth()
  const day = d.getDay()
  const hh = String(birth.hour).padStart(2, '0')
  const mm = String(birth.minute).padStart(2, '0')
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')} ${hh}:${mm}`
}

/**
 * 主入口：根据 BirthInput 识别四柱神煞。
 * 失败（例如 plugin 异常）时返回空数组，不抛错 — 保证主链路不会因神煞失败而白屏。
 */
export function detectShensha(birth: BirthInput | null): ShenshaHit[]
export function detectShensha(_pillars: PillarsArg): ShenshaHit[]
export function detectShensha(arg: BirthInput | PillarsArg | null): ShenshaHit[] {
  // 保持向后兼容：老签名传 pillars 时不可算，返回空
  if (!arg || !isBirth(arg)) return []
  const birth = arg

  try {
    ensurePlugin()
    const dateStr = toSolarDateString(birth)
    const sexValue: 0 | 1 = birth.gender === 'male' ? 1 : 0
    const c8ex = lunisolar(dateStr).char8ex(sexValue)

    const pillarsMap: Array<['year' | 'month' | 'day' | 'hour', C8GodLike[]]> = [
      ['year',  c8ex.year.gods  as C8GodLike[]],
      ['month', c8ex.month.gods as C8GodLike[]],
      ['day',   c8ex.day.gods   as C8GodLike[]],
      ['hour',  c8ex.hour.gods  as C8GodLike[]],
    ]

    const hits: ShenshaHit[] = []
    for (const [pillar, gods] of pillarsMap) {
      for (const g of gods) {
        const key = g.key
        const category = mapLuckLevel(g.luckLevel)
        const name = sify(key) || key
        const short = getShenshaMeaning(key).short
        hits.push({ name, key, pillar, category, short })
      }
    }
    return sortHits(hits)
  } catch (err) {
    console.error('[shensha] detect failed:', err)
    return []
  }
}

interface C8GodLike {
  key: string
  name: string
  luckLevel: number
}

function isBirth(v: unknown): v is BirthInput {
  return !!v && typeof v === 'object' && 'year' in v && 'calendar' in v && 'gender' in v
}

function mapLuckLevel(level: number): ShenshaCategory {
  if (level > 0) return 'auspicious'
  if (level < 0) return 'inauspicious'
  return 'neutral'
}

/** 吉→中→凶；同类内按柱位（年→月→日→时）稳定排序 */
function sortHits(hits: ShenshaHit[]): ShenshaHit[] {
  const catOrder: Record<ShenshaCategory, number> = {
    auspicious:   0,
    neutral:      1,
    inauspicious: 2,
  }
  const pillarOrder: Record<ShenshaHit['pillar'], number> = {
    year: 0, month: 1, day: 2, hour: 3,
  }
  return [...hits].sort((a, b) => {
    if (a.category !== b.category) return catOrder[a.category] - catOrder[b.category]
    return pillarOrder[a.pillar] - pillarOrder[b.pillar]
  })
}
