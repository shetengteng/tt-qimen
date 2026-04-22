/**
 * 注释 bar 状态管理 composable（v3.1.1）
 *
 * 等价原型 design/prototypes/{guofeng,minimal}/bazi.html 的
 * `toggleOne` / `toggleAll` / `syncToggleAllLabel` 行为，
 * 但不再依赖 DOM 注入，全部转为响应式状态。
 *
 * 用法：
 *   const bar = useAnnotBar(allItems)
 *   bar.openItems.value      // 当前展开项的 AnnotItem[]
 *   bar.isAnyOpen.value      // 是否有任意项展开（toggle-all 文案/aria-pressed 用）
 *   bar.toggleOne(focus)     // 切换单条
 *   bar.toggleAll()          // 全展开/全收起
 *   bar.isOpen(focus)        // 锚点 aria-expanded 用
 *
 * 设计文档：design/bazi/2026-04-21-03-注释交互设计方案.md §11
 */
import { computed, ref } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { AnnotItem } from '@/components/common/InlineAnnotsBar.vue'

export interface AnnotBarApi {
  /** 当前展开项（按 allItems 原顺序排列，便于"全展开"时与原子项节奏对齐） */
  openItems: ComputedRef<AnnotItem[]>
  /** 是否有任意项展开 */
  isAnyOpen: ComputedRef<boolean>
  /** 锚点 aria-expanded 查询 */
  isOpen: (focus: string) => boolean
  /** 切换单条；不存在的 focus 直接忽略 */
  toggleOne: (focus: string) => void
  /** 一键全展开 / 全收起（任意展开则全收起，否则全展开） */
  toggleAll: () => void
  /** 程序化全收起（如 section 折叠时调用） */
  closeAll: () => void
}

/**
 * @param allItems 该 section 下全部可被展开的注释项；composable 自动从中筛出 openItems。
 *                 必须用 ref/computed 包裹以保证 chart 切换后 items 能跟着更新。
 */
export function useAnnotBar(allItems: Ref<AnnotItem[]> | ComputedRef<AnnotItem[]>): AnnotBarApi {
  const openKeys = ref<Set<string>>(new Set())

  const openItems = computed<AnnotItem[]>(() =>
    allItems.value.filter(it => openKeys.value.has(it.focus)),
  )

  const isAnyOpen = computed<boolean>(() => openKeys.value.size > 0)

  function isOpen(focus: string): boolean {
    return openKeys.value.has(focus)
  }

  function toggleOne(focus: string): void {
    if (!allItems.value.some(it => it.focus === focus)) return
    const next = new Set(openKeys.value)
    if (next.has(focus)) next.delete(focus)
    else next.add(focus)
    openKeys.value = next
  }

  function toggleAll(): void {
    if (isAnyOpen.value) {
      openKeys.value = new Set()
    } else {
      openKeys.value = new Set(allItems.value.map(it => it.focus))
    }
  }

  function closeAll(): void {
    if (openKeys.value.size === 0) return
    openKeys.value = new Set()
  }

  return { openItems, isAnyOpen, isOpen, toggleOne, toggleAll, closeAll }
}
