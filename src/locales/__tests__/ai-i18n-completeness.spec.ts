/**
 * AC15 守门：AI 模块所用 i18n key 在 zh-CN / zh-TW / en 三语下完整存在。
 *
 * 范围限定 AI 相关 path（不做整体 schema 等价比较 —— 三语整体结构本就允许有差异）：
 *   1. 主 locale 文件：`ai.*` / `settings.section.ai.*` / `settings.section.{theme,language}.*`
 *      / `privacyPage.sections[7]`（AI 解读段）
 *   2. 8 个模块：`<moduleId>.ai.preset.*` 全部 36 条 + `<moduleId>.btn.askAi`（如有）
 *
 * 设计：
 *   - 同步加载 zh-CN.ts 主文件，异步 import zh-TW.ts / en.ts；模块 locale 都用 dynamic import
 *   - 用 lodash 风格 getPath 取嵌套值；空字符串视为缺失
 *   - 失败信息直接打印「<lang>缺失 <path>」，便于定位三语对齐问题
 *
 * 不会触发：
 *   - 任何网络 / 真实 LLM 调用
 *   - DOM / vue 组件渲染（纯 JS schema 检查）
 */

import { describe, it, expect, beforeAll } from 'vitest'

type LocaleId = 'zh-CN' | 'zh-TW' | 'en'

const LOCALES: readonly LocaleId[] = ['zh-CN', 'zh-TW', 'en'] as const

const MODULE_IDS = [
  'bazi',
  'ziwei',
  'liuren',
  'chenggu',
  'lingqian',
  'xingming',
  'huangli',
  'jiemeng',
  'settings',
] as const

type ModuleId = (typeof MODULE_IDS)[number]

const MODULE_AI_PRESET_KEYS: Record<Exclude<ModuleId, 'settings'>, readonly string[]> = {
  bazi: ['career', 'marriage', 'wealth', 'health', 'thisYear', 'lifeStage'],
  ziwei: ['mingPalace', 'palaces', 'lifeMaster', 'decadalLuck', 'sihua', 'friends'],
  liuren: ['thisQuestion', 'palaceMeaning', 'timing', 'outcome'],
  chenggu: ['poemMeaning', 'weight', 'lifeOverview', 'improvement'],
  lingqian: ['poemReading', 'matter', 'outlook', 'tips'],
  xingming: ['nameMeaning', 'nameStrength', 'improvement', 'compatibility'],
  huangli: ['suitability', 'avoidance', 'detailedHours', 'matterAdvice'],
  jiemeng: ['symbolism', 'emotion', 'advice', 'lifeRelevance'],
}

const ROOT_AI_PATHS: readonly string[] = [
  'ai.askButton',
  'ai.askButtonAria',
  'ai.header.toggleOpen',
  'ai.header.toggleClose',
  'ai.freeChat.welcomeBody',
  'ai.freeChat.inputPlaceholder',
  'ai.freeChat.hintGoModule',
  'ai.drawer.title',
  'ai.drawer.closeAria',
  'ai.drawer.stop',
  'ai.drawer.retry',
  'ai.drawer.send',
  'ai.drawer.sendAria',
  'ai.drawer.placeholder',
  'ai.drawer.generating',
  'ai.drawer.scrollToBottom',
  'ai.drawer.emptyKey.title',
  'ai.drawer.emptyKey.body',
  'ai.drawer.emptyKey.cta',
  'ai.drawer.emptyKey.privacyNote',
  'ai.drawer.firstResponse',
  'ai.history.collapsed',
  'ai.model.v4Flash',
  'ai.model.v4Pro',
  'ai.error.aborted',
  'ai.error.unauthorized',
  'ai.error.rate-limited',
  'ai.error.server-error',
  'ai.error.network',
  'ai.error.unknown',
] as const

const SETTINGS_AI_PATHS: readonly string[] = [
  'section.theme.title',
  'section.theme.hint',
  'section.language.title',
  'section.language.hint',
  'section.ai.title',
  'section.ai.lead',
  'section.ai.providerLabel',
  'section.ai.providerHint',
  'section.ai.providerSearchPlaceholder',
  'section.ai.providerEmpty',
  'section.ai.providerCategory.international',
  'section.ai.providerCategory.domestic',
  'section.ai.providerOption.deepseek',
  'section.ai.providerOption.openai',
  'section.ai.providerOption.anthropic',
  'section.ai.providerOption.gemini',
  'section.ai.providerOption.qwen',
  'section.ai.providerOption.moonshot',
  'section.ai.providerOption.zhipu',
  'section.ai.providerOption.xai',
  'section.ai.providerDocsCta',
  'section.ai.apiKey.label',
  'section.ai.apiKey.placeholder',
  'section.ai.apiKey.show',
  'section.ai.apiKey.hide',
  'section.ai.apiKey.hint',
  'section.ai.apiKey.clear',
  'section.ai.model.label',
  'section.ai.model.hint',
  'section.ai.model.flashDesc',
  'section.ai.model.proDesc',
  'section.ai.model.tag.thinking',
  'section.ai.model.tag.fast',
  'section.ai.model.tag.cheap',
  'section.ai.model.tag.longContext',
  'section.ai.model.tag.multimodal',
  'section.ai.model.tag.coding',
  'section.ai.temperature.label',
  'section.ai.temperature.hint',
  'section.ai.temperature.min',
  'section.ai.temperature.max',
  'section.ai.baseUrl.label',
  'section.ai.baseUrl.placeholder',
  'section.ai.baseUrl.hint',
  'section.ai.baseUrl.useDefault',
  'section.ai.test.button',
  'section.ai.test.running',
  'section.ai.test.ok',
  'section.ai.test.fail',
  'section.ai.test.missingKey',
  'section.ai.sessions.title',
  'section.ai.sessions.hint',
  'section.ai.sessions.countLabel',
  'section.ai.sessions.messagesLabel',
  'section.ai.sessions.clearButton',
  'section.ai.sessions.clearConfirm',
  'section.ai.privacy.title',
  'section.ai.privacy.hint',
  'section.ai.privacy.privacyLink',
] as const

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => {
    if (acc && typeof acc === 'object' && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k]
    }
    return undefined
  }, obj)
}

function isPresent(v: unknown): boolean {
  if (v == null) return false
  if (typeof v === 'string') return v.trim().length > 0
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.keys(v as object).length > 0
  return true
}

const rootMessages: Record<LocaleId, Record<string, unknown>> = {
  'zh-CN': {},
  'zh-TW': {},
  en: {},
}

const moduleMessages: Record<LocaleId, Record<ModuleId, Record<string, unknown>>> = {
  'zh-CN': {} as never,
  'zh-TW': {} as never,
  en: {} as never,
}

beforeAll(async () => {
  const [zhCN, zhTW, en] = await Promise.all([
    import('../zh-CN'),
    import('../zh-TW'),
    import('../en'),
  ])
  rootMessages['zh-CN'] = zhCN.default as Record<string, unknown>
  rootMessages['zh-TW'] = zhTW.default as Record<string, unknown>
  rootMessages.en = en.default as Record<string, unknown>

  for (const lang of LOCALES) {
    moduleMessages[lang] = {} as never
    for (const m of MODULE_IDS) {
      const mod = await import(`../modules/${m}.${lang}.ts`)
      moduleMessages[lang][m] = mod.default as Record<string, unknown>
    }
  }
})

describe('AC15 · AI i18n 三语完整性', () => {
  describe('主 locale `ai.*` 30 条 key × 3 语', () => {
    for (const lang of LOCALES) {
      for (const path of ROOT_AI_PATHS) {
        it(`[${lang}] ${path}`, () => {
          const v = getPath(rootMessages[lang], path)
          expect(isPresent(v), `[${lang}] 缺失 ${path}`).toBe(true)
        })
      }
    }
  })

  describe('模块 settings.ts `section.{theme,language,ai}.*` × 3 语', () => {
    for (const lang of LOCALES) {
      for (const subPath of SETTINGS_AI_PATHS) {
        it(`[${lang}] settings.${subPath}`, () => {
          const v = getPath(moduleMessages[lang].settings, subPath)
          expect(isPresent(v), `[${lang}] 缺失 settings.${subPath}`).toBe(true)
        })
      }
    }
  })

  describe('8 模块 `<moduleId>.ai.preset.*` 共 36 条 × 3 语', () => {
    for (const lang of LOCALES) {
      for (const [moduleId, presetKeys] of Object.entries(MODULE_AI_PRESET_KEYS)) {
        for (const k of presetKeys) {
          const path = `ai.preset.${k}`
          it(`[${lang}] ${moduleId}.${path}`, () => {
            const v = getPath(
              moduleMessages[lang][moduleId as ModuleId],
              path,
            )
            expect(isPresent(v), `[${lang}] ${moduleId} 缺失 ${path}`).toBe(true)
          })
        }
      }
    }
  })

  describe('隐私页 AI 解读段 `privacyPage.sections[7]` × 3 语', () => {
    for (const lang of LOCALES) {
      it(`[${lang}] privacyPage.sections[7] 存在 + heading 含 AI`, () => {
        const sections = getPath(rootMessages[lang], 'privacyPage.sections') as
          | Array<{ heading: string; paragraphs?: string[]; list?: string[] }>
          | undefined
        expect(sections, `[${lang}] privacyPage.sections 缺失`).toBeDefined()
        expect(sections!.length, `[${lang}] privacyPage.sections 长度 < 8`).toBeGreaterThanOrEqual(8)
        const aiSection = sections![7]
        expect(isPresent(aiSection.heading), `[${lang}] sections[7].heading 空`).toBe(true)
        expect(isPresent(aiSection.list), `[${lang}] sections[7].list 空`).toBe(true)
        expect(aiSection.list!.length, `[${lang}] sections[7].list 不足 4 条`).toBeGreaterThanOrEqual(4)
      })
    }
  })
})
