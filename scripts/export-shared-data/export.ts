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

// 小六壬
import { PALACES_ORDER, PALACES, PALACE_JIXIONG } from '@/modules/liuren/data/palaces'

// 称骨
import {
  YEAR_WEIGHT,
  MONTH_WEIGHT,
  DAY_WEIGHT,
  HOUR_WEIGHT,
  HOUR_BRANCH_NAMES as CHENGGU_HOUR_NAMES,
  WEIGHT_MIN,
  WEIGHT_MAX,
} from '@/modules/chenggu/data/weights'
import { POEMS as CHENGGU_POEMS } from '@/modules/chenggu/data/poems'

// 老黄历
import { DUTY_MEANING } from '@/modules/huangli/data/dutyMeaning'
import { MATTER_KEYWORDS } from '@/modules/huangli/data/matterKeywords'
import { MATTER_ICONS, MATTER_ORDER } from '@/modules/huangli/data/matterIcons'

// 姓名学
import { NUMEROLOGY } from '@/modules/xingming/data/numerology'
import { KANGXI_CORRECTIONS } from '@/modules/xingming/data/strokesFallback'
import { COMPOUND_SURNAMES } from '@/modules/xingming/data/compoundSurnames'

// 周公解梦
import { DREAM_ENTRIES_GENERATED } from '@/modules/jiemeng/data/dreams.generated'
import { DREAM_CATEGORIES } from '@/modules/jiemeng/data/categories'
import { SENSITIVE_WORDS } from '@/modules/jiemeng/data/sensitiveWords'

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
// 小六壬数据
// ---------------------------------------------------------------------------

async function exportLiurenData(): Promise<void> {
  console.log('[liuren] palaces.json')
  await writeJson('liuren/palaces.json', {
    PALACES_ORDER,
    PALACE_JIXIONG,
    PALACES,
  })
}

// ---------------------------------------------------------------------------
// 称骨数据
// ---------------------------------------------------------------------------

async function exportChengguData(): Promise<void> {
  console.log('[chenggu] weights.json')
  await writeJson('chenggu/weights.json', {
    YEAR_WEIGHT,
    MONTH_WEIGHT,
    DAY_WEIGHT,
    HOUR_WEIGHT,
    HOUR_BRANCH_NAMES: CHENGGU_HOUR_NAMES,
    WEIGHT_MIN,
    WEIGHT_MAX,
  })

  console.log('[chenggu] poems.json')
  await writeJson('chenggu/poems.json', CHENGGU_POEMS)
}

// ---------------------------------------------------------------------------
// 老黄历数据
// ---------------------------------------------------------------------------

async function exportHuangliData(): Promise<void> {
  console.log('[huangli] dutyMeaning.json')
  await writeJson('huangli/dutyMeaning.json', DUTY_MEANING)

  console.log('[huangli] matterKeywords.json')
  await writeJson('huangli/matterKeywords.json', MATTER_KEYWORDS)

  console.log('[huangli] matterIcons.json')
  await writeJson('huangli/matterIcons.json', { MATTER_ICONS, MATTER_ORDER })
}

// ---------------------------------------------------------------------------
// 姓名学数据
// ---------------------------------------------------------------------------

async function exportXingmingData(): Promise<void> {
  console.log('[xingming] numerology.json')
  await writeJson('xingming/numerology.json', NUMEROLOGY)

  console.log('[xingming] kangxiCorrections.json')
  await writeJson('xingming/kangxiCorrections.json', KANGXI_CORRECTIONS)

  console.log('[xingming] compoundSurnames.json')
  await writeJson('xingming/compoundSurnames.json', COMPOUND_SURNAMES)
}

// ---------------------------------------------------------------------------
// 周公解梦数据
// ---------------------------------------------------------------------------

async function exportJiemengData(): Promise<void> {
  console.log('[jiemeng] dreams.json')
  await writeJson('jiemeng/dreams.json', DREAM_ENTRIES_GENERATED)

  console.log('[jiemeng] categories.json')
  await writeJson('jiemeng/categories.json', DREAM_CATEGORIES)

  console.log('[jiemeng] sensitiveWords.json')
  await writeJson('jiemeng/sensitiveWords.json', SENSITIVE_WORDS)
}

// ---------------------------------------------------------------------------
// 观音灵签数据（直接拷贝既有 JSON）
// ---------------------------------------------------------------------------

async function exportLingqianData(): Promise<void> {
  const srcPath = path.resolve(
    process.cwd(),
    'src/modules/lingqian/data/guanyin.json',
  )
  const destPath = path.join(SHARED_DATA_DIR, 'lingqian/guanyin.json')
  await fs.mkdir(path.dirname(destPath), { recursive: true })
  const content = await fs.readFile(srcPath, 'utf-8')
  const wrapped = {
    _meta: META,
    data: JSON.parse(content),
  }
  await fs.writeFile(destPath, JSON.stringify(wrapped, null, 2) + '\n', 'utf-8')
  console.log(`  ✓ ${destPath}`)
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
  await exportLiurenData()
  console.log('')
  await exportChengguData()
  console.log('')
  await exportHuangliData()
  console.log('')
  await exportXingmingData()
  console.log('')
  await exportJiemengData()
  console.log('')
  await exportLingqianData()
  console.log('')

  console.log('✓ 全部数据资产抽离完毕（P1：城市经度 + 8 模块共 22 表）')
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
