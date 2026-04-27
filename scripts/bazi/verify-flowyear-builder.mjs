#!/usr/bin/env node
/**
 * 校验 buildFlowYears 能否正确接入 v2 schema
 *
 * 通过 esbuild bundle bazi 引擎入口为 ESM bundle，再 import 跑测试。
 *
 * Usage: node scripts/bazi/verify-flowyear-builder.mjs
 */

import { build } from 'esbuild'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '../..')

// 用 esbuild 把 bazi 引擎 bundle 成 ESM
const outFile = path.resolve(root, '.tmp/bazi-bundle.mjs')
fs.mkdirSync(path.dirname(outFile), { recursive: true })

await build({
  entryPoints: [path.resolve(root, 'src/modules/bazi/core/bazi.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  outfile: outFile,
  alias: {
    '@': path.resolve(root, 'src'),
  },
  loader: { '.ts': 'ts', '.json': 'json' },
  // 跳过 vue / 浏览器专用模块（bazi 引擎理论上是纯 ts，没有 vue 依赖）
  external: ['vue'],
  logLevel: 'error',
})

const mod = await import(pathToFileURL(outFile).toString())
const calculateBazi = mod.calculateBazi || mod.default?.calculateBazi
if (!calculateBazi) {
  console.error('❌ calculateBazi 未导出')
  process.exit(1)
}

// 用 5 个不同生日（对应不同 strength 档位）跑测试
const TEST_CASES = [
  { name: 'A', input: { year: 1995, month: 5, day: 16, hour: 14, minute: 30, gender: 'male' } },
  { name: 'B', input: { year: 1980, month: 1, day: 1, hour: 0, minute: 0, gender: 'female' } },
  { name: 'C', input: { year: 2000, month: 7, day: 15, hour: 23, minute: 30, gender: 'male' } },
  { name: 'D', input: { year: 1970, month: 11, day: 28, hour: 6, minute: 15, gender: 'female' } },
  { name: 'E', input: { year: 2005, month: 3, day: 9, hour: 12, minute: 0, gender: 'male' } },
]

let totalV2 = 0
let totalV1 = 0
const strengthSet = new Set()

for (const tc of TEST_CASES) {
  const chart = calculateBazi(tc.input)
  strengthSet.add(chart.strength)
  console.log(`\n📊 case ${tc.name}: ${tc.input.year}-${tc.input.month}-${tc.input.day} → 日主${chart.dayMaster}(${chart.dayMasterElement}) ${chart.strength}`)
  for (const fy of chart.flowYears.slice(0, 3)) {
    const hintShort = fy.hint.length > 50 ? fy.hint.substring(0, 50) + '...' : fy.hint
    console.log(`    ${fy.year}(${fy.ganzhi}) → ${hintShort}`)
    if (fy.hint.startsWith(`${fy.ganzhi}年`)) totalV2++
    else if (fy.hint.startsWith('本年')) totalV1++
  }
  // 还要把剩下 7 段也算进 v2/v1 命中率
  for (const fy of chart.flowYears.slice(3)) {
    if (fy.hint.startsWith(`${fy.ganzhi}年`)) totalV2++
    else if (fy.hint.startsWith('本年')) totalV1++
  }
}

const total = TEST_CASES.length * 10
console.log()
console.log(`v2 命中：${totalV2}/${total}`)
console.log(`v1 兜底：${totalV1}/${total}`)
console.log(`覆盖到的 strength 档位：${[...strengthSet].join(', ')}（共 ${strengthSet.size} 档）`)

if (totalV2 === total && strengthSet.size >= 2) {
  console.log(`✅ buildFlowYears 已 100% 走 v2 schema，且至少跨 2 档旺衰`)
  process.exit(0)
}

if (totalV1 > 0) {
  console.error(`❌ 有 ${totalV1} 段走了 v1 兜底`)
  process.exit(1)
}

console.error(`⚠️  hint 既不像 v1 也不像 v2，需人工排查`)
process.exit(1)
