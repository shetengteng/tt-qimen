/**
 * 站点访问量埋点
 *
 * 运行时仅注入两类脚本：
 *   1. 不蔭子（busuanzi）—— 静态注入在 index.html，cookie-less，仅累加 PV/UV
 *   2. Google Analytics 4 —— 仅当环境变量 VITE_GA4_ID 设置时注入
 *
 * 设计原则：
 *   - 默认 noop：未配置 VITE_GA4_ID（如 dev 环境）→ 不发任何请求，不污染生产数据
 *   - SPA 适配：hash mode 路由切换不触发原生 page_view，需在 router.afterEach 手动上报
 *   - 不收集 PII：仅向 GA 上报匿名访问量、页面路径（hash）、粗粒度地区/设备
 *   - 隐私政策同步披露：参见 locales/{zh-CN,zh-TW,en}.ts → privacy 章节
 */

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined

interface GtagFunction {
  (command: 'js', date: Date): void
  (command: 'config', id: string, params?: Record<string, unknown>): void
  (command: 'event', name: string, params?: Record<string, unknown>): void
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFunction
  }
}

let installed = false

/**
 * 安装 GA4（若已配置）。可重复调用，幂等。
 * 应在应用启动时调用一次（main.ts 里）。
 */
export function installAnalytics(): void {
  if (installed) return
  if (!GA4_ID) return
  if (typeof window === 'undefined') return

  installed = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer ?? []
  const gtag: GtagFunction = function gtag(...args: unknown[]) {
    ;(window.dataLayer as unknown[]).push(args)
  } as GtagFunction
  window.gtag = gtag

  gtag('js', new Date())
  /**
   * send_page_view: false — SPA 由 router.afterEach 显式上报，避免首屏被双计。
   * anonymize_ip: GA4 已在服务器侧默认匿名化；仍显式声明以表态。
   */
  gtag('config', GA4_ID, { send_page_view: false, anonymize_ip: true })
}

/**
 * 上报一次页面访问。SPA hash 路由切换时调用。
 * 仅在 GA4 已安装时生效。
 */
export function trackPageView(path: string, title?: string): void {
  if (!GA4_ID) return
  if (typeof window === 'undefined') return
  const gtag = window.gtag
  if (!gtag) return

  gtag('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
  })
}

/** 调试用：判断 analytics 是否已配置（不暴露真实 ID）。 */
export function analyticsEnabled(): boolean {
  return Boolean(GA4_ID)
}
