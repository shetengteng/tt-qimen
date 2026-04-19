import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import termsZhCN from './divination-terms.zh-CN'

export const SUPPORT_LOCALES = ['zh-CN', 'zh-TW', 'en'] as const
export type Locale = typeof SUPPORT_LOCALES[number]
export const DEFAULT_LOCALE: Locale = 'zh-CN'

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (SUPPORT_LOCALES as readonly string[]).includes(v)
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    'zh-CN': { ...zhCN, terms: termsZhCN },
  },
  datetimeFormats: {
    'zh-CN': { short: { year: 'numeric', month: '2-digit', day: '2-digit' } },
    'zh-TW': { short: { year: 'numeric', month: '2-digit', day: '2-digit' } },
    en:      { short: { year: 'numeric', month: 'short', day: 'numeric' } },
  },
})

const baseLoaders: Record<Locale, () => Promise<{ default: any }>> = {
  'zh-CN': async () => ({ default: zhCN }),
  'zh-TW': () => import('./zh-TW'),
  en:      () => import('./en'),
}

const termsLoaders: Record<Locale, () => Promise<{ default: any }>> = {
  'zh-CN': async () => ({ default: termsZhCN }),
  'zh-TW': () => import('./divination-terms.zh-TW'),
  en:      () => import('./divination-terms.en'),
}

const loaded = new Set<string>(['zh-CN'])

export async function loadLocale(lang: Locale): Promise<void> {
  if (!loaded.has(lang)) {
    const [base, terms] = await Promise.all([baseLoaders[lang](), termsLoaders[lang]()])
    i18n.global.setLocaleMessage(lang, { ...base.default, terms: terms.default })
    loaded.add(lang)
  }
  i18n.global.locale.value = lang
  document.documentElement.lang = lang
}

export async function loadModuleLocale(moduleId: string, lang: Locale): Promise<void> {
  const key = `module:${moduleId}@${lang}`
  if (loaded.has(key)) return
  try {
    const mod = await import(`./modules/${moduleId}.${lang}.ts`)
    i18n.global.mergeLocaleMessage(lang, { [moduleId]: mod.default })
  } catch {
    // 模块本地化文件可缺失，主 locale 文件已有占位
  }
  loaded.add(key)
}
