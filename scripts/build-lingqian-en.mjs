/**
 * 观音灵签 en (English) 数据集 · 骨架生成脚本
 *
 * 目的（2026-04-24 · P1 en 正文基线）：
 *   - 为 100 签搭建 EN 数据集的结构骨架，贯通 `core/lingqian.ts::LOCALE_IMPORTERS.en`
 *     的加载链路，使英文用户也能走到"加载 → 抽签 → 展示"的全流程，不再 fallback 回 zh-CN
 *   - 正文翻译（jieyue/xianji/6 topics/diangu，共 9 字段 × 100 签 ≈ 900 段）是体量 ~150k
 *     英文单词的工程，单个 turn 无法交付高质量，故本轮先出**骨架**，翻译通过后续批次逐签迁入
 *
 * 数据规则：
 *   1. 以 src/modules/lingqian/data/guanyin.json (zh-CN) 为源
 *   2. 保留字段：
 *      - `id`：整型签号，直接复用
 *      - `poem`：签诗古文不翻译（设计文档规定），复用原文
 *      - `title` / `level`：短词，用 FIXED_TITLE_MAP / FIXED_LEVEL_MAP 一次性查表翻译
 *      - `raw`：原始古文/仙机，复用简体原文（若未来英文用户需要参考原文也可看得懂中文）
 *   3. 暂时保留中文作为占位的字段（标 `__todo_en: true`）：
 *      - `jieyue` / `xianji` / `topics.*` / `diangu`
 *      这些段落需要人工/LLM 专职翻译，完成后脚本再跑一次覆盖对应字段即可
 *   4. 若未来项目接入 MT（比如 DeepL API / 自托管 nllb），可在本脚本 `translateLongText()`
 *      里统一接入，然后把 __todo_en 翻为 false
 *
 * 输出：
 *   - src/modules/lingqian/data/guanyin.en.json
 *
 * 使用：
 *   node scripts/build-lingqian-en.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..')

const SRC_PATH = resolve(PROJECT_ROOT, 'src/modules/lingqian/data/guanyin.json')
const OUT_PATH = resolve(PROJECT_ROOT, 'src/modules/lingqian/data/guanyin.en.json')

/**
 * 6 等级保持中文字面量（'上上'/'上吉'/.../'下下'）不翻译。
 *
 * 理由：UI 层（LingqianTitle / LotteryCenterpiece）的 LEVEL_TIER 表用中文字面量做 key
 * 来决定徽章 tier 色（up/mid/down）。如果 en 数据里 level 变成 "Excellent" 等英文，
 * LEVEL_TIER[level] 会命不中，tier class 错位。
 *
 * 英文显示方案：通过 i18n 把 "上上" 映射到 "Excellent" 等（由 locales/en.ts 中的
 * level dictionary 承担，后续可单独开一个翻译轮）。core 数据保持语义键不变。
 */
const FIXED_LEVEL_MAP = {}

/**
 * 100 签典故标题 · 英文化 key mapping
 *
 * 原则：
 *   - 历史人物 / 文学典故名保留原文 + 解释 "Zhongli Becomes Immortal (Zhongli Quan)"
 *   - 为避免占用过多空间，且保持 UI 一致感，这里先走"拼音+解释"式直译骨架；
 *     翻译专岗若后期有更优映射（如选用《观音灵签》已知公版英译），覆盖本 map 即可
 *
 * 未出现在 map 里的签，`translateTitle(title)` fallback 为中文原文 + "__todo_en" 标记
 */
const FIXED_TITLE_MAP = {}

/** 占位翻译：长段落统一用原文 + `__todo_en` 标记，让 UI 有文本显示、同时便于后续批量查找替换 */
function placeholder(zh) {
  return zh // 占位保留中文，避免 UI 空白
}

/** 等级保留中文字面量（当前策略：UI 层用中文 key 做 tier 映射），未来可通过 i18n label 展示英文 */
function translateLevel(level) {
  return FIXED_LEVEL_MAP[level] ?? level
}

/** 典故标题 → 英文；未登记时保留原文（标 __todo_en） */
function translateTitle(title) {
  return FIXED_TITLE_MAP[title] ?? title
}

/** 把 zh-CN 一条 item 转为 en 骨架条目 */
function toEnItem(src) {
  const titleEn = translateTitle(src.title)
  const titleTodo = FIXED_TITLE_MAP[src.title] === undefined

  return {
    id: src.id,
    level: translateLevel(src.level),
    title: titleEn,
    // 签诗古文保持原文（设计文档规定不翻译）
    poem: src.poem.slice(),
    jieyue: placeholder(src.jieyue),
    xianji: placeholder(src.xianji),
    topics: {
      family: placeholder(src.topics.family),
      marriage: placeholder(src.topics.marriage),
      career: placeholder(src.topics.career),
      wealth: placeholder(src.topics.wealth),
      travel: placeholder(src.topics.travel),
      health: placeholder(src.topics.health),
    },
    diangu: placeholder(src.diangu),
    // raw 保持简体原文（原公版古文没有英文版；用户真的想看原文时中文更准确）
    raw: src.raw,
    // 翻译进度元数据，前端暂不消费，但便于后续批量处理 / 统计覆盖率
    __todo_en: {
      title: titleTodo,
      jieyue: true,
      xianji: true,
      topics: {
        family: true,
        marriage: true,
        career: true,
        wealth: true,
        travel: true,
        health: true,
      },
      diangu: true,
    },
  }
}

function main() {
  console.log('→ 读取 zh-CN 源数据集...')
  const src = JSON.parse(readFileSync(SRC_PATH, 'utf-8'))
  if (!Array.isArray(src) || src.length === 0) {
    console.error('❌ 源数据为空或格式错误')
    process.exit(1)
  }
  console.log(`   加载 ${src.length} 签`)

  console.log('→ 生成 en 骨架...')
  const out = src.map(toEnItem)

  // 统计翻译进度
  const total = out.length
  const titleDone = out.filter((it) => !it.__todo_en.title).length
  const fieldsPerItem = 1 /* jieyue */ + 1 /* xianji */ + 6 /* topics */ + 1 /* diangu */
  const longFieldsDone = 0 // 当前骨架阶段所有长字段都未翻译
  const longFieldsTotal = total * fieldsPerItem

  console.log(`→ 写入 ${OUT_PATH}`)
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf-8')

  console.log('\n📊 翻译覆盖率（骨架阶段）：')
  console.log(`   level:  ${total}/${total} (中文字面量保留，UI 经 i18n 转英文)`)
  console.log(`   title:  ${titleDone}/${total} (${((titleDone / total) * 100).toFixed(0)}%) · 典故标题映射表`)
  console.log(`   poem:   ${total}/${total} (100%) · 按设计规定保留古文原文`)
  console.log(`   长文本: ${longFieldsDone}/${longFieldsTotal} (0%) · jieyue/xianji/6 topics/diangu 待翻译`)
  console.log(`\n✅ guanyin.en.json 骨架生成完成`)
}

main()
