#!/usr/bin/env node
/**
 * 周公解梦 · 词条数据构建脚本（公版古籍原料 → 结构化 DreamEntry）
 *
 * 职责（仅限数据工程，不改运行时代码）：
 *   1) 扫描 design/jiemeng/raw/NN-{category}.md （设计空间，人类可读原料）
 *   2) 按 `### {title}` 标题块解析每条词条（字段格式见 raw/README.md）
 *   3) dry-run 模式（--dry 或默认）：只输出校验报告，不写文件
 *   4) 生成模式（--emit）：写入 src/modules/jiemeng/data/dreams.generated.ts
 *      —— 注意：当前 core/jiemeng.ts 尚未切换到 generated 入口，
 *      生成文件会被 git 跟踪但不参与运行时，留作后续启用。
 *
 * 目录约定（与 design/bazi/ 同构）：
 *   design/jiemeng/raw/       人类编辑的原始语料（公版古籍）
 *   design/jiemeng/extracted/ 留作未来提取产物（本脚本暂未使用）
 *   src/modules/jiemeng/data/ 运行时代码（dreams.ts 手写 + dreams.generated.ts 产出）
 *
 * 设计约束（本轮范围最小化）：
 *   - 不依赖任何外部 npm 包，原生 Node >= 20
 *   - 不自动改写 dreams.ts（现有 38 条手写样本保留）
 *   - 分类映射固定 8 类，未知分类视为错误
 *
 * 用法：
 *   node scripts/jiemeng/build-dreams.mjs            # dry-run，校验并打印报告
 *   node scripts/jiemeng/build-dreams.mjs --dry
 *   node scripts/jiemeng/build-dreams.mjs --emit     # 生成 dreams.generated.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const RAW_DIR = path.join(ROOT, 'design', 'jiemeng', 'raw')
const OUT_FILE = path.join(ROOT, 'src', 'modules', 'jiemeng', 'data', 'dreams.generated.ts')

// ─────────────────────────────────────────────────────────────────────
// 1. 常量：8 大分类 & 语气标签（与 src/modules/jiemeng/types/index.ts 对齐）
// ─────────────────────────────────────────────────────────────────────

const CATEGORY_KEYS = /** @type {const} */ ([
  'animal', 'people', 'nature', 'body', 'life', 'ghost', 'building', 'other',
])
const TAG_KEYS = /** @type {const} */ (['auspicious', 'cautious', 'ambiguous', 'neutral'])

// 文件名前缀 → 分类 key，严格对齐 raw/ 下的 NN-{key}.md
const FILE_CATEGORY_MAP = {
  '01-animal.md':   'animal',
  '02-people.md':   'people',
  '03-nature.md':   'nature',
  '04-body.md':     'body',
  '05-life.md':     'life',
  '06-ghost.md':    'ghost',
  '07-building.md': 'building',
  '08-other.md':    'other',
}

// ─────────────────────────────────────────────────────────────────────
// 2. 解析：Markdown 词条块 → 内部结构
// ─────────────────────────────────────────────────────────────────────

/**
 * 把一个 md 文件的全文切成若干词条块
 *   每个词条以 `### {title}` 开头，直到下一个 `### ` 或 EOF
 * @param {string} md
 * @returns {Array<{ title: string, body: string }>}
 */
function splitEntries(md) {
  const lines = md.split(/\r?\n/)
  const entries = []
  let current = null
  for (const line of lines) {
    const m = /^###\s+(.+?)\s*$/.exec(line)
    if (m) {
      if (current) entries.push(current)
      current = { title: m[1].trim(), body: '' }
      continue
    }
    if (current) current.body += line + '\n'
  }
  if (current) entries.push(current)
  return entries
}

/**
 * 从词条正文中抽取 **field**: value 行
 * @param {string} body
 * @param {string} key 例如 "keywords" / "source" / "tags"
 * @returns {string | null}
 */
function pickMeta(body, key) {
  const re = new RegExp(`^\\*\\*${key}\\*\\*:\\s*(.+)$`, 'im')
  const m = re.exec(body)
  return m ? m[1].trim() : null
}

/**
 * 抽取正文（去掉 meta 行 + 顶部 / 尾部空白）
 * @param {string} body
 */
function pickClassical(body) {
  return body
    .split(/\r?\n/)
    .filter((l) => !/^\*\*(?:keywords|source|tags)\*\*:/i.test(l.trim()))
    .join('\n')
    .trim()
}

/**
 * title → stable id（中文友好）
 *   先拿"去除'梦见/梦'前缀的核心词"+ category 前缀，兜底用 hash
 * @param {string} title
 * @param {string} category
 */
function toId(title, category) {
  const core = title.replace(/^梦(?:见)?/u, '').trim()
  // 仅保留汉字 / 英文 / 数字，其他替换为 '-'，压缩连续 '-'
  const slug = core
    .replace(/[^\p{sc=Han}A-Za-z0-9]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return slug ? `${category}-${slug}` : `${category}-${title.length}-${Date.now().toString(36)}`
}

// ─────────────────────────────────────────────────────────────────────
// 3. 校验：逐条 lint 各 meta 字段
// ─────────────────────────────────────────────────────────────────────

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   category: string,
 *   keywords: string[],
 *   source: string,
 *   tags: string[],
 *   classical: string,
 *   _file: string,
 * }} ParsedEntry
 */

/**
 * @param {ParsedEntry} e
 * @returns {string[]} 错误列表（空数组表示通过）
 */
function lint(e) {
  const errs = []
  if (!e.title) errs.push('title 为空')
  if (!e.category || !CATEGORY_KEYS.includes(e.category)) errs.push(`category 非法: ${e.category}`)
  if (!e.keywords?.length) errs.push('keywords 为空')
  if (e.keywords?.length && e.keywords.length < 2) errs.push(`keywords 过少 (${e.keywords.length})，至少 2 个`)
  if (!e.classical) errs.push('classical 正文为空')
  if (e.tags?.length) {
    const bad = e.tags.filter((t) => !TAG_KEYS.includes(t))
    if (bad.length) errs.push(`tags 含非法值: ${bad.join(', ')}`)
  }
  return errs
}

// ─────────────────────────────────────────────────────────────────────
// 4. 生成 .ts（仅 --emit 模式）
// ─────────────────────────────────────────────────────────────────────

/** @param {string} s */
function escape(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

/** @param {ParsedEntry[]} entries */
function emitTs(entries) {
  const lines = []
  lines.push('/**')
  lines.push(' * 周公解梦 · 自动生成词条（由 scripts/jiemeng/build-dreams.mjs 构建）')
  lines.push(' *')
  lines.push(' * 数据源：design/jiemeng/raw/*.md（公版《周公解梦》古籍原文）')
  lines.push(' * 构建时间：' + new Date().toISOString())
  lines.push(' *')
  lines.push(' * ⚠ 请勿手动编辑。如需新增词条，请修改 raw/*.md 后重新运行 build-dreams.mjs。')
  lines.push(' * ⚠ 本文件当前尚未接入 core/jiemeng.ts，运行时仍使用手写 dreams.ts。')
  lines.push(' */')
  lines.push('')
  lines.push("import type { DreamEntry } from '../types'")
  lines.push('')
  lines.push('export const DREAM_ENTRIES_GENERATED: readonly DreamEntry[] = Object.freeze<DreamEntry[]>([')
  for (const e of entries) {
    lines.push('  {')
    lines.push(`    id: '${escape(e.id)}',`)
    lines.push(`    title: '${escape(e.title)}',`)
    lines.push(`    category: '${e.category}',`)
    lines.push(`    keywords: [${e.keywords.map((k) => `'${escape(k)}'`).join(', ')}],`)
    lines.push(`    summary: '${escape(e.classical.slice(0, 80).replace(/\n/g, ' '))}',`)
    lines.push(`    classical: '${escape(e.classical.replace(/\n+/g, ' '))}',`)
    lines.push(`    classicalSource: '${escape(e.source || '《周公解梦》公版古籍')}',`)
    lines.push('    modern: [],')
    if (e.tags.length) {
      lines.push(`    tags: [${e.tags.map((t) => `'${t}'`).join(', ')}],`)
    }
    lines.push('  },')
  }
  lines.push('])')
  lines.push('')
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────
// 5. 主流程
// ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2)
  const mode = args.includes('--emit') ? 'emit' : 'dry'

  if (!fs.existsSync(RAW_DIR)) {
    console.error(`✖ raw 目录不存在：${RAW_DIR}`)
    process.exit(1)
  }

  /** @type {ParsedEntry[]} */
  const all = []
  /** @type {{ file: string, title: string, errors: string[] }[]} */
  const bad = []
  const seenIds = new Map()
  /** @type {Record<string, number>} */
  const byCategory = Object.fromEntries(CATEGORY_KEYS.map((k) => [k, 0]))

  for (const file of Object.keys(FILE_CATEGORY_MAP)) {
    const full = path.join(RAW_DIR, file)
    if (!fs.existsSync(full)) {
      bad.push({ file, title: '<whole-file>', errors: ['文件缺失'] })
      continue
    }
    const md = fs.readFileSync(full, 'utf8')
    const category = FILE_CATEGORY_MAP[file]

    for (const raw of splitEntries(md)) {
      const keywordsStr = pickMeta(raw.body, 'keywords') ?? ''
      const tagsStr = pickMeta(raw.body, 'tags') ?? ''
      const source = pickMeta(raw.body, 'source') ?? ''
      const entry = {
        id: toId(raw.title, category),
        title: raw.title,
        category,
        keywords: keywordsStr.split(',').map((s) => s.trim()).filter(Boolean),
        source,
        tags: tagsStr.split(',').map((s) => s.trim()).filter(Boolean),
        classical: pickClassical(raw.body),
        _file: file,
      }

      const errors = lint(entry)
      if (seenIds.has(entry.id)) {
        errors.push(`id 重复: 与 "${seenIds.get(entry.id)}" 冲突`)
      } else {
        seenIds.set(entry.id, entry.title)
      }

      if (errors.length) {
        bad.push({ file, title: entry.title, errors })
      } else {
        all.push(entry)
        byCategory[category] += 1
      }
    }
  }

  // ──────── 报告 ────────
  console.log('─'.repeat(60))
  console.log(`周公解梦 · raw → DreamEntry 构建报告（mode=${mode}）`)
  console.log('─'.repeat(60))
  console.log(`词条总数：${all.length}`)
  console.log(`错误总数：${bad.length}`)
  console.log('')
  console.log('分类分布：')
  for (const k of CATEGORY_KEYS) {
    console.log(`  ${k.padEnd(10)} ${String(byCategory[k]).padStart(4)} 条`)
  }

  if (bad.length) {
    console.log('')
    console.log('─'.repeat(60))
    console.log('错误明细：')
    for (const item of bad) {
      console.log(`  [${item.file}] 《${item.title}》`)
      for (const e of item.errors) console.log(`     · ${e}`)
    }
  }

  // ──────── 产出 ────────
  if (mode === 'emit') {
    if (bad.length) {
      console.error('\n✖ 存在错误，已放弃写入 dreams.generated.ts，请修复后重试。')
      process.exit(2)
    }
    const ts = emitTs(all)
    fs.writeFileSync(OUT_FILE, ts, 'utf8')
    console.log(`\n✓ 已写入 ${path.relative(ROOT, OUT_FILE)}（${all.length} 条）`)
    console.log('  ⚠ 请注意：core/jiemeng.ts 当前仍使用手写 dreams.ts，未切换到 generated。')
  } else {
    console.log('')
    console.log(`(dry-run 模式；如需写入 dreams.generated.ts，请加 --emit)`)
  }

  if (bad.length) process.exit(2)
}

main()
