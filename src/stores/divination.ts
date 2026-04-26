import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ModuleId } from '@/router'

interface CacheEntry {
  hash: string
  result: unknown
}

/**
 * Divination 跨模块结果缓存 store
 *
 * 设计意图：
 *   各模块（bazi / ziwei / chenggu / ...）的排盘结果在输入未变时具有"幂等性"——
 *   重复计算意义不大。本 store 提供按模块隔离的"最近一次结果"缓存，命中条件是
 *   `(moduleId, hash)` 完全一致。
 *
 * 实际接入策略（截至 2026-04-26）：
 *   - 8 个业务 core 计算耗时 < 50ms，缓存的 CPU 收益极小
 *   - 8 个模块"按下排盘"按钮的语义就是"重算 + 触发动画"，不应被缓存短路
 *   - 因此**不在按钮路径**接入；接入面是：
 *       a) `onMounted` 中扫码进入复盘的场景（避免相同 hash 多次进入时重复计算）
 *       b) 跨路由保活的可选优化（例如八字 → 紫微 → 八字 不重算）
 *
 * 使用示例（业务侧）：
 *   const store = useDivinationStore()
 *   const hash = `${birth.year}-${birth.month}-${birth.day}-${birth.hour}-${birth.gender}`
 *   chart.value = store.cachedCompute<BaziChart>('bazi', hash, () => calculateBazi(birth))
 *
 * 不引入 LRU / 容量限制：
 *   每个模块只存"最近一次"结果（同 moduleId 下后写覆盖前写），
 *   总占用 = 8 个模块 × 1 个结果对象，远低于浏览器内存敏感线。
 */
export const useDivinationStore = defineStore('divination', () => {
  const cache = ref<Partial<Record<ModuleId, CacheEntry>>>({})

  /** 直接读缓存（hash 不匹配返回 undefined） */
  function get<T>(moduleId: ModuleId, hash: string): T | undefined {
    const hit = cache.value[moduleId]
    return hit && hit.hash === hash ? (hit.result as T) : undefined
  }

  /** 直接写缓存（覆盖该 moduleId 的旧条目） */
  function set<T>(moduleId: ModuleId, hash: string, result: T) {
    cache.value[moduleId] = { hash, result }
  }

  /** 清除指定模块（不传则清空所有） */
  function clear(moduleId?: ModuleId) {
    if (moduleId) delete cache.value[moduleId]
    else cache.value = {}
  }

  /**
   * 通用缓存计算 helper：先查缓存，未命中则调用 computeFn 并写入。
   *
   * 业务侧接入面：替代直接调 core 函数，使路由复活 / 扫码 hydrate 场景下命中缓存。
   *
   * 不在内部捕获 computeFn 抛出的异常 —— 让上层保留原生错误处理逻辑
   * （如 FortuneError 解析、UI 友好态切换）。
   *
   * @param moduleId 模块 id（与路由 name / store namespace 对齐）
   * @param hash     输入哈希（业务侧负责生成；通常拼 birth + 模块特定参数）
   * @param computeFn 计算函数（cache miss 时调用）
   */
  function cachedCompute<T>(moduleId: ModuleId, hash: string, computeFn: () => T): T {
    const hit = get<T>(moduleId, hash)
    if (hit !== undefined) return hit
    const fresh = computeFn()
    set(moduleId, hash, fresh)
    return fresh
  }

  return { cache, get, set, clear, cachedCompute }
})
