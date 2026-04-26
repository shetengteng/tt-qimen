/**
 * 三才配置（天/人/地五行）+ 5 等级判定
 *
 * 流派：熊崎健翁通行版（《五格剖象姓名学》/《大日本姓名学全集》普及口径）
 * 来源：B 类公版（业界一致） + C 类编辑整理（一句话定性现代化）
 * isClassical: false — 现代化文案，不做古籍逐条溯源
 *
 * 算法：
 *   1) 三才取自 grids.tian/ren/di 的 entry.element（5 行 × 5 行 × 5 行 = 125 种）
 *   2) 相邻关系：天→人 + 人→地，按生/克/比和判定
 *   3) 等级（5 档；与 81 数理 6 档刻意区分）：
 *      - 大吉：相邻全生 OR 三者比和（同行）
 *      - 吉：  两生 / 一生一比和（不含克）
 *      - 中吉：仅有比和无生无克 / 一生 + 一比和
 *      - 凶：  恰好一组克
 *      - 大凶：两组克 / 三者层层相克链
 *
 * 实施：
 *   - 用算法判定关系 + 等级
 *   - 提供 `getSancaiVerdict(grids)` O(算法) 直接出结果，不必预存 125 项常量表
 *     （5×5×5 = 125，全靠规则推算更易测、易维护、零数据膨胀）
 *   - 提供 `enumerateSancaiTable()` 调试/测试时枚举 125 项，验证分布
 */

import type {
  Element,
  GridName,
  GridInfo,
  SancaiLevel,
  SancaiRelation,
  SancaiVerdict,
} from '../types'

/** 五行相生：木→火→土→金→水→木 */
const SHENG: Readonly<Record<Element, Element>> = Object.freeze({
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
})

/** 五行相克：木→土→水→火→金→木 */
const KE: Readonly<Record<Element, Element>> = Object.freeze({
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木',
})

/**
 * 判定 A → B 的有向关系
 *   - sheng: A 生 B
 *   - ke:    A 克 B
 *   - tongHe: A === B（比和）
 *   - xie:   A 被 B 生（A 是 B 的子女，气泄 A）
 *   - hao:   A 被 B 克（A 被 B 害）
 */
export function relate(a: Element, b: Element): SancaiRelation {
  if (a === b) return 'tongHe'
  if (SHENG[a] === b) return 'sheng'
  if (KE[a] === b) return 'ke'
  if (SHENG[b] === a) return 'xie' // B 生 A 反过来即 A 被 B 生
  return 'hao' // 剩余只能是 B 克 A
}

/** 关系是否为"正向利好"（生 / 比和） */
function isPositive(r: SancaiRelation): boolean {
  return r === 'sheng' || r === 'tongHe'
}

/** 关系是否为"负向不利"（克 / 耗 / 泄） */
function isNegative(r: SancaiRelation): boolean {
  return r === 'ke' || r === 'hao'
}

/**
 * 三才等级判定（仅看天→人 + 人→地两条相邻关系）
 *
 * 设计原则：
 *   - 只看相邻（不绕开"人"看 天→地），与熊崎派文献一致
 *   - 5 档既能区分常见情形，又不至于过细
 */
export function judgeLevel(
  tianToRen: SancaiRelation,
  renToDi: SancaiRelation,
  combo: [Element, Element, Element],
): SancaiLevel {
  const [t, r, d] = combo
  const allSame = t === r && r === d

  // 大吉：层层相生（天生人 + 人生地）OR 三者全比和
  if (allSame) return '大吉'
  if (tianToRen === 'sheng' && renToDi === 'sheng') return '大吉'

  // 大凶：两组克 / 层层相克链（天克人 + 人克地）
  const negCount =
    (isNegative(tianToRen) ? 1 : 0) + (isNegative(renToDi) ? 1 : 0)
  if (negCount >= 2) return '大凶'
  if (tianToRen === 'ke' && renToDi === 'ke') return '大凶'

  // 凶：恰好一组负向（克/耗/泄之一）
  if (negCount === 1) return '凶'

  // 至此 negCount === 0：两组都是正向（生 / 比和）
  const posCount =
    (isPositive(tianToRen) ? 1 : 0) + (isPositive(renToDi) ? 1 : 0)

  // 吉：两组都生 / 生 + 比和（在剔除大吉的层层相生后，剩下"生+比和"或"比和+生"）
  if (posCount === 2 && (tianToRen === 'sheng' || renToDi === 'sheng')) {
    return '吉'
  }

  // 中吉：剩余 = 两组都比和（理论上 allSame 已覆盖；冗余兜底走中吉）
  return '中吉'
}

/** SancaiLevel → i18n key */
const LEVEL_KEY_MAP: Readonly<Record<SancaiLevel, SancaiVerdict['levelKey']>> =
  Object.freeze({
    大吉: 'great',
    吉: 'good',
    中吉: 'mid',
    凶: 'bad',
    大凶: 'worst',
  })

/** SancaiLevel → 一句话定性（zh-CN；UI 实际取 i18n key 渲染） */
const LEVEL_SUMMARY_MAP: Readonly<Record<SancaiLevel, string>> = Object.freeze({
  大吉: '三才相生 · 基业稳固',
  吉: '生扶有力 · 顺势可成',
  中吉: '不冲不悖 · 守成可安',
  凶: '一处生克 · 须留意应对',
  大凶: '层层相克 · 需慎防波折',
})

/**
 * 主入口：给定五格信息，输出三才判定。
 *
 * 仅依赖 grids.tian.entry.element / grids.ren.entry.element / grids.di.entry.element，
 * 无副作用、纯函数、O(1)。
 */
export function getSancaiVerdict(
  grids: Record<GridName, GridInfo>,
): SancaiVerdict {
  const t = grids.tian.entry.element
  const r = grids.ren.entry.element
  const d = grids.di.entry.element
  const tianToRen = relate(t, r)
  const renToDi = relate(r, d)
  const combo: [Element, Element, Element] = [t, r, d]
  const level = judgeLevel(tianToRen, renToDi, combo)
  return {
    combo,
    level,
    levelKey: LEVEL_KEY_MAP[level],
    summary: LEVEL_SUMMARY_MAP[level],
    tianToRen,
    renToDi,
  }
}

/**
 * 调试 / 测试用：枚举全部 125 种三才组合，统计 5 等级分布。
 *
 * 不在生产路径上调用；保留以便单测断言"5 档分布合理 / 没有空档"。
 */
export function enumerateSancaiTable(): {
  combo: [Element, Element, Element]
  level: SancaiLevel
  tianToRen: SancaiRelation
  renToDi: SancaiRelation
}[] {
  const elements: Element[] = ['木', '火', '土', '金', '水']
  const out: ReturnType<typeof enumerateSancaiTable> = []
  for (const t of elements) {
    for (const r of elements) {
      for (const d of elements) {
        const tianToRen = relate(t, r)
        const renToDi = relate(r, d)
        const level = judgeLevel(tianToRen, renToDi, [t, r, d])
        out.push({ combo: [t, r, d], level, tianToRen, renToDi })
      }
    }
  }
  return out
}
