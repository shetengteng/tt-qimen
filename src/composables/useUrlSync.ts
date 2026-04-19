import { useRouteQuery } from '@vueuse/router'
import { watch } from 'vue'
import { isThemeId, type ThemeId } from '@/themes'
import { isLocale, type Locale } from '@/locales'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'

/**
 * URL ?theme= / ?lang= 与 store 双向同步
 * 优先级：URL > localStorage > 浏览器默认 > 兜底
 *
 * 在路由就绪后调用一次即可（见 App.vue）
 */
export function useUrlSync() {
  const themeStore = useThemeStore()
  const localeStore = useLocaleStore()

  const qTheme = useRouteQuery<string | null>('theme', null)
  const qLang = useRouteQuery<string | null>('lang', null)

  watch(qTheme, (v) => {
    if (v && isThemeId(v) && v !== themeStore.id) {
      themeStore.set(v as ThemeId)
    }
  }, { immediate: true })

  watch(qLang, (v) => {
    if (v && isLocale(v) && v !== localeStore.id) {
      localeStore.set(v as Locale)
    }
  }, { immediate: true })

  watch(() => themeStore.id, (v) => {
    if (qTheme.value !== v) qTheme.value = v
  })
  watch(() => localeStore.id, (v) => {
    if (qLang.value !== v) qLang.value = v
  })
}
