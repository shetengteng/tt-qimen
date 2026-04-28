#!/usr/bin/env node
/**
 * bazi + ziwei 排盘耗时实测探针（决策依据：是否需引入 Web Worker）
 *
 * 设计：
 *   - 5 个差异化生日样本（不同年代 / 性别 / 时辰 / 闰月 / 极端边界）
 *   - 每样本预热 5 次（避开 V8 JIT cold path），再正式跑 50 次
 *   - 报告 trim mean（去掉前后 10% 极值）+ p50 + p95 + max
 *   - 阈值：trim mean < 100ms 即"不需要 worker"（与文档共识对齐）
 *
 * Usage:
 *   node scripts/common/probe-perf-bazi-ziwei.mjs
 *   node scripts/common/probe-perf-bazi-ziwei.mjs --module bazi
 *   node scripts/common/probe-perf-bazi-ziwei.mjs --warmup 10 --runs 100
 */

import { build } from 'esbuild'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '../..')

// CLI 参数
const args = process.argv.slice(2)
const argMap = {}
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2)
    const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true'
    argMap[key] = val
  }
}
const TARGET = argMap.module ?? 'all'
const WARMUP = Number(argMap.warmup ?? 5)
const RUNS = Number(argMap.runs ?? 50)
const THRESHOLD_MS = Number(argMap.threshold ?? 100)

// 5 个差异化生日样本（全部公历，统一 calendar='solar'）
const SAMPLES = [
  { name: 'A 90 后男·夏', input: { calendar: 'solar', year: 1995, month: 5, day: 16, hour: 14, minute: 30, gender: 'male' } },
  { name: 'B 80 后女·子', input: { calendar: 'solar', year: 1980, month: 1, day: 1, hour: 0, minute: 0, gender: 'female' } },
  { name: 'C 千禧男·晚子', input: { calendar: 'solar', year: 2000, month: 7, day: 15, hour: 23, minute: 30, gender: 'male' } },
  { name: 'D 70 后女·辰', input: { calendar: 'solar', year: 1970, month: 11, day: 28, hour: 6, minute: 15, gender: 'female' } },
  { name: 'E 05 后男·午', input: { calendar: 'solar', year: 2005, month: 3, day: 9, hour: 12, minute: 0, gender: 'male' } },
]

/* ==================== bundle helpers ==================== */

async function bundleModule(entry, outName, externals = []) {
  const outFile = path.resolve(root, `.tmp/${outName}.mjs`)
  fs.mkdirSync(path.dirname(outFile), { recursive: true })

  await build({
    entryPoints: [path.resolve(root, entry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    outfile: outFile,
    alias: { '@': path.resolve(root, 'src') },
    loader: { '.ts': 'ts', '.json': 'json' },
    external: ['vue', ...externals],
    logLevel: 'error',
  })

  return await import(pathToFileURL(outFile).toString())
}

/* ==================== stat helpers ==================== */

function trimMean(arr, trimPct = 0.1) {
  const sorted = [...arr].sort((a, b) => a - b)
  const trimN = Math.floor(sorted.length * trimPct)
  const sliced = sorted.slice(trimN, sorted.length - trimN)
  return sliced.reduce((sum, v) => sum + v, 0) / sliced.length
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}

function fmt(ms) {
  return `${ms.toFixed(2)}ms`
}

/* ==================== module runner ==================== */

async function runModule(label, computeFn) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`  ${label} · 排盘性能实测（warmup ${WARMUP} × runs ${RUNS}）`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  const allTimes = []

  for (const sample of SAMPLES) {
    // 预热
    for (let i = 0; i < WARMUP; i++) {
      try {
        await computeFn(sample.input)
      } catch (e) {
        console.error(`   ⚠️  warmup error in ${sample.name}: ${e.message}`)
      }
    }

    // 正式
    const times = []
    for (let i = 0; i < RUNS; i++) {
      const t0 = performance.now()
      try {
        await computeFn(sample.input)
      } catch {
        // skip
      }
      times.push(performance.now() - t0)
    }

    const tm = trimMean(times)
    const p50 = percentile(times, 50)
    const p95 = percentile(times, 95)
    const max = Math.max(...times)
    allTimes.push(...times)

    const verdict = tm < THRESHOLD_MS ? '✅' : '⚠️'
    console.log(
      `  ${verdict} ${sample.name.padEnd(15)}  ` +
      `trim ${fmt(tm).padStart(10)}  ` +
      `p50 ${fmt(p50).padStart(10)}  ` +
      `p95 ${fmt(p95).padStart(10)}  ` +
      `max ${fmt(max).padStart(10)}`,
    )
  }

  const overallTm = trimMean(allTimes)
  const overallP95 = percentile(allTimes, 95)
  const overallMax = Math.max(...allTimes)

  console.log(`\n  ─────────────────────────────────────────────────`)
  const overallVerdict = overallTm < THRESHOLD_MS ? '✅' : '⚠️'
  console.log(
    `  ${overallVerdict} 总体           ` +
    `trim ${fmt(overallTm).padStart(10)}  ` +
    `p50 ${fmt(percentile(allTimes, 50)).padStart(10)}  ` +
    `p95 ${fmt(overallP95).padStart(10)}  ` +
    `max ${fmt(overallMax).padStart(10)}`,
  )

  return {
    label,
    trimMean: overallTm,
    p50: percentile(allTimes, 50),
    p95: overallP95,
    max: overallMax,
    threshold: THRESHOLD_MS,
    needsWorker: overallTm >= THRESHOLD_MS || overallP95 >= THRESHOLD_MS * 1.5,
  }
}

/* ==================== main ==================== */

async function main() {
  console.log(`\n📊 性能阈值：trim mean < ${THRESHOLD_MS}ms 视为"不需要 Web Worker"`)
  console.log(`📦 样本：${SAMPLES.length} 个差异化生日 × ${RUNS} 次正式 + ${WARMUP} 次预热\n`)

  const reports = []

  if (TARGET === 'all' || TARGET === 'bazi') {
    console.log(`📦 bundling bazi engine...`)
    const baziMod = await bundleModule('src/modules/bazi/core/bazi.ts', 'bazi-perf')
    const calculateBazi = baziMod.calculateBazi || baziMod.default?.calculateBazi
    if (!calculateBazi) {
      console.error('❌ calculateBazi 未导出'); process.exit(1)
    }
    reports.push(await runModule('bazi', (input) => calculateBazi(input)))
  }

  if (TARGET === 'all' || TARGET === 'ziwei') {
    console.log(`\n📦 bundling ziwei engine...`)
    const ziweiMod = await bundleModule('src/modules/ziwei/core/ziwei.ts', 'ziwei-perf')
    const buildZiweiChart = ziweiMod.buildZiweiChart || ziweiMod.default?.buildZiweiChart
    if (!buildZiweiChart) {
      console.error('❌ buildZiweiChart 未导出'); process.exit(1)
    }
    reports.push(await runModule('ziwei', async (input) => await buildZiweiChart(input)))
  }

  /* ==================== summary & recommendation ==================== */

  console.log(`\n\n═══════════════════════════════════════════════════════════════════`)
  console.log(`  Web Worker 决策建议`)
  console.log(`═══════════════════════════════════════════════════════════════════\n`)

  for (const r of reports) {
    const decision = r.needsWorker
      ? `🔴 推荐拆 worker（trim ${fmt(r.trimMean)} 或 p95 ${fmt(r.p95)} ≥ ${THRESHOLD_MS}ms）`
      : `🟢 不需要 worker（trim ${fmt(r.trimMean)} < ${THRESHOLD_MS}ms，符合既有产品决策）`
    console.log(`  ${r.label.padEnd(8)} → ${decision}`)
  }

  console.log()
}

main().catch((e) => {
  console.error('❌ 探针失败：', e)
  process.exit(1)
})
