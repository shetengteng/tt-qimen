/**
 * 数据资产抽离脚本：把 tt-qimen 内 modules 下的数据从 TS 序列化为 JSON，
 * 输出到 tt-qimen-skills/shared/qimen_shared/data/ 供 8 个 Skill 共用。
 *
 * 设计原则（来自 design/2026-04-30-10-技术方案.md §6）：
 *   - 单源约定：所有 Skill 用到的数据 = tt-qimen 数据 → JSON 派生
 *   - 一次导出 = 一个版本号，方便 CI 检测漂移
 *   - 字段命名保持 ts 原貌，不做"snake_case 化"
 *
 * 当前抽取的数据（按 PoC 优先级）：
 *   P1.1（八字 PoC 必需）：
 *     - city-longitude.json
 *     - bazi/{tenGods, nayin, interpretTemplate, fortuneHints,
 *            flowYearHints, shenshaMeaning, patternLongInterpret}.json
 *
 *   后续阶段会扩展到其他 7 个模块的 30+ 张表。
 *
 * 运行：
 *   cd tt-divination
 *   npx tsx scripts/export-shared-data/export.ts
 */

import { promises as fs } from 'fs'
import * as path from 'path'

import { CITY_LONGITUDE } from '@/lib/trueSolarTime'

import { TEN_GOD_INFO } from '@/modules/bazi/data/tenGods'
import { NAYIN_MEANING } from '@/modules/bazi/data/nayin'
import {
  PARAGRAPH_1_TEMPLATE,
  PARAGRAPH_2_TEMPLATE,
  STRENGTH_DESC,
  PATTERN_DEFAULT,
  ELEMENT_TIPS,
} from '@/modules/bazi/data/interpretTemplate'
import { SHENSHA_MEANING } from '@/modules/bazi/data/shenshaMeaning'

// ---------------------------------------------------------------------------
// 路径
// ---------------------------------------------------------------------------

const SHARED_DATA_DIR = path.resolve(
  process.cwd(),
  '../tt-qimen-skills/shared/qimen_shared/data',
)

const META = {
  source: `tt-divination@${new Date().toISOString().slice(0, 10)}`,
  exportedAt: new Date().toISOString(),
  version: '0.1.0',
}

async function writeJson(relPath: string, data: unknown): Promise<void> {
  const fullPath = path.join(SHARED_DATA_DIR, relPath)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  const wrapped = {
    _meta: META,
    data,
  }
  await fs.writeFile(fullPath, JSON.stringify(wrapped, null, 2) + '\n', 'utf-8')
  console.log(`  ✓ ${fullPath}`)
}

// ---------------------------------------------------------------------------
// 城市经度（35 城）
// ---------------------------------------------------------------------------

async function exportCityLongitude(): Promise<void> {
  console.log('[shared] city-longitude.json')
  await writeJson('city-longitude.json', CITY_LONGITUDE)
}

// ---------------------------------------------------------------------------
// 八字数据
// ---------------------------------------------------------------------------

async function exportBaziData(): Promise<void> {
  console.log('[bazi] tenGods.json')
  await writeJson('bazi/tenGods.json', TEN_GOD_INFO)

  console.log('[bazi] nayin.json')
  await writeJson('bazi/nayin.json', NAYIN_MEANING)

  console.log('[bazi] interpretTemplate.json')
  await writeJson('bazi/interpretTemplate.json', {
    PARAGRAPH_1_TEMPLATE,
    PARAGRAPH_2_TEMPLATE,
    STRENGTH_DESC,
    PATTERN_DEFAULT,
    ELEMENT_TIPS,
  })

  console.log('[bazi] shenshaMeaning.json')
  await writeJson('bazi/shenshaMeaning.json', SHENSHA_MEANING)

  const { DECADE_HINTS, DECADE_HINTS_V2 } = await import('@/modules/bazi/data/fortuneHints')
  console.log('[bazi] decadeHints.json')
  await writeJson('bazi/decadeHints.json', { v1: DECADE_HINTS, v2: DECADE_HINTS_V2 })

  const { FLOW_YEAR_HINTS, FLOW_YEAR_HINTS_V2 } = await import('@/modules/bazi/data/flowYearHints')
  console.log('[bazi] flowYearHints.json')
  await writeJson('bazi/flowYearHints.json', { v1: FLOW_YEAR_HINTS, v2: FLOW_YEAR_HINTS_V2 })

  const { PATTERN_LONG_INTERPRET } = await import('@/modules/bazi/data/patternLongInterpret')
  console.log('[bazi] patternLongInterpret.json')
  await writeJson('bazi/patternLongInterpret.json', PATTERN_LONG_INTERPRET)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('=== 抽离 tt-qimen 数据资产到 qimen-shared ===')
  console.log(`输出目录：${SHARED_DATA_DIR}`)
  console.log(`版本：${META.version}`)
  console.log('')

  await exportCityLongitude()
  console.log('')
  await exportBaziData()
  console.log('')

  console.log('✓ 全部数据资产抽离完毕（P1.1：城市经度 + 八字 7 表）')
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
