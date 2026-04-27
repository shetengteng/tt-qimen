#!/usr/bin/env node
/**
 * Diff zh-CN / zh-TW / en module i18n keys for ALL modules.
 * Reports keys that exist in zh-CN but missing in zh-TW or en (and vice versa).
 *
 * Reads from modular locale files at src/locales/modules/{moduleId}.{lang}.ts
 * (each file's `export default { ... }` body).
 *
 * Usage:
 *   node scripts/common/diff-i18n-keys.mjs                # diff all 8 modules
 *   node scripts/common/diff-i18n-keys.mjs ziwei bazi     # diff specific modules
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const MODULES_DIR = join(ROOT, 'src/locales/modules')

const ALL_MODULES = [
  'ziwei',
  'bazi',
  'liuren',
  'chenggu',
  'lingqian',
  'xingming',
  'huangli',
  'jiemeng',
]

const LOCALES = ['zh-CN', 'zh-TW', 'en']

/**
 * Extract the `export default { ... }` body block from a module locale file.
 */
function extractModuleBlock(text) {
  const idx = text.search(/^export\s+default\s*\{/m)
  if (idx < 0) return null
  let depth = 0
  let start = -1
  for (let i = idx; i < text.length; i++) {
    const c = text[i]
    if (c === '{') {
      if (depth === 0) start = i
      depth++
    } else if (c === '}') {
      depth--
      if (depth === 0) {
        return text.slice(start, i + 1)
      }
    }
  }
  return null
}

/**
 * Walk a brace-balanced TS object literal block and yield dotted key paths
 * for every `key: value` occurrence (handles nested objects).
 */
function flattenKeys(block) {
  const result = []
  const body = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}'))
  walk(body, '', result)
  return result.sort()
}

function walk(text, prefix, out) {
  let i = 0
  let depth = 0
  while (i < text.length) {
    const c = text[i]
    if (c === '"' || c === "'" || c === '`') {
      i = skipString(text, i)
      continue
    }
    if (c === '/' && text[i + 1] === '/') {
      i = text.indexOf('\n', i)
      if (i < 0) i = text.length
      else i++
      continue
    }
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      i = end < 0 ? text.length : end + 2
      continue
    }
    if (c === '{') depth++
    else if (c === '}') depth--
    if (depth === 0 && /[A-Za-z_$]/.test(c)) {
      const m = /^([A-Za-z_$][\w$]*)\s*:/.exec(text.slice(i))
      if (m) {
        const name = m[1]
        i += m[0].length
        while (i < text.length && /\s/.test(text[i])) i++
        if (text[i] === '{') {
          const start = i
          let d = 0
          for (; i < text.length; i++) {
            const cc = text[i]
            if (cc === '"' || cc === "'" || cc === '`') {
              i = skipString(text, i) - 1
              continue
            }
            if (cc === '{') d++
            else if (cc === '}') {
              d--
              if (d === 0) {
                i++
                break
              }
            }
          }
          const inner = text.slice(start + 1, i - 1)
          walk(inner, prefix ? `${prefix}.${name}` : name, out)
        } else {
          out.push(prefix ? `${prefix}.${name}` : name)
          let d = 0
          while (i < text.length) {
            const cc = text[i]
            if (cc === '"' || cc === "'" || cc === '`') {
              i = skipString(text, i)
              continue
            }
            if (cc === '{' || cc === '[') d++
            else if (cc === '}' || cc === ']') {
              if (d === 0) break
              d--
            } else if (cc === ',' && d === 0) {
              i++
              break
            }
            i++
          }
        }
        continue
      }
    }
    i++
  }
}

function skipString(text, i) {
  const quote = text[i]
  i++
  while (i < text.length) {
    const c = text[i]
    if (c === '\\') {
      i += 2
      continue
    }
    if (c === quote) return i + 1
    i++
  }
  return text.length
}

function diffModule(moduleId) {
  const sets = {}
  for (const locale of LOCALES) {
    const path = join(MODULES_DIR, `${moduleId}.${locale}.ts`)
    if (!existsSync(path)) {
      console.error(`[ERROR] ${moduleId}: ${locale} file not found at ${path}`)
      return -1
    }
    const text = readFileSync(path, 'utf8')
    const block = extractModuleBlock(text)
    if (!block) {
      console.error(`[ERROR] ${moduleId}/${locale}: export default block not found`)
      return -1
    }
    sets[locale] = new Set(flattenKeys(block))
  }

  const refLocale = 'zh-CN'
  const refKeys = sets[refLocale]
  let issues = 0
  const lines = []
  lines.push(`\n=== [${moduleId}] ===`)
  lines.push(`  [ref] ${refLocale}: ${refKeys.size} keys`)

  for (const locale of ['zh-TW', 'en']) {
    const keys = sets[locale]
    const missing = [...refKeys].filter(k => !keys.has(k)).sort()
    const extra = [...keys].filter(k => !refKeys.has(k)).sort()
    if (missing.length === 0 && extra.length === 0) {
      lines.push(`  [${locale}] ${keys.size} keys · OK aligned`)
    } else {
      lines.push(`  [${locale}] ${keys.size} keys`)
      if (missing.length > 0) {
        lines.push(`    missing (in ${refLocale} but not in ${locale}): ${missing.length}`)
        missing.forEach(k => lines.push(`      - ${k}`))
        issues += missing.length
      }
      if (extra.length > 0) {
        lines.push(`    extra (in ${locale} but not in ${refLocale}): ${extra.length}`)
        extra.forEach(k => lines.push(`      + ${k}`))
        issues += extra.length
      }
    }
  }

  console.log(lines.join('\n'))
  return issues
}

const args = process.argv.slice(2)
const targets = args.length > 0 ? args : ALL_MODULES

console.log(`[i18n-diff] checking ${targets.length} module(s): ${targets.join(', ')}`)

let totalIssues = 0
let totalErrors = 0
for (const moduleId of targets) {
  const result = diffModule(moduleId)
  if (result < 0) totalErrors++
  else totalIssues += result
}

console.log(`\n${'='.repeat(50)}`)
if (totalErrors > 0) {
  console.error(`[FAIL] ${totalErrors} module(s) failed to load`)
  process.exit(2)
}
if (totalIssues > 0) {
  console.error(`[FAIL] ${totalIssues} key mismatch(es) across ${targets.length} module(s)`)
  process.exit(1)
}
console.log(`[OK] ${targets.length} module(s) all aligned across ${LOCALES.length} locales`)
