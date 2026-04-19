import { useStorage } from '@vueuse/core'
import { watch } from 'vue'
import {
  DEFAULT_THEME,
  isThemeId,
  THEME_IDS,
  themeLoaders,
  themeRegistry,
  type ThemeId,
} from '@/themes'

const STORAGE_KEY = 'tt-qimen:theme'
const loaded = new Set<ThemeId>()

export function useTheme() {
  const id = useStorage<ThemeId>(STORAGE_KEY, DEFAULT_THEME, undefined, {
    serializer: {
      read: (v) => (isThemeId(v) ? v : DEFAULT_THEME),
      write: (v) => v,
    },
  })

  watch(
    id,
    async (next) => {
      if (!loaded.has(next)) {
        await themeLoaders[next]()
        loaded.add(next)
      }
      document.documentElement.dataset.theme = next
    },
    { immediate: true },
  )

  function set(next: ThemeId) {
    id.value = next
  }

  return {
    id,
    list: THEME_IDS,
    registry: themeRegistry,
    set,
  }
}
