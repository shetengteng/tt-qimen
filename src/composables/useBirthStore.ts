/**
 * 生辰输入 store 的统一访问入口。
 *
 * 目的：让共享的 `BirthForm.vue` 不再硬绑死单一模块的 store，而是
 * 让父页面通过 provide(BIRTH_STORE_KEY, useXxxStore()) 注入自己的模块 store。
 *
 * 兼容策略：若父级未注入，回退到 `useUserStore`（保持八字旧行为不变）。
 */
import { inject, type InjectionKey } from 'vue'
import type { BirthInput } from '@/stores/user'
import { useUserStore } from '@/stores/user'

/**
 * BirthForm 消费的最小接口契约。
 * Pinia setup store 在外部访问时会自动解包顶层 ref，
 * 所以 `birth` 在两边（useUserStore / useZiweiStore）都呈现为 BirthInput 对象。
 */
export interface BirthStoreLike {
  birth: BirthInput
  update: (patch: Partial<BirthInput>) => void
  reset?: () => void
  isDefault?: boolean
}

export const BIRTH_STORE_KEY: InjectionKey<BirthStoreLike> = Symbol('BIRTH_STORE_KEY')

/**
 * 在子组件（如 BirthForm）中使用：
 *   const store = useBirthStore()
 *
 * 父级页面：
 *   import { provide } from 'vue'
 *   import { useZiweiStore } from './stores/ziweiStore'
 *   provide(BIRTH_STORE_KEY, useZiweiStore())
 *
 * 若父级未 provide，会兜底到全局 useUserStore（向后兼容八字模块）。
 */
export function useBirthStore(): BirthStoreLike {
  const injected = inject(BIRTH_STORE_KEY, null)
  if (injected) return injected
  return useUserStore() as unknown as BirthStoreLike
}
