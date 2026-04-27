#!/usr/bin/env node
/**
 * 校验 FLOW_YEAR_HINTS_V2 是否 100% 覆盖 60 甲子 × 5 旺衰 = 300 段
 *
 * 通过 ripgrep / 静态文本读取 ts 源文件中的 key，避免在 Node 中跑 ts。
 *
 * Usage: node scripts/bazi/verify-flowyear-v2-coverage.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================================
// 60 甲子 + 5 旺衰
// ============================================================

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function buildSixtyCycle() {
  const list = []
  for (let i = 0; i < 60; i++) {
    list.push(STEMS[i % 10] + BRANCHES[i % 12])
  }
  return list
}

const STRENGTHS = ['极旺', '偏旺', '中和', '偏弱', '极弱']

// ============================================================
// 解析 flowYearHints.ts，提取 v2 表中的所有 key
// ============================================================

const tsFile = path.resolve(__dirname, '../../src/modules/bazi/data/flowYearHints.ts')
const content = fs.readFileSync(tsFile, 'utf-8')

const v2StartMarker = 'export const FLOW_YEAR_HINTS_V2: Record<string, FlowYearHint> = {'
const v2StartIdx = content.indexOf(v2StartMarker)
if (v2StartIdx < 0) {
  console.error('❌ FLOW_YEAR_HINTS_V2 未找到')
  process.exit(1)
}
const tail = content.substring(v2StartIdx + v2StartMarker.length)
const v2EndIdx = tail.indexOf('\n}')
const v2Body = tail.substring(0, v2EndIdx)

const keyPattern = /^\s{2}([\u4e00-\u9fa5]{2}_[\u4e00-\u9fa5]{2}):\s*\{/gm
const v2Keys = new Set()
let m
while ((m = keyPattern.exec(v2Body)) !== null) {
  v2Keys.add(m[1])
}

console.log(`📊 v2 表 key 总数：${v2Keys.size}`)

// ============================================================
// 校验：60 甲子 × 5 旺衰 = 300 段是否全部覆盖
// ============================================================

const cycles = buildSixtyCycle()
const expectedKeys = []
for (const cycle of cycles) {
  for (const strength of STRENGTHS) {
    expectedKeys.push(`${cycle}_${strength}`)
  }
}

console.log(`🎯 期望 key 数：${expectedKeys.length}`)

const missing = expectedKeys.filter(k => !v2Keys.has(k))
const extra = [...v2Keys].filter(k => !expectedKeys.includes(k))

if (missing.length === 0 && extra.length === 0 && v2Keys.size === expectedKeys.length) {
  console.log(`✅ 100% 覆盖：60 甲子 × 5 旺衰 = ${expectedKeys.length} 段`)
  process.exit(0)
}

if (missing.length > 0) {
  console.error(`\n❌ 缺失 ${missing.length} 段：`)
  console.error(missing.slice(0, 10).join(', ') + (missing.length > 10 ? ` ... +${missing.length - 10} more` : ''))
}
if (extra.length > 0) {
  console.error(`\n⚠️  多余 ${extra.length} 段（不在期望范围）：`)
  console.error(extra.slice(0, 10).join(', ') + (extra.length > 10 ? ` ... +${extra.length - 10} more` : ''))
}
process.exit(1)
