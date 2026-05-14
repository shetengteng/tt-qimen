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
