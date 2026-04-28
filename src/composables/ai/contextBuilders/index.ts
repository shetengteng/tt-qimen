/**
 * 上下文构造器路由表
 *
 * 8 模块各自的 ContextBuilder 在这里集中导出，
 * 调用方按 ModuleId 取对应 builder。
 *
 * Phase 1 仅落地 bazi；其他 7 个模块在 Phase 4 / Phase 5 逐个补齐。
 * 注释中保留 stub，避免新增模块时 Type 全 broken。
 */

import type { ModuleId } from '@/router'
import type { ContextBuilder } from './types'
import { baziContextBuilder } from './bazi'

/**
 * 待完成的 builder 用 stub 占位：返回最小可用 AiContext，
 * 让上层在该模块未接入 AI 之前调用不会 throw（仅上下文为空）。
 */
function makeStubBuilder(moduleId: ModuleId): ContextBuilder<unknown> {
  return {
    build({ locale }) {
      return {
        fingerprint: `${moduleId}:stub`,
        moduleId,
        displayLabel: moduleId,
        narrative: locale === 'en'
          ? `_Context for ${moduleId} is not implemented yet._`
          : `_${moduleId} 模块的 AI 上下文尚未实现。_`,
        structured: {},
        presetPromptKeys: [],
      }
    },
  }
}

export const CONTEXT_BUILDERS: Record<ModuleId, ContextBuilder<any>> = {
  bazi:     baziContextBuilder,
  ziwei:    makeStubBuilder('ziwei'),
  liuren:   makeStubBuilder('liuren'),
  chenggu:  makeStubBuilder('chenggu'),
  lingqian: makeStubBuilder('lingqian'),
  xingming: makeStubBuilder('xingming'),
  huangli:  makeStubBuilder('huangli'),
  jiemeng:  makeStubBuilder('jiemeng'),
}

export { baziContextBuilder } from './bazi'
export type { ContextBuilder, AiContext, ContextBuilderInput } from './types'
