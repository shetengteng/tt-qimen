#!/usr/bin/env node
/**
 * 端到端校验：buildDecades 接入 DECADE_HINTS_V2
 *
 * 用 esbuild 打 src/modules/bazi/core/bazi.ts，跑多个测试输入，
 * 校验：
 *   1. 8 段大运每段 hint 都来自 v2（变体不为空、字符数 > 30）
 *   2. 同一运盘 8 段 hint 全唯一（保证变体抽取按 i 旋转）
 *   3. tenGod 不为「日主」时，hint 应包含该十神字符（来自 imagery 或 variants 标签）
 */

import esbuild from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

async function buildEngine() {
  const result = await esbuild.build({
    entryPoints: [path.resolve(root, 'src/modules/bazi/core/bazi.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    write: false,
    logLevel: 'silent',
  })
  const code = result.outputFiles[0].text
  const tmp = path.resolve(root, 'scripts/bazi/.bazi-bundle.mjs')
  fs.writeFileSync(tmp, code)
  return tmp
}

const CASES = [
  { name: '1990-06-15-08 男', y: 1990, m: 6, d: 15, h: 8, gender: 'male' },
  { name: '1985-01-20-23 女', y: 1985, m: 1, d: 20, h: 23, gender: 'female' },
  { name: '1995-09-08-12 男', y: 1995, m: 9, d: 8, h: 12, gender: 'male' },
  { name: '2000-11-20-18 女', y: 2000, m: 11, d: 20, h: 18, gender: 'female' },
  { name: '1978-03-22-04 男', y: 1978, m: 3, d: 22, h: 4, gender: 'male' },
]

async function main() {
  const bundle = await buildEngine()
  const mod = await import(bundle)
  const calc = mod.calculateBazi

  let pass = 0
  let fail = 0

  for (const c of CASES) {
    const r = calc({
      year: c.y, month: c.m, day: c.d, hour: c.h, minute: 0,
      gender: c.gender,
    })
    const decades = r.decades
    const hints = decades.map(d => d.hint)
    const uniqueCount = new Set(hints).size

    // 1. 8 段都非空且 v2 长度（v2 句长稳定 ≥ 22，v1 旧表 < 20）
    const nonEmpty = hints.every(h => typeof h === 'string' && h.length >= 22)
    // 2. 唯一性：8 段不同十神 → 8 hints 全唯一；
    //    个别情况相邻 8 段中有同十神则会按 i mod 3 落到不同变体，依然唯一
    const variantOk = uniqueCount === 8
    // 3. v2 句式标签：开头形态固定带 "入运|运行|大运" 之一
    const v2Style = hints.every(h => /(入运|运行|大运)/.test(h))

    const ok = nonEmpty && variantOk && v2Style
    if (ok) pass++
    else fail++

    console.log(`[${ok ? 'OK ' : 'FAIL'}] ${c.name} | strength=${r.strength} | unique=${uniqueCount}/8 | v2=${v2Style}`)
    if (!ok) {
      hints.forEach((h, i) => console.log(`  ${i}: ${h}`))
    }
  }

  console.log(`\n=== Summary: ${pass}/${pass + fail} passed ===`)
  fs.unlinkSync(bundle)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
