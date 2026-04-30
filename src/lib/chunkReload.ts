/**
 * 处理"用户打开的 index.html 是旧版本，引用的 chunk hash 已被新部署清除"导致的
 * `Failed to fetch dynamically imported module` 404。
 *
 * 触发场景（GitHub Pages / 任意 CDN 静态托管）：
 *   1. 用户首次访问，浏览器缓存了旧 index.html + 当时的 chunk 引用
 *   2. main 推新部署，hash 变化的 chunk 被 actions/upload-pages-artifact 替换为新 hash
 *   3. 用户在旧标签页里切路由 / 触发 dynamic import → fetch 旧 hash → 404 → 整页卡住
 *
 * 修复策略（业界标准）：
 *   - 监听 Vite 5 原生 `vite:preloadError`（modulepreload 失败时早于 router 触发）
 *   - router.onError 捕获 dynamic import 失败的兜底
 *   - 二者命中后调 `triggerReloadOnce()` 强制 location.reload() 拿最新 index.html
 *
 * 防循环保护：
 *   - sessionStorage 记录最近一次 reload 时间戳
 *   - 10 分钟内只允许 reload 一次；超出则放行原始错误，避免新版本本身 broken 时无限刷新
 */

const RELOAD_KEY = 'tt-qimen:chunk-reload-ts'
const RELOAD_COOLDOWN_MS = 10 * 60 * 1000

const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
  /Unable to preload CSS/i,
]

export function isChunkLoadError(err: unknown): boolean {
  if (!err) return false
  const msg = err instanceof Error ? err.message : String(err)
  return CHUNK_ERROR_PATTERNS.some((re) => re.test(msg))
}

/**
 * 触发一次安全的整页刷新；冷却期内重复调用为 noop。
 * 返回值：是否真正触发了 reload（用于上层决策是否还要把错误抛上去）。
 */
export function triggerReloadOnce(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? '0')
    const now = Date.now()
    if (now - last < RELOAD_COOLDOWN_MS) return false
    window.sessionStorage.setItem(RELOAD_KEY, String(now))
  } catch {
    // sessionStorage 在隐私模式 / iframe 沙盒里可能抛错；忽略后仍执行 reload，让用户至少看到一次自愈
  }
  window.location.reload()
  return true
}

/**
 * 安装全局 vite:preloadError 监听器。
 * Vite 5 在 modulepreload 失败时派发此事件；我们 preventDefault 抑制原生 error，
 * 然后触发 reload 拿最新 index.html。
 */
export function installChunkReloadGuard(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    triggerReloadOnce()
  })
}
