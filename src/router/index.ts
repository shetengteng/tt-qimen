import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from 'vue-router'
import { defineAsyncComponent, type Component } from 'vue'
import { i18n, isLocale, loadModuleLocale, type Locale } from '@/locales'
import { isChunkLoadError, triggerReloadOnce } from '@/lib/chunkReload'
import { trackPageView } from '@/lib/analytics'

export const MODULES = [
  { id: 'bazi',     order: 1 },
  { id: 'ziwei',    order: 2 },
  { id: 'liuren',   order: 3 },
  { id: 'chenggu',  order: 4 },
  { id: 'lingqian', order: 5 },
  { id: 'xingming', order: 6 },
  { id: 'huangli',  order: 7 },
  { id: 'jiemeng',  order: 8 },
] as const

export type ModuleId = typeof MODULES[number]['id']

/**
 * 把 lazy import 包装成 AsyncComponent：
 *
 * - 默认 `() => import(...)` 形式让 vue-router 自己 await 组件解析后才 finalize
 *   navigation；用户点击 tab 后到 chunk 下载完之前，`route.name` 不变 → tab 没反应。
 * - 改用 `defineAsyncComponent` 让 router 立即看到一个**已注册的同步组件**，
 *   navigation 立刻 finalize（route.name 立即更新），由外层 `<Suspense>`（见
 *   `AppRouterView.vue`）接管异步渲染 fallback `<PageLoading>`。
 *
 * onError 透传 chunk 加载失败到 chunkReload 兜底：与 main.ts 的
 * `vite:preloadError` 监听 + router.onError 形成三层守护，保证旧 index.html
 * 引用失效 chunk 时一定能自愈。
 */
function lazyRoute(loader: () => Promise<unknown>): Component {
  return defineAsyncComponent({
    loader: loader as () => Promise<Component>,
    onError(err, _retry, fail) {
      if (isChunkLoadError(err)) {
        triggerReloadOnce()
      }
      fail()
    },
  })
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: lazyRoute(() => import('@/modules/home/HomePage.vue')),
    meta: { titleKey: 'home.title' },
  },
  ...MODULES.map<RouteRecordRaw>((m) => ({
    path: `/${m.id}`,
    name: m.id,
    component: lazyRoute(() => import(`@/modules/${m.id}/${capitalize(m.id)}Page.vue`)),
    meta: { titleKey: `${m.id}.title`, moduleId: m.id, order: m.order },
  })),
  {
    path: '/about',
    name: 'about',
    component: lazyRoute(() => import('@/modules/legal/AboutPage.vue')),
    meta: { titleKey: 'about.title' },
  },
  {
    path: '/disclaimer',
    name: 'disclaimer',
    component: lazyRoute(() => import('@/modules/legal/DisclaimerPage.vue')),
    meta: { titleKey: 'disclaimerPage.title' },
  },
  {
    path: '/data-source',
    name: 'data-source',
    component: lazyRoute(() => import('@/modules/legal/DataSourcePage.vue')),
    meta: { titleKey: 'dataSourcePage.title' },
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: lazyRoute(() => import('@/modules/legal/PrivacyPage.vue')),
    meta: { titleKey: 'privacyPage.title' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: lazyRoute(() => import('@/modules/settings/SettingsPage.vue')),
    meta: { titleKey: 'settings.title', moduleId: 'settings' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: lazyRoute(() => import('@/modules/_404.vue')),
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0, behavior: 'smooth' },
})

router.beforeEach(async (to) => {
  const moduleId = to.meta.moduleId as string | undefined
  if (moduleId) {
    const lang = i18n.global.locale.value as Locale
    if (isLocale(lang)) await loadModuleLocale(moduleId, lang)
  }
})

router.afterEach((to) => {
  const key = to.meta.titleKey as string | undefined
  const t = key ? String(i18n.global.t(key)) : 'tt-qimen'
  document.title = `${t} · tt-qimen`
  /**
   * SPA hash mode 路由切换不会触发原生 page_view；analytics 模块仅在
   * VITE_GA4_ID 配置时实际上报，未配置则 noop。仅取 to.fullPath（hash 后的部分），
   * 不上报 query 中可能含有的 deeplink 参数（避免把生辰数据落到 GA）。
   */
  const path = to.fullPath.split('?')[0]
  trackPageView(path, document.title)
})

/**
 * 兜底：dynamic import 路由组件失败（旧 index.html 引用的 chunk hash 已被新部署清除）
 * 时强制刷新拿最新 index.html。`vite:preloadError` 已在 main.ts 监听 modulepreload 失败；
 * 这里覆盖 router 实际 navigation 触发的 import error。AsyncComponent 的 onError 钩子
 * 是第三层，保证三层守护无遗漏。
 */
router.onError((err) => {
  if (isChunkLoadError(err)) triggerReloadOnce()
})

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
