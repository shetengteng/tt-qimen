#!/usr/bin/env node
/**
 * 校验：DECADE_HINTS_V2 必须包含 100 个键
 * 维度：10 十神 × 5 旺衰 × 2 取向
 *
 * 不执行 ts，直接以纯文本方式解析 DECADE_HINTS_V2 体内的 key。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')
const TARGET = path.resolve(root, 'src/modules/bazi/data/fortuneHints.ts')

const TEN_GODS = ['比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印']
const STRENGTHS = ['极旺', '偏旺', '中和', '偏弱', '极弱']
const STANCES = ['follow', 'oppose']

function expectedKeys() {
  const keys = []
  for (const tg of TEN_GODS) {
    for (const st of STRENGTHS) {
      for (const sn of STANCES) {
        keys.push(`${tg}_${st}_${sn}`)
      }
    }
  }
  return keys
}

function extractActualKeys(content) {
  const start = content.indexOf('DECADE_HINTS_V2: Record<string, DecadeHintV2>')
  if (start < 0) {
    throw new Error('DECADE_HINTS_V2 not found in target')
  }
  const after = content.slice(start)
  const open = after.indexOf('{')
  // 匹配大括号块（含变体内的 {，需要平衡）
  let depth = 0
  let end = -1
  for (let i = open; i < after.length; i++) {
    const ch = after[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }
  if (end < 0) throw new Error('unterminated DECADE_HINTS_V2 block')
  const body = after.slice(open + 1, end)
  // 顶层 key（每行格式：  比肩_极旺_follow: { ...）
  // 由于 variants 内的 ":" 也在 block 内，但顶层 key 一定独占一行且首字符为 TenGod 中文字符
  const keyRe = /^\s{2}([比劫食伤正偏七杀印][^_\s]+_[^_\s]+_(?:follow|oppose)):\s*\{/gm
  const keys = []
  let m
  while ((m = keyRe.exec(body)) !== null) keys.push(m[1])
  return keys
}

function main() {
  const content = fs.readFileSync(TARGET, 'utf-8')
  const expected = expectedKeys()
  const actual = extractActualKeys(content)
  const expectedSet = new Set(expected)
  const actualSet = new Set(actual)

  const missing = expected.filter(k => !actualSet.has(k))
  const extra = actual.filter(k => !expectedSet.has(k))
  const dup = actual.length !== actualSet.size

  console.log(`expected: ${expected.length}`)
  console.log(`actual:   ${actual.length}`)
  console.log(`missing:  ${missing.length}`)
  console.log(`extra:    ${extra.length}`)
  console.log(`dup:      ${dup}`)
  if (missing.length) {
    console.log('--- missing (first 10) ---')
    console.log(missing.slice(0, 10).join('\n'))
  }
  if (extra.length) {
    console.log('--- extra (first 10) ---')
    console.log(extra.slice(0, 10).join('\n'))
  }

  if (missing.length === 0 && extra.length === 0 && actual.length === 100 && !dup) {
    console.log('OK: 100/100 coverage')
    process.exit(0)
  }
  console.log('FAIL')
  process.exit(1)
}

main()
