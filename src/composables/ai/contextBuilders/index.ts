/**
 * 上下文构造器路由表
 *
 * 8 模块各自的 ContextBuilder 在这里集中导出，
 * 调用方按 ModuleId 取对应 builder。
 *
 * P3.B：8 个模块全部接入真实 builder。
 */

import type { ModuleId } from '@/router'
import type { ContextBuilder } from './types'
import { baziContextBuilder } from './bazi'
import { ziweiContextBuilder } from './ziwei'
import { liurenContextBuilder } from './liuren'
import { chengguContextBuilder } from './chenggu'
import { lingqianContextBuilder } from './lingqian'
import { xingmingContextBuilder } from './xingming'
import { huangliContextBuilder } from './huangli'
import { jiemengContextBuilder } from './jiemeng'

export const CONTEXT_BUILDERS: Record<ModuleId, ContextBuilder<any>> = {
  bazi:     baziContextBuilder,
  ziwei:    ziweiContextBuilder,
  liuren:   liurenContextBuilder,
  chenggu:  chengguContextBuilder,
  lingqian: lingqianContextBuilder,
  xingming: xingmingContextBuilder,
  huangli:  huangliContextBuilder,
  jiemeng:  jiemengContextBuilder,
}

export { baziContextBuilder } from './bazi'
export { ziweiContextBuilder } from './ziwei'
export { liurenContextBuilder } from './liuren'
export { chengguContextBuilder } from './chenggu'
export { lingqianContextBuilder } from './lingqian'
export { xingmingContextBuilder } from './xingming'
export { huangliContextBuilder } from './huangli'
export { jiemengContextBuilder } from './jiemeng'
export type { ContextBuilder, AiContext, ContextBuilderInput } from './types'
