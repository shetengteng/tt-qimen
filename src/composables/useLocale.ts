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
  /**
   * 首次访问的默认语言策略（用户偏好：默认简体中文）：
   * - 系统语言是繁体中文圈（zh-TW / zh-HK / zh-MO）→ 自动给繁体，符合该用户习惯；
   * - 其它一切情况（en / ja / ko / zh-CN / 空值等）→ 一律落到简体中文。
   * 不再"系统是英文就自动给英文"，避免用户拿到非预期的英文 UI 后才去找语言切换按钮。
   * 用户在 LangSwitch 主动切到 en / zh-TW 后，会写入 localStorage，下次访问遵循该选择。
   */
  const nav = window.navigator.language
  if (nav.startsWith('zh-TW') || nav.startsWith('zh-HK') || nav.startsWith('zh-MO')) return 'zh-TW'
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
