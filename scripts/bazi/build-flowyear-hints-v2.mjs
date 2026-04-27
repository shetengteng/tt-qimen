#!/usr/bin/env node
/**
 * 八字流年模板 v2 生成器
 *
 * 维度：60 甲子（year ganzhi） × 5 旺衰（日主 strength）= 300 段
 *
 * 生成原则（参考《三命通会·卷九/卷十一·论行年》《五行精纪·流年》纲要）：
 *   - 基础句式由 [年干五行 / 年支五行 / 干支阴阳 / 旺衰对策] 推出
 *   - 5 旺衰对策：
 *       极旺 → 忌再生扶；喜见食伤泄秀 / 官杀制约
 *       偏旺 → 宜稍泄稍制；顺其势而不逆
 *       中和 → 平稳过渡；看流年自身吉凶
 *       偏弱 → 宜印比生扶；忌耗泄太过
 *       极弱 → 必须强援；忌逢冲克
 *   - 文笔保持"宜/防/可/利"等缓和措辞，避免"必/绝对"
 *
 * 输出：覆盖 60×5=300 entries 的 Record<key, FlowYearHintV2>
 *
 * Usage: node scripts/bazi/build-flowyear-hints-v2.mjs > /tmp/flowyear-v2.txt
 */

// ============================================================
// 60 甲子表 + 五行 / 阴阳归属
// ============================================================

const HEAVEN_STEMS = [
  { name: '甲', element: '木', yinYang: '阳' },
  { name: '乙', element: '木', yinYang: '阴' },
  { name: '丙', element: '火', yinYang: '阳' },
  { name: '丁', element: '火', yinYang: '阴' },
  { name: '戊', element: '土', yinYang: '阳' },
  { name: '己', element: '土', yinYang: '阴' },
  { name: '庚', element: '金', yinYang: '阳' },
  { name: '辛', element: '金', yinYang: '阴' },
  { name: '壬', element: '水', yinYang: '阳' },
  { name: '癸', element: '水', yinYang: '阴' },
]

const EARTH_BRANCHES = [
  { name: '子', element: '水', yinYang: '阳', season: '冬', shengxiao: '鼠' },
  { name: '丑', element: '土', yinYang: '阴', season: '冬', shengxiao: '牛' },
  { name: '寅', element: '木', yinYang: '阳', season: '春', shengxiao: '虎' },
  { name: '卯', element: '木', yinYang: '阴', season: '春', shengxiao: '兔' },
  { name: '辰', element: '土', yinYang: '阳', season: '春', shengxiao: '龙' },
  { name: '巳', element: '火', yinYang: '阴', season: '夏', shengxiao: '蛇' },
  { name: '午', element: '火', yinYang: '阳', season: '夏', shengxiao: '马' },
  { name: '未', element: '土', yinYang: '阴', season: '夏', shengxiao: '羊' },
  { name: '申', element: '金', yinYang: '阳', season: '秋', shengxiao: '猴' },
  { name: '酉', element: '金', yinYang: '阴', season: '秋', shengxiao: '鸡' },
  { name: '戌', element: '土', yinYang: '阳', season: '秋', shengxiao: '狗' },
  { name: '亥', element: '水', yinYang: '阴', season: '冬', shengxiao: '猪' },
]

function buildSixtyCycle() {
  const list = []
  for (let i = 0; i < 60; i++) {
    const stem = HEAVEN_STEMS[i % 10]
    const branch = EARTH_BRANCHES[i % 12]
    list.push({
      name: `${stem.name}${branch.name}`,
      stem,
      branch,
    })
  }
  return list
}

// ============================================================
// 五行生克
// ============================================================

const ELEMENT_GENERATE = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const ELEMENT_RESTRICT = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' }

const ELEMENT_TRAITS = {
  木: { metaphor: '草木生长', vibe: '生发条达', industry: '教育出版、文化创意、园艺木材' },
  火: { metaphor: '炎光照耀', vibe: '光明热烈', industry: '能源电力、传媒影视、餐饮料理' },
  土: { metaphor: '厚土载物', vibe: '稳重承载', industry: '不动产、建筑工程、农业仓储' },
  金: { metaphor: '刚金锐利', vibe: '决断收敛', industry: '金融机械、法律执行、五金贸易' },
  水: { metaphor: '川流不息', vibe: '智巧流动', industry: '水利物流、信息传播、咨询服务' },
}

const STRENGTH_LEVELS = ['极旺', '偏旺', '中和', '偏弱', '极弱']

// ============================================================
// 单段生成：根据 ganzhi + strength 推出 hint + tags
// ============================================================

function buildHint(cycle, strength) {
  const { stem, branch, name } = cycle
  const stemEl = stem.element
  const branchEl = branch.element
  const stemTrait = ELEMENT_TRAITS[stemEl]
  const branchTrait = ELEMENT_TRAITS[branchEl]
  const stemYY = stem.yinYang

  // 干支气势：干主"显在事象"，支主"潜在根基"
  const sameElement = stemEl === branchEl
  const stemGenBranch = ELEMENT_GENERATE[stemEl] === branchEl  // 干生支
  const branchGenStem = ELEMENT_GENERATE[branchEl] === stemEl  // 支生干
  const stemRestrictBranch = ELEMENT_RESTRICT[stemEl] === branchEl  // 干克支
  const branchRestrictStem = ELEMENT_RESTRICT[branchEl] === stemEl  // 支克干

  // 干支气势描述（用于句首）
  let qiPhrase
  if (sameElement) {
    qiPhrase = `${name}年干支同${stemEl}，气专一`
  } else if (stemGenBranch) {
    qiPhrase = `${name}年干${stemEl}生支${branchEl}，气向下盘`
  } else if (branchGenStem) {
    qiPhrase = `${name}年支${branchEl}托干${stemEl}，根稳气升`
  } else if (stemRestrictBranch) {
    qiPhrase = `${name}年干${stemEl}克支${branchEl}，事压根`
  } else if (branchRestrictStem) {
    qiPhrase = `${name}年支${branchEl}克干${stemEl}，根撼事`
  } else {
    qiPhrase = `${name}年干${stemEl}支${branchEl}，二气并行`
  }

  // 5 档旺衰对策
  const strategy = makeStrategy(strength, stemEl, branchEl)

  // 行业 / 事象标签（综合 stem + branch 五行）
  const tags = makeTags(stemEl, branchEl, strength, branchGenStem, branchRestrictStem)

  // 拼接完整 hint
  const hint = `${qiPhrase}；${strategy}。`

  return { hint, tags }
}

function makeStrategy(strength, stemEl, branchEl) {
  // 旺衰对策决定本年的"宜 / 防 / 可"
  const stemTrait = ELEMENT_TRAITS[stemEl]
  const branchTrait = ELEMENT_TRAITS[branchEl]

  switch (strength) {
    case '极旺': {
      // 极旺者忌再生扶，喜泄秀 / 制约
      if (stemEl === branchEl) {
        return `身极旺再逢同气加临，宜借${ELEMENT_GENERATE[stemEl]}泄秀、避盛而极反`
      }
      if (stemRestrictGen(stemEl, branchEl, '生扶')) {
        return `身极旺逢生扶过盛，宜深耕作品、勿再扩张`
      }
      return `身极旺逢${stemEl}${branchEl}，宜借${branchTrait.industry.split('、')[0]}领域释势`
    }
    case '偏旺': {
      if (stemEl === branchEl) {
        return `身偏旺干支聚气，可乘势开拓但需留余地`
      }
      return `身偏旺得${stemEl}${branchEl}相辅，宜稳中求进、不必过激`
    }
    case '中和': {
      if (stemEl === branchEl) {
        return `身和气专之年，可专注一事、深耕细作`
      }
      return `身中和遇${stemEl}${branchEl}流年，平稳过渡、看流年本身吉凶为主`
    }
    case '偏弱': {
      const generator = invertGen(stemEl)
      const isGenerated = stemEl === ELEMENT_GENERATE[branchEl] || branchEl === generator
      if (isGenerated) {
        return `身偏弱得${stemEl}${branchEl}生扶，运势回暖、宜借力推进`
      }
      return `身偏弱遇${stemEl}${branchEl}，宜借贵人、印星(学习/文书)助力`
    }
    case '极弱': {
      const isHelpful = stemEl === ELEMENT_GENERATE[branchEl] || branchEl === ELEMENT_GENERATE[stemEl]
      if (isHelpful) {
        return `身极弱逢${stemEl}${branchEl}生扶，急时甘霖、宜抓住机会休整`
      }
      return `身极弱遇${stemEl}${branchEl}，宜守不宜攻、避锋芒、注重健康`
    }
  }
  return '宜结合用神综合判断'
}

// 简化判断：是否生扶（粗略）
function stemRestrictGen(stemEl, branchEl, _kind) {
  return stemEl === branchEl
}

function invertGen(el) {
  // 谁生了 el
  for (const k of Object.keys(ELEMENT_GENERATE)) {
    if (ELEMENT_GENERATE[k] === el) return k
  }
  return el
}

function makeTags(stemEl, branchEl, strength, branchGenStem, branchRestrictStem) {
  const tags = []
  const stemTrait = ELEMENT_TRAITS[stemEl]
  const branchTrait = ELEMENT_TRAITS[branchEl]

  // 旺衰主标签
  switch (strength) {
    case '极旺': tags.push('泄秀'); break
    case '偏旺': tags.push('稳进'); break
    case '中和': tags.push('平稳'); break
    case '偏弱': tags.push('生扶'); break
    case '极弱': tags.push('守稳'); break
  }

  // 干支气势辅助标签
  if (stemEl === branchEl) {
    tags.push(`${stemEl}气专`)
  } else if (branchGenStem) {
    tags.push('根托干')
  } else if (branchRestrictStem) {
    tags.push('根撼事')
  } else {
    tags.push('双气并')
  }

  // 行业/事象标签（取干主行业的第一项关键词）
  const industries = stemTrait.industry.split('、')
  if (industries.length > 0) {
    tags.push(industries[0])
  }

  return tags
}

// ============================================================
// 主入口：生成 300 段 + 输出 TS 字面量
// ============================================================

function main() {
  const cycles = buildSixtyCycle()
  const entries = []
  let count = 0

  for (const cycle of cycles) {
    for (const strength of STRENGTH_LEVELS) {
      const { hint, tags } = buildHint(cycle, strength)
      const key = `${cycle.name}_${strength}`
      entries.push({ key, hint, tags })
      count++
    }
  }

  console.log(`// 生成 ${count} 段流年模板（应该是 300）`)
  console.log()

  // 输出 TS 字面量
  console.log(`// 60 甲子 × 5 旺衰 = 300 段流年模板（v2）`)
  console.log(`// 由 scripts/bazi/build-flowyear-hints-v2.mjs 生成`)
  console.log(`// 生成原则参考《三命通会·卷九/卷十一·论行年》《五行精纪·流年》纲要`)
  console.log()
  console.log(`export const FLOW_YEAR_HINTS_V2: Record<string, FlowYearHint> = {`)
  for (const { key, hint, tags } of entries) {
    const tagsStr = tags.map(t => `'${t}'`).join(', ')
    console.log(`  ${key}: { hint: '${hint}', tags: [${tagsStr}] },`)
  }
  console.log(`}`)
  console.log()

  // 校验：是否真有 300 个
  console.error(`Total entries generated: ${count}`)
  if (count !== 300) {
    console.error(`ERROR: expected 300, got ${count}`)
    process.exit(1)
  }
}

main()
