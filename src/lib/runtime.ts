/**
 * 运行时环境探测（见 design/2026-05-14-01-Tauri桌面端实现方案.md §5.2）。
 *
 * 用途：未来如需在 SPA 中做"桌面端独有逻辑分支"时使用。
 * 例如：
 *   - 桌面端关闭 GA4（installAnalytics 中 short-circuit）
 *   - 桌面端隐藏"添加到主屏幕" PWA 引导
 *   - 桌面端在标题栏显示菜单
 *
 * 判定原理：Tauri 2 在 webview 注入 `window.__TAURI_INTERNALS__`，
 * 即使关闭 isolation 模式也存在。比 UA / appName 检测更稳，且不会因 SSR 误判
 * （SSR 阶段 window 不存在，下方守卫直接返回 false）。
 */
export const isTauri =
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

/**
 * 跨环境打开外部 URL。
 *
 * 浏览器:走原生 `window.open(_blank)`。
 * Tauri 桌面端:`<a target="_blank">` 在 WebView 内不会响应,需通过
 * `tauri-plugin-opener` 调系统默认浏览器(macOS open / Windows start / Linux xdg-open)。
 *
 * 用法(必须 prevent click 的默认行为以阻止 webview 内跳转):
 *
 *   ```vue
 *   <a :href="url" target="_blank" @click.prevent="openExternal(url)">…</a>
 *   ```
 *
 * 动态 import 避免浏览器 bundle 把 @tauri-apps/plugin-opener 打进去。
 */
export async function openExternal(url: string): Promise<void> {
  if (isTauri) {
    const { openUrl } = await import('@tauri-apps/plugin-opener')
    await openUrl(url)
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
