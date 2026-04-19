import { useStorage } from '@vueuse/core'
import { watch } from 'vue'
import {
  DEFAULT_LOCALE,
  isLocale,
  loadLocale,
  SUPPORT_LOCALES,
  type Locale,
} from '@/locales'

const STORAGE_KEY = 'tt-qimen:locale'

function detectInitial(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved && isLocale(saved)) return saved
  const nav = window.navigator.language
  if (nav.startsWith('zh-TW') || nav.startsWith('zh-HK') || nav.startsWith('zh-MO')) return 'zh-TW'
  if (nav.startsWith('en')) return 'en'
  return DEFAULT_LOCALE
}

export function useLocale() {
  const id = useStorage<Locale>(STORAGE_KEY, detectInitial(), undefined, {
    serializer: {
      read: (v) => (isLocale(v) ? v : DEFAULT_LOCALE),
      write: (v) => v,
    },
  })

  watch(
    id,
    async (next) => {
      await loadLocale(next)
    },
    { immediate: true },
  )

  function set(next: Locale) {
    id.value = next
  }

  return {
    id,
    list: SUPPORT_LOCALES,
    set,
  }
}
