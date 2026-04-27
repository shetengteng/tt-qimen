#!/usr/bin/env node
/**
 * 静态校验：BirthForm 简化后 onPaipan 推导逻辑（无 UI，纯 model）
 *
 * 通过模拟 birthplaceKey/CITY_LONGITUDE 关系，校验：
 *   1. 选了城市 → longitude = CITY_LONGITUDE[key], birthplace = key
 *   2. 没选（''）→ longitude = undefined, birthplace = undefined
 *   3. shouldShowBirthplace=false → 即便有 birthplaceKey，longitude/birthplace 都为 undefined
 */

import esbuild from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

async function buildLib() {
  const result = await esbuild.build({
    entryPoints: [path.resolve(root, 'src/lib/trueSolarTime.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    write: false,
    logLevel: 'silent',
  })
  const tmp = path.resolve(root, 'scripts/common/.true-solar-bundle.mjs')
  fs.writeFileSync(tmp, result.outputFiles[0].text)
  return tmp
}

function deriveLongitude({ shouldShowBirthplace, birthplaceKey, CITY_LONGITUDE }) {
  let longitude
  let birthplace
  if (shouldShowBirthplace && birthplaceKey) {
    longitude = CITY_LONGITUDE[birthplaceKey]
    birthplace = birthplaceKey
  }
  return { longitude, birthplace }
}

const CASES = [
  {
    name: '选北京',
    input: { shouldShowBirthplace: true, birthplaceKey: 'beijing' },
    expect: { longitude: 116.41, birthplace: 'beijing' },
  },
  {
    name: '选上海',
    input: { shouldShowBirthplace: true, birthplaceKey: 'shanghai' },
    expect: { longitude: 121.47, birthplace: 'shanghai' },
  },
  {
    name: '不选 (空)',
    input: { shouldShowBirthplace: true, birthplaceKey: '' },
    expect: { longitude: undefined, birthplace: undefined },
  },
  {
    name: 'showBirthplace=false 即使选过也透传 undefined',
    input: { shouldShowBirthplace: false, birthplaceKey: 'beijing' },
    expect: { longitude: undefined, birthplace: undefined },
  },
  {
    name: '台北（繁体常用）',
    input: { shouldShowBirthplace: true, birthplaceKey: 'taipei' },
    expect: { longitude: 121.56, birthplace: 'taipei' },
  },
  {
    name: '香港',
    input: { shouldShowBirthplace: true, birthplaceKey: 'hongkong' },
    expect: { longitude: 114.17, birthplace: 'hongkong' },
  },
]

async function main() {
  const bundle = await buildLib()
  const mod = await import(bundle)
  const CITY_LONGITUDE = mod.CITY_LONGITUDE

  let pass = 0
  let fail = 0

  for (const c of CASES) {
    const got = deriveLongitude({ ...c.input, CITY_LONGITUDE })
    const ok =
      got.longitude === c.expect.longitude &&
      got.birthplace === c.expect.birthplace
    if (ok) pass++
    else fail++
    const status = ok ? 'OK ' : 'FAIL'
    console.log(`[${status}] ${c.name}`)
    if (!ok) {
      console.log(`  expected: ${JSON.stringify(c.expect)}`)
      console.log(`  got:      ${JSON.stringify(got)}`)
    }
  }

  console.log(`\nCity coverage: ${Object.keys(CITY_LONGITUDE).length} keys`)
  console.log(`=== Summary: ${pass}/${pass + fail} passed ===`)
  fs.unlinkSync(bundle)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
