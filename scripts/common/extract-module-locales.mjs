#!/usr/bin/env node
/**
 * Extract module namespace blocks from main locale files into per-module module files.
 *
 * For each module in MODULES_TO_EXTRACT × each locale in LOCALES:
 *   1) Read `src/locales/{locale}.ts` and locate `^\s{2}{moduleId}: \{`
 *   2) Walk forward via brace-counter to find the matching `^\s{2}\},$`
 *   3) Write the extracted body block (re-indented) to `src/locales/modules/{moduleId}.{locale}.ts`
 *      as `export default { ... }`
 *   4) Mutate the main locale by deleting the `{moduleId}: { ... },` block in-place
 *
 * Idempotent: if the module's namespace is no longer present in the main file,
 * the module is skipped (assumed already extracted).
 *
 * Usage:
 *   node scripts/common/extract-module-locales.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')

const MODULES_TO_EXTRACT = ['bazi', 'liuren', 'chenggu', 'lingqian', 'xingming', 'huangli', 'jiemeng']
const LOCALES = ['zh-CN', 'zh-TW', 'en']

/**
 * Find the line range [startLine, endLine] (1-indexed, inclusive) of the
 * `  {moduleId}: { ... },` namespace block in `text`.
 *
 * Returns null if the namespace is not found at column 2 with a top-level
 * `{moduleId}: {` opener.
 */
function findModuleBlockRange(text, moduleId) {
  const lines = text.split('\n')
  const opener = new RegExp(`^  ${moduleId}: \\{`)
  let startLine = -1
  for (let i = 0; i < lines.length; i++) {
    if (opener.test(lines[i])) {
      startLine = i + 1
      break
    }
  }
  if (startLine < 0) return null

  let endLine = -1
  for (let i = startLine; i < lines.length; i++) {
    if (lines[i] === '  },') {
      endLine = i + 1
      break
    }
  }
  if (endLine < 0) return null

  return [startLine, endLine]
}

/**
 * Extract module body lines and re-indent from 4-space (under main locale `  ${id}: { ... }`)
 * to 2-space (under `export default { ... }` in module file).
 *
 * Body = lines between `  ${id}: {` and `  },` exclusive (so we get the inner key:value lines).
 */
function extractAndReindent(allLines, startLine, endLine) {
  const inner = allLines.slice(startLine, endLine - 1)
  return inner
    .map((line) => (line.startsWith('    ') ? line.slice(2) : line))
    .join('\n')
}

let totalModulesExtracted = 0
let totalLinesShaved = 0

for (const moduleId of MODULES_TO_EXTRACT) {
  console.log(`\n--- ${moduleId} ---`)
  for (const locale of LOCALES) {
    const mainPath = join(ROOT, `src/locales/${locale}.ts`)
    const modulePath = join(ROOT, `src/locales/modules/${moduleId}.${locale}.ts`)
    const text = readFileSync(mainPath, 'utf8')
    const range = findModuleBlockRange(text, moduleId)
    if (!range) {
      console.log(`  [skip] ${locale}: ${moduleId} block not found (already extracted?)`)
      continue
    }
    const [startLine, endLine] = range
    const allLines = text.split('\n')

    const bodyContent = extractAndReindent(allLines, startLine, endLine)
    const moduleFileContent = `export default {\n${bodyContent}\n}\n`
    writeFileSync(modulePath, moduleFileContent, 'utf8')
    console.log(`  [write] modules/${moduleId}.${locale}.ts (${endLine - startLine + 1} src lines → ${moduleFileContent.split('\n').length} module lines)`)

    // Mutate main locale: drop lines [startLine, endLine] (1-indexed inclusive).
    const newLines = [...allLines.slice(0, startLine - 1), ...allLines.slice(endLine)]
    writeFileSync(mainPath, newLines.join('\n'), 'utf8')
    console.log(`  [shave] ${locale}.ts: ${allLines.length} → ${newLines.length} lines (-${allLines.length - newLines.length})`)
    totalLinesShaved += allLines.length - newLines.length
  }
  totalModulesExtracted++
}

console.log(`\n=== Summary ===`)
console.log(`Modules extracted: ${totalModulesExtracted}/${MODULES_TO_EXTRACT.length}`)
console.log(`Total main-locale lines shaved: ${totalLinesShaved}`)
console.log(`(across ${LOCALES.length} locales × ${MODULES_TO_EXTRACT.length} modules)`)
