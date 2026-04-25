/**
 * 笔画查询 loader
 *
 * 查询策略（按优先级）：
 *   1. 康熙笔画修正表（KANGXI_CORRECTIONS，~200 字，覆盖简繁差异常用字）
 *   2. 动态 import `chinese-character-strokes` npm 包（~20000 字覆盖），取笔顺字符串 length
 *   3. 未收录 → 抛 `StrokesNotFoundError`
 *
 * 注意：
 *   - 该 npm 包返回的是**简化汉字笔顺序列**（如"轩"→"1521112"即 7 画）
 *   - 对简繁一致的字（绝大多数人名用字）两者数值相同
 *   - 对简繁不一致的字（如张 = 張 = 11 画），修正表优先拦截保证康熙口径
 *   - 首屏不加载此包；仅在用户点击"解名"触发首次查询时 await import
 */

import { FortuneError } from '@/lib/errors'
import { getKangxiCorrection } from '../data/strokesFallback'

/**
 * 未收录字异常（独立类型，UI 单独消费 → friendly "暂未收录该字" 文案）。
 *
 * 保留为独立类型而非 `FortuneError('invalid-input')` 的原因：
 *   - UI 需要 `char` 字段做参数化文案（"未收录字：X"）
 *   - 命中率低但触发后用户明确知道是哪个字的问题，价值高于 code 一致化
 */
export class StrokesNotFoundError extends Error {
  readonly char: string
  constructor(char: string) {
    super(`未收录字：${char}`)
    this.name = 'StrokesNotFoundError'
    this.char = char
  }
}

type StrokeFn = (char: string) => string | null

let cachedFn: StrokeFn | null = null

async function loadStrokeFn(): Promise<StrokeFn> {
  if (cachedFn) return cachedFn
  let mod: unknown
  try {
    mod = await import('chinese-character-strokes')
  } catch (cause) {
    throw new FortuneError({
      module: 'xingming',
      code: 'dep-load-failed',
      message: '[xingming] failed to load chinese-character-strokes',
      cause,
    })
  }
  const m = mod as Record<string, unknown> & { default?: Record<string, unknown> }
  const fn = (m['取笔顺'] ?? m.default?.['取笔顺']) as StrokeFn | undefined
  if (typeof fn !== 'function') {
    throw new FortuneError({
      module: 'xingming',
      code: 'dep-load-failed',
      message: '[xingming] chinese-character-strokes export "取笔顺" missing',
    })
  }
  cachedFn = fn
  return fn
}

/** 笔画明细（同时返回康熙和简化两种口径，用于 UI "简 N · 康熙 N" 对照）。 */
export interface StrokesDetail {
  /** 康熙笔画（姓名学计算口径）：修正表优先，未命中时等于 simplified */
  kangxi: number
  /** 简化笔画（现代字形）：来自 npm 包笔顺序列长度 */
  simplified: number
}

/**
 * 查询单字康熙笔画数（异步 · 首次调用会动态加载笔顺库）。
 *
 * @throws {StrokesNotFoundError} 当修正表与 npm 包都未收录该字
 */
export async function getKangxiStrokes(char: string): Promise<number> {
  const corrected = getKangxiCorrection(char)
  if (corrected !== null) return corrected

  const fn = await loadStrokeFn()
  const seq = fn(char)
  if (typeof seq === 'string' && seq.length > 0) {
    return seq.length
  }
  throw new StrokesNotFoundError(char)
}

/**
 * 同时查询康熙和简化笔画。用于 UI 层展示"简 N · 康熙 N"对照。
 * 修正表未收录的字，康熙与简化值相同。
 */
export async function getStrokesDetail(char: string): Promise<StrokesDetail> {
  const fn = await loadStrokeFn()
  const seq = fn(char)
  const simplified = (typeof seq === 'string' && seq.length > 0) ? seq.length : 0

  const corrected = getKangxiCorrection(char)
  const kangxi = corrected !== null ? corrected : simplified

  if (kangxi === 0) {
    throw new StrokesNotFoundError(char)
  }
  return { kangxi, simplified: simplified || kangxi }
}

/**
 * 批量查询；保持输入顺序。遇到未收录字立即抛出（由 UI 层包装为友好态）。
 */
export async function getKangxiStrokesBatch(chars: readonly string[]): Promise<number[]> {
  const result: number[] = []
  for (const c of chars) {
    result.push(await getKangxiStrokes(c))
  }
  return result
}

/** 批量获取 "简 + 康熙" 明细 */
export async function getStrokesDetailBatch(
  chars: readonly string[],
): Promise<StrokesDetail[]> {
  const result: StrokesDetail[] = []
  for (const c of chars) {
    result.push(await getStrokesDetail(c))
  }
  return result
}

/**
 * 同步版本仅用于已知在修正表中的字（调用方自行保证）。
 * 未命中时返回 null，不走 npm 包，不抛错。
 */
export function getKangxiStrokesSync(char: string): number | null {
  return getKangxiCorrection(char)
}
