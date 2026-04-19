/**
 * URL 引导：在 stores/composables 实例化之前调用一次，
 * 把 ?theme= / ?lang= 写入 localStorage，确保 useStorage 取到正确初值。
 *
 * 必须在 main.ts 中尽早调用（早于 createApp 之后挂载之前的任何 useStorage）。
 */
import { isThemeId } from '@/themes'
import { isLocale } from '@/locales'

const THEME_KEY = 'tt-qimen:theme'
const LOCALE_KEY = 'tt-qimen:locale'

function parseHashQuery(hash: string): URLSearchParams {
  const idx = hash.indexOf('?')
  return new URLSearchParams(idx >= 0 ? hash.slice(idx + 1) : '')
}

export function applyUrlBootstrap(): void {
  if (typeof window === 'undefined') return

  const hashQuery = parseHashQuery(window.location.hash)
  const searchQuery = new URLSearchParams(window.location.search)

  const theme = hashQuery.get('theme') ?? searchQuery.get('theme')
  const lang = hashQuery.get('lang') ?? searchQuery.get('lang')

  if (theme && isThemeId(theme)) {
    window.localStorage.setItem(THEME_KEY, theme)
  }
  if (lang && isLocale(lang)) {
    window.localStorage.setItem(LOCALE_KEY, lang)
  }
}
