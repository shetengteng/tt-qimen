/**
 * 81 numerology entries · zh-TW (繁體) overrides
 *
 * 实现策略：
 *   - 使用 `chinese-conv` 的 `tify` 函数运行时把简体 description / summary 转为繁体
 *   - 数据本身不重复维护；与简体保持单一真源
 *   - 模块加载时一次转换、缓存为只读数组
 *
 * 与英文版（`numerology.en.ts`）相同，导出 `NumerologyOverride[]`。
 */

import { tify } from 'chinese-conv'
import { NUMEROLOGY } from './numerology'
import type { NumerologyOverride } from './numerology.en'

export const NUMEROLOGY_ZHTW: readonly NumerologyOverride[] = Object.freeze(
  NUMEROLOGY.map((entry) => ({
    summary: tify(entry.summary),
    description: tify(entry.description),
  })),
)
