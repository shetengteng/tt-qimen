import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { i18n, isLocale, loadModuleLocale, type Locale } from '@/locales'

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

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/modules/home/HomePage.vue'),
    meta: { titleKey: 'home.title' },
  },
  ...MODULES.map<RouteRecordRaw>((m) => ({
    path: `/${m.id}`,
    name: m.id,
    component: () => import(`@/modules/${m.id}/${capitalize(m.id)}Page.vue`),
    meta: { titleKey: `${m.id}.title`, moduleId: m.id, order: m.order },
  })),
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/modules/_404.vue'),
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
})

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
