import { meta as guofeng } from './guofeng/meta'
import { meta as minimal } from './minimal/meta'
import type { ThemeMeta } from './types'

export const THEME_IDS = ['guofeng', 'minimal'] as const
export type ThemeId = typeof THEME_IDS[number]
export const DEFAULT_THEME: ThemeId = 'guofeng'

export const themeRegistry: Record<ThemeId, ThemeMeta> = {
  guofeng,
  minimal,
}

export const themeLoaders: Record<ThemeId, () => Promise<unknown>> = {
  guofeng: () => Promise.all([
    import('./guofeng/tokens.css'),
    import('./guofeng/components.css'),
    import('./guofeng/decorations.css'),
    import('./guofeng/shadcn.css'),
  ]),
  minimal: () => Promise.all([
    import('./minimal/tokens.css'),
    import('./minimal/components.css'),
    import('./minimal/decorations.css'),
    import('./minimal/shadcn.css'),
  ]),
}

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === 'string' && (THEME_IDS as readonly string[]).includes(v)
}
