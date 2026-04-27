#!/usr/bin/env node
/**
 * 八字大运模板 v2 生成器
 *
 * 维度：10 十神 × 5 旺衰 × 2 取向（顺势/逆势）= 100 段
 *      每段提供 3 句变体（句式/措辞不同）
 *
 * 生成原则（参考《滴天髓·岁运》《三命通会·卷四·论行运》纲要）：
 *   - 十神固有意象（核心不变）：比肩=同辈合作 / 食神=才艺口福 / 七杀=权威决断 …
 *   - 顺势 = 大运十神有利于当前日主旺衰（身弱遇印比 / 身旺遇官杀食伤）
 *     · 主调：利可主动、机遇显发、宜借势开拓
 *   - 逆势 = 大运十神不利于当前日主旺衰（身弱遇官杀财耗 / 身旺遇印比再扶）
 *     · 主调：宜守宜防、化险为夷、低调蓄势
 *   - 旺衰对策叠加：
 *     · 极旺顺势 → 仍宜泄秀，避盛极而衰
 *     · 极旺逆势 → 大压顶，宜借力转化
 *     · 偏旺顺势 → 顺势可乘但留余地
 *     · 偏旺逆势 → 主修身养性、避锋芒
 *     · 中和顺势 → 稳健精进
 *     · 中和逆势 → 平稳过渡
 *     · 偏弱顺势 → 借力上升
 *     · 偏弱逆势 → 宜守不宜攻
 *     · 极弱顺势 → 急时甘霖，珍惜机会
 *     · 极弱逆势 → 强敌压境，宜保命守身
 *   - 文笔："宜/防/可/利/主"等缓和措辞，避免"必/绝对"
 *   - 3 变体：开头句式不同（"X 入运" / "运行 X" / "X 大运"），后半旨意相同但措辞略变
 *
 * 输出：覆盖 10×5×2=100 entries × 每段 3 变体 = 300 句的 Record<key, DecadeHintV2>
 *
 * Usage: node scripts/bazi/build-fortune-hints-v2.mjs > /tmp/fortune-v2.txt
 */

// ============================================================
// 10 十神 + 固有意象
// ============================================================

const TEN_GODS = [
  '比肩', '劫财', '食神', '伤官',
  '正财', '偏财', '正官', '七杀',
  '正印', '偏印',
]

// 十神核心意象：用于句子主体（field / industry / 关键词）
const TEN_GOD_IMAGERY = {
  比肩: { core: '兄弟同辈相助', field: '合作创业', keyword: '人脉', risk: '友损财', rTag: '合作' },
  劫财: { core: '行动力与突破', field: '借力突破', keyword: '决断', risk: '财来财去、口舌', rTag: '决断' },
  食神: { core: '才艺与口福', field: '文化艺术、教育、餐饮', keyword: '享受', risk: '过于享乐而懒散', rTag: '才艺' },
  伤官: { core: '才华与表达', field: '艺术、技术、内容创作', keyword: '创意', risk: '言多招怨、上司冲突', rTag: '表达' },
  正财: { core: '收入与家庭', field: '置产理财、婚配', keyword: '稳健', risk: '固守失机、为财劳累', rTag: '财稳' },
  偏财: { core: '外财与机遇', field: '副业、投资、贸易', keyword: '机遇', risk: '被人牵累、慎做担保', rTag: '外财' },
  正官: { core: '名分与贵人', field: '机关单位、升迁、婚配', keyword: '规矩', risk: '是非官非', rTag: '名分' },
  七杀: { core: '权威与决断', field: '竞争、开拓、创业', keyword: '魄力', risk: '伤灾官非、易冲突', rTag: '权威' },
  正印: { core: '学业与贵人提携', field: '进修、文书、名声', keyword: '内修', risk: '过于依赖、行动力下降', rTag: '学业' },
  偏印: { core: '灵感与偏门技艺', field: '设计、研究、玄学命理', keyword: '专研', risk: '多疑犹豫、起居失调', rTag: '专研' },
}

const STRENGTH_LEVELS = ['极旺', '偏旺', '中和', '偏弱', '极弱']
const STANCES = ['follow', 'oppose']

// ============================================================
// 旺衰 × 取向 → 主调
// ============================================================

// 顺势：十神有利于当前日主旺衰
const FOLLOW_STRATEGY = {
  极旺: { mood: '势已极盛', advice: '宜泄秀化气、勿再扩张，避盛极而衰', tag: '泄秀' },
  偏旺: { mood: '势顺可乘', advice: '可乘势开拓，留三分余地不必尽用', tag: '稳进' },
  中和: { mood: '气和力均', advice: '宜稳健精进、专注一事深耕', tag: '稳健' },
  偏弱: { mood: '得力上升', advice: '宜借力推进、运势回暖之机', tag: '借力' },
  极弱: { mood: '急时甘霖', advice: '宜抓住机会休整复原，慎防再耗', tag: '复原' },
}

// 逆势：十神不利于当前日主旺衰
const OPPOSE_STRATEGY = {
  极旺: { mood: '盛极遇压', advice: '大势压顶，宜借此机会泄秀转化，化压为势', tag: '化压' },
  偏旺: { mood: '势盛遇阻', advice: '宜修身养性、避锋芒不强争', tag: '收敛' },
  中和: { mood: '气和遇杂', advice: '平稳过渡、看流年自身吉凶', tag: '过渡' },
  偏弱: { mood: '力薄遇耗', advice: '宜守不宜攻，借贵人印星缓压', tag: '守势' },
  极弱: { mood: '强敌压境', advice: '宜保命守身、避冲克、慎重起居', tag: '保身' },
}

// ============================================================
// 单段生成：根据 tenGod + strength + stance 推 3 变体
// ============================================================

function buildVariants(tenGod, strength, stance) {
  const img = TEN_GOD_IMAGERY[tenGod]
  const strat = stance === 'follow' ? FOLLOW_STRATEGY[strength] : OPPOSE_STRATEGY[strength]
  const stanceLabel = stance === 'follow' ? '顺势' : '逆势'

  // 3 个开头模板（保证句式不同）
  const openings = [
    `${tenGod}入运`,        // 第 1 变体：标准
    `运行${tenGod}`,        // 第 2 变体：动名结构
    `${tenGod}大运`,        // 第 3 变体：直接命名
  ]

  // 3 个中段模板（围绕"十神意象"）
  const middles = [
    `主${img.core}`,                              // 1: "主"
    `带${img.core}之气`,                           // 2: "带...气"
    `${img.core}显发`,                            // 3: "显发"
  ]

  // 3 个收尾模板（围绕"strategy.advice"）
  const endings = [
    `${strat.advice}。`,                          // 1: 直接 advice
    `（身${strength}${stanceLabel}）${strat.advice}。`, // 2: 加旺衰括注
    `${stanceLabel}之运，${strat.advice}。`,       // 3: 顺/逆势开头
  ]

  // 组合三句变体（轮换搭配，避免单调）
  const variants = [
    `${openings[0]}，${middles[0]}；${endings[0]}`,
    `${openings[1]}，${middles[1]}；${endings[1]}`,
    `${openings[2]}，${middles[2]}；${endings[2]}`,
  ]

  // tags：取向 / 旺衰 / 十神核心
  const tags = [strat.tag, `${strength}${stanceLabel}`, img.rTag]

  return { variants, tags }
}

// ============================================================
// 主入口
// ============================================================

function main() {
  const entries = []
  let count = 0

  for (const tenGod of TEN_GODS) {
    for (const strength of STRENGTH_LEVELS) {
      for (const stance of STANCES) {
        const { variants, tags } = buildVariants(tenGod, strength, stance)
        const key = `${tenGod}_${strength}_${stance}`
        entries.push({ key, variants, tags })
        count++
      }
    }
  }

  console.log(`// 生成 ${count} 段大运模板 × 每段 3 变体（应该是 100 段、300 句）`)
  console.log()
  console.log(`// 100 段大运模板（v2）= 10 十神 × 5 旺衰 × 2 取向（顺势/逆势）`)
  console.log(`// 由 scripts/bazi/build-fortune-hints-v2.mjs 生成`)
  console.log(`// 生成原则参考《滴天髓·岁运》《三命通会·卷四·论行运》纲要`)
  console.log()
  console.log(`export const DECADE_HINTS_V2: Record<string, DecadeHintV2> = {`)
  for (const { key, variants, tags } of entries) {
    console.log(`  ${key}: {`)
    console.log(`    variants: [`)
    for (const v of variants) {
      console.log(`      '${v}',`)
    }
    console.log(`    ],`)
    const tagsStr = tags.map(t => `'${t}'`).join(', ')
    console.log(`    tags: [${tagsStr}],`)
    console.log(`  },`)
  }
  console.log(`}`)

  console.error(`Total entries: ${count}, total sentences: ${count * 3}`)
  if (count !== 100) {
    console.error(`ERROR: expected 100 entries, got ${count}`)
    process.exit(1)
  }
}

main()
