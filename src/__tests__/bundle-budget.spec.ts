/**
 * P6-10：bundle 预算守门 spec
 *
 * 在 dist/ 目录存在的前提下，检查 AI 相关 chunk 的字节预算（gzipped 估算用 brotli-ish 80% 系数）。
 * 当超出预算时报警，避免无意识把大依赖打进 ai chunk 或入口。
 *
 * 跑法：先 `npm run build`，再 `npm test`；如果 dist 不存在则 spec 自动 skip。
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const DIST = join(process.cwd(), 'dist', 'assets')

interface ChunkBudget {
  pattern: RegExp
  /** gzipped 大小上限（字节） */
  maxGzip: number
  /** 必须存在 */
  required: boolean
}

const BUDGETS: readonly ChunkBudget[] = [
  { pattern: /^vendor-openai-[A-Za-z0-9_-]+\.js$/, maxGzip: 50 * 1024, required: true },
  { pattern: /^feat-ai-[A-Za-z0-9_-]+\.js$/, maxGzip: 110 * 1024, required: true },
  { pattern: /^vendor-vue-[A-Za-z0-9_-]+\.js$/, maxGzip: 60 * 1024, required: true },
]

/**
 * P6-10：真入口预算 —— 直接读 index.html 引用的 entry script，
 * 而不是 pattern 模糊匹配（避免和动态 import 的同名 chunk 冲突）。
 */
const ENTRY_BUDGET_GZIP = 30 * 1024

function gzipSize(file: string): number {
  return gzipSync(readFileSync(file)).length
}

const distExists = existsSync(DIST)

describe.runIf(distExists)('P6-10 bundle budget', () => {
  const files = readdirSync(DIST).filter((f) => f.endsWith('.js'))

  for (const budget of BUDGETS) {
    it(`chunk matching ${budget.pattern} is within ${budget.maxGzip / 1024} KB gzipped`, () => {
      const matches = files.filter((f) => budget.pattern.test(f))
      if (budget.required) {
        expect(matches.length, `expected at least one chunk matching ${budget.pattern}`).toBeGreaterThan(0)
      }
      for (const m of matches) {
        const full = join(DIST, m)
        const sizeRaw = statSync(full).size
        const sizeGz = gzipSize(full)
        if (sizeGz > budget.maxGzip) {
          throw new Error(
            `chunk ${m} = ${sizeRaw} bytes / ${sizeGz} bytes gzipped exceeds budget ${budget.maxGzip} bytes`,
          )
        }
        expect(sizeGz).toBeLessThanOrEqual(budget.maxGzip)
      }
    })
  }

  it('AI chunks are NOT modulepreloaded by index.html', () => {
    const indexHtmlPath = join(process.cwd(), 'dist', 'index.html')
    if (!existsSync(indexHtmlPath)) return
    const html = readFileSync(indexHtmlPath, 'utf8')
    const preloadMatches = html.match(/rel="modulepreload"\s+crossorigin\s+href="[^"]+"/g) ?? []
    const preloadedHrefs = preloadMatches.map((m) => m.match(/href="([^"]+)"/)?.[1] ?? '')
    for (const href of preloadedHrefs) {
      expect(href).not.toMatch(/vendor-openai/)
      expect(href).not.toMatch(/vendor-markstream/)
      expect(href).not.toMatch(/feat-ai/)
    }
  })

  it(`entry script (the <script src> in index.html) is within ${ENTRY_BUDGET_GZIP / 1024} KB gzipped`, () => {
    const indexHtmlPath = join(process.cwd(), 'dist', 'index.html')
    if (!existsSync(indexHtmlPath)) return
    const html = readFileSync(indexHtmlPath, 'utf8')
    const entryMatch = html.match(/<script[^>]+src="\/(?:[\w-]+\/)?assets\/([^"]+\.js)"/)
    expect(entryMatch?.[1], 'no entry script found in index.html').toBeTruthy()
    const entry = entryMatch![1]
    const entryFull = join(DIST, entry)
    const sizeGz = gzipSize(entryFull)
    if (sizeGz > ENTRY_BUDGET_GZIP) {
      throw new Error(
        `entry script ${entry} = ${sizeGz} bytes gzipped exceeds budget ${ENTRY_BUDGET_GZIP}`,
      )
    }
  })
})

describe.skipIf(distExists)('P6-10 bundle budget — skipped', () => {
  it('skipped because dist/ does not exist; run `npm run build` first', () => {
    expect(true).toBe(true)
  })
})
