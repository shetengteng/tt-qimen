#!/usr/bin/env node
/**
 * 一次性扩写脚本：把 travel/health 中短于 25 字的 89 条 topic 扩写到 25-40 字。
 *
 * 设计：
 *   1. EXPANSIONS 里每条 {id, field, text} 即为新文本（手工撰写 / AI 辅助）。
 *   2. 脚本把新文本写回 scripts/lingqian-humanized.mjs（替换对应字段的整行）。
 *   3. 同时把新文本写到 src/modules/lingqian/data/guanyin.json（保持双源一致）。
 *   4. 不触碰其他字段，不改动 raw 子对象。
 *
 * 原则：
 *   - 保留原意（吉/凶、宜/忌方向不变）
 *   - 追加"具体建议"（时段/方向/随行/路线/检查项/调养方式）
 *   - 中性平实、含少量仪式感古词（宜/忌），与其他字段风格一致
 *   - 不宣扬玄学因果，不暗示医疗替代品
 *
 * 背景：
 *   - 2026-04-24 topic 模板化清零后，六类 topic 均 100% 唯一，但 travel/health
 *     因原始公版"远行/搬家/身体"两句制，最短 7 字，视觉偏单薄
 *   - 本轮把 travel <25 共 64 条、health <25 共 25 条统一扩至 25-40 字
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

/** @type {Array<{id:number, field:'travel'|'health', text:string}>} */
const EXPANSIONS = [
  // ========== TRAVEL（64 条）==========
  { id: 3, field: 'travel', text: '出行顺利、搬迁平安；可放心安排远近行程，但行李宁简勿重，避开雨天即可。' },
  { id: 4, field: 'travel', text: '远行有约可至，路上可能稍有延误但总体向好；搬家宜延后一两月，先把旧居梳理好再动。' },
  { id: 5, field: 'travel', text: '出行会稍迟但终能到达，路上或因沟通不畅多绕一圈；搬家顺利可放心安排，新址以近郊为佳。' },
  { id: 6, field: 'travel', text: '出行宜走近距离的路线，避免长途与跨省行程；搬家可成，选择与现居相近的区域更顺。' },
  { id: 8, field: 'travel', text: '远行有消息可至、旧友可见；搬家顺利，可优先选择通勤便利、采光通透的居所长居久安。' },
  { id: 9, field: 'travel', text: '出行可启程，无重大阻碍；行前把时间、票据、行程明明白白列清楚，路上少走弯路。' },
  { id: 10, field: 'travel', text: '出行可启程，但只走熟悉路线为好；搬家宜守旧不动，等手上的事理顺、下个季度再看时机。' },
  { id: 11, field: 'travel', text: '远行虽迟但终能到达，途中或有贵人搭话；搬迁兴旺顺利，新址可带动整体运势。' },
  { id: 13, field: 'travel', text: '远行前宜祈佑求安、做好预案，预留缓冲时间；搬家宜守旧不动，等公司或家事明朗再议。' },
  { id: 14, field: 'travel', text: '远行可见旧人或达成约定；搬家顺利可放心安排，新居以朝向东南、通风良好者更宜。' },
  { id: 15, field: 'travel', text: '远行一路顺风，搬家宜选择更远的地方反而吉利，换个全新环境后运势打开一层。' },
  { id: 17, field: 'travel', text: '远行会迟到，行前多预留缓冲；搬家宜守旧不动，先把当前居所安顿好、三两月后再议。' },
  { id: 20, field: 'travel', text: '远行受阻、宜改期或缩短行程；搬家顺利，可优先安排搬家，新址以近水、采光好为宜。' },
  { id: 21, field: 'travel', text: '远行将至、归途亦安；搬家昌盛兴旺，可放心安排，新址以靠近亲友、便于团聚为佳。' },
  { id: 23, field: 'travel', text: '远行有惊险，宜推迟或改走短途；搬家也不甚吉利，建议推迟一两月、等形势平稳再议。' },
  { id: 24, field: 'travel', text: '远行受阻、宜改期或改目的地；搬家顺利，可优先考虑搬家，以换环境、断旧缘为主线。' },
  { id: 25, field: 'travel', text: '远行受阻、搬家也不合适；建议两项都推迟，先把手上的旧事理清再谈"动一动"。' },
  { id: 26, field: 'travel', text: '远行有消息但未必落实，行前再多确认一次时间与接应；搬家宜守旧不动，不要凭传言做决定。' },
  { id: 28, field: 'travel', text: '远行迟滞、票期或行程可能变动；搬家宜守旧不动，建议推迟到云开月明之后再议。' },
  { id: 29, field: 'travel', text: '远行迟滞、但归程顺畅；搬家兴旺，可优先安排搬家，新址以通透明亮为先。' },
  { id: 32, field: 'travel', text: '远行中音讯容易断，行前备好离线导航与应急联络；搬家宜变更方向，不要急着定。' },
  { id: 35, field: 'travel', text: '远行将至、路上无大碍；搬家平安，可放心安排，建议一次到位、少走回头路。' },
  { id: 37, field: 'travel', text: '远行有消息但也有变数，行前把行程告知家人一份；搬家宜守旧不动，等风头过去再动。' },
  { id: 38, field: 'travel', text: '远行受阻、宜改期或缩短行程；搬家尚平安，可考虑搬家，但优先处理家中尚未了结的事。' },
  { id: 39, field: 'travel', text: '远行可启程，但选择熟人同行更稳；搬家平稳，可放心安排，新址宜选择安静不喧嚣的环境。' },
  { id: 40, field: 'travel', text: '远行受阻，宜短途或改期；搬家十分吉利，可优先安排搬家，女性主导新居规划更顺。' },
  { id: 41, field: 'travel', text: '远行将至、旧友可见；搬家宜祈佑求安，避开与"听信花言巧语"有关的决策，稳字当头。' },
  { id: 43, field: 'travel', text: '远行有阻、宜延期或缩短行程；搬家有利，可优先安排搬家，新址以阳光充足、接地气者为佳。' },
  { id: 45, field: 'travel', text: '远行受阻、宜改短途；搬家有利，可优先安排搬家，新址以温柔邻里、宜居气氛者为先。' },
  { id: 48, field: 'travel', text: '远行多有阻滞，途中易遇临时变更；搬家宜守旧不动，建议推迟，待时机成熟再一飞冲天。' },
  { id: 51, field: 'travel', text: '远行可启程、路上凉风送爽；搬家宜守旧不动，旧居稍作整饬即可，不需大动干戈。' },
  { id: 52, field: 'travel', text: '远行有灾险，宜改期或推迟；搬家寻常，不是吉也非凶；建议两项都推迟远行、先稳住心神。' },
  { id: 54, field: 'travel', text: '远行稍迟到达、途中或多走冤枉路；搬家顺利，可优先安排搬家，以换路线、避旧圈为主。' },
  { id: 60, field: 'travel', text: '远行迟滞、不宜远途出差；但搬家顺利，可考虑搬家，以"以静制动"、换个清净环境为宜。' },
  { id: 63, field: 'travel', text: '远行迟滞、不如缩短行程；搬家宜变更方向，不要急着定，多看几处再做决定。' },
  { id: 64, field: 'travel', text: '远行有阻、宜改期或改短途；搬家尚顺利，可考虑搬家，但要避开熟人介绍的"熟路陷阱"。' },
  { id: 65, field: 'travel', text: '远行受阻、宜改期或就近安排；搬家宜守旧不动，建议推迟，宁可错过也不要硬行。' },
  { id: 66, field: 'travel', text: '远行受阻、能不出远门就不出；搬家切莫动，不要做大决定，守住现有已属不易。' },
  { id: 67, field: 'travel', text: '远行有消息、旧友可见；搬家宜守旧不动，当前居所安心即可，不必追求更好的环境。' },
  { id: 68, field: 'travel', text: '远行可至、归程亦安；搬家称心如意，可放心安排，新址以家人团圆聚餐方便为佳。' },
  { id: 69, field: 'travel', text: '远行迟到达、宜耐心，行前多预留缓冲；搬家宜延后，等下一个节气更合适。' },
  { id: 71, field: 'travel', text: '远行受阻、路上或有临时变更；搬家顺利，可考虑搬家，但签约前最好与双方反复核对细节。' },
  { id: 73, field: 'travel', text: '远行可至、途中或遇贵人相助；搬家顺利，可放心安排，新址以春季入住最为契合。' },
  { id: 74, field: 'travel', text: '远行受阻、宜改期或取消；搬家不利，建议推迟，当下能守住本位就是最大的胜利。' },
  { id: 75, field: 'travel', text: '远行受阻、独自远行更需谨慎；搬家宜安守不动，建议推迟，等形势明朗再议。' },
  { id: 76, field: 'travel', text: '远行稍迟方至、路上别着急；搬家宜守旧不动，不宜远行远迁，就地等候时机才是上策。' },
  { id: 77, field: 'travel', text: '远行稍迟到达、切勿因旁人催促赶路；搬家宜静候时机，不要急着动、不要被虚幻承诺带走。' },
  { id: 78, field: 'travel', text: '远行将至、归途顺遂；搬家十分吉利，可放心安排，新址以贵人邻里、谈事方便者为佳。' },
  { id: 79, field: 'travel', text: '远行迟滞、先把旧债旧愿了断再动身；搬家宜安守不动，不要急着动，兑现承诺比搬家更紧。' },
  { id: 80, field: 'travel', text: '远行的人将归来、归途中或遇贵人；搬家顺利，可放心安排，新址以利于职业升迁的方位为佳。' },
  { id: 81, field: 'travel', text: '远行可启程、一路顺风；搬家随心如意，可放心安排，新址以临水或通风明亮处最宜。' },
  { id: 84, field: 'travel', text: '远行多有险阻，宜延期或就近；远行务必谨慎、行前与家人约定联络节奏，切忌酒后行动。' },
  { id: 85, field: 'travel', text: '远行受阻、建议改短途或改期；搬家以更新为主，可考虑搬家，新址换气场、断旧缘。' },
  { id: 86, field: 'travel', text: '远行四方皆顺、远程近途均吉；可议大事、签大约，出差谈判尤为顺利，记得把合约白纸黑字写清。' },
  { id: 87, field: 'travel', text: '远行稍迟到达、行前多备一份体力与预算；搬家宜安守不动，现址虽小尚可守住平安。' },
  { id: 90, field: 'travel', text: '远行顺风、远途无阻；外出可遇助力，归途亦安，建议把重要洽谈安排在本次出行中一起完成。' },
  { id: 91, field: 'travel', text: '远行一路顺风、远近皆宜；远途亦可放心前往，行李宁轻勿重，路上多与贵人同行。' },
  { id: 92, field: 'travel', text: '远行可启程、归程亦顺；搬家称心如意，可放心安排，新址宜与配偶或合伙人一同决定。' },
  { id: 93, field: 'travel', text: '远行留连不顺、路上或有小人搬弄是非；搬家宜守旧不动，不要急着动，忍过这阵再议。' },
  { id: 94, field: 'travel', text: '远行可启程、但建议独行或与知己同行；可放心安排近途，远途则宜再等一等贵人出现。' },
  { id: 95, field: 'travel', text: '搬家宜安守不动、不要急着动；远行也以短途为主，切莫因酒色或一时冲动改变行程。' },
  { id: 97, field: 'travel', text: '远行无音讯、行前多确认对方是否真的在；搬家宜守旧不动，不要急着动，虚幻承诺要格外留心。' },
  { id: 98, field: 'travel', text: '远行受困受阻、能不出就不出；搬家切莫动，不要做大决定，守住现址就是最大的福气。' },
  { id: 99, field: 'travel', text: '远行受困受阻、途中或有意外；搬家宜守旧不动，不要做大决定，只宜行善、少管是非。' },

  // ========== HEALTH（25 条）==========
  { id: 9, field: 'health', text: '身体平安无忧，只需保持规律作息、定期做基础体检；若有心事未解，可考虑一次心理或正念调息。' },
  { id: 21, field: 'health', text: '身体若有小恙能遇良医、及时就医即可康复；旧疾者宜趁这段吉气做一次系统复查与调养。' },
  { id: 24, field: 'health', text: '身体有反复，宜尽快求医并借助宗教仪式或心理咨询调心；立场清晰、饮食规律是康复前提。' },
  { id: 26, field: 'health', text: '身体宜祈佑求安、规律作息加善念；不要轻信"一贴见效"的偏方，常规体检与专业诊断为先。' },
  { id: 27, field: 'health', text: '身体虽有迁延但整体安康，规律作息可助康复；可把旧的健康习惯"拆"掉，按新生活节奏重建。' },
  { id: 38, field: 'health', text: '身体虽有迁延但整体安康，宜规律作息、做一次完整体检；家中长辈、孩子的健康也要留心关照。' },
  { id: 39, field: 'health', text: '身体有反复，宜借助宗教仪式或正念调息调和；规律作息、节制饮食，不要与天意较劲。' },
  { id: 42, field: 'health', text: '身体若有反复，及时就医配合做善事可康复；孕妇、老人、孩子的健康尤宜趁这段吉气安排复查。' },
  { id: 49, field: 'health', text: '身体反复难愈、宜尽快就医并借助宗教仪式或心理咨询调心；静养为主、不要为功名损耗元气。' },
  { id: 50, field: 'health', text: '小恙可解、无需大忧；规律作息加上适当休息即可，但越顺时越要注意节制饮食与劳逸平衡。' },
  { id: 58, field: 'health', text: '身体反复、宜尽快就医并多做善事调心；保持旧有作息与饮食习惯，切勿频繁换医换方。' },
  { id: 60, field: 'health', text: '身体有惊、宜尽快就医并多做善事调心；避免过度用脑和熬夜，先把基础体检与复查补上。' },
  { id: 64, field: 'health', text: '身体有灾险、宜尽快就医并多做善事调心；早觉先防、做好血压血糖等关键指标的定期监测。' },
  { id: 66, field: 'health', text: '身体严重、宜尽快寻求专业医疗；不要再为外务劳神，静养与规范治疗是唯一出路。' },
  { id: 69, field: 'health', text: '身体有虚惊但最终无碍、宜规律作息；按时复查、稳住心情，等"阳春"一到自然康复。' },
  { id: 76, field: 'health', text: '身体稍有阻滞、宜静养调理、避免劳神；每天留半小时给自己，做一次身心的深呼吸与放松。' },
  { id: 79, field: 'health', text: '身体若有反复能化解、配合积善行德更好；许下的健康承诺（戒烟、节食等）一定要兑现。' },
  { id: 81, field: 'health', text: '身体若有反复反而是喜事的前兆、宜配合做善事；建议借机做一次完整体检、把旧账一次清。' },
  { id: 86, field: 'health', text: '体健少恙、旧疾可愈；精神饱满，宜趁机调养巩固，把运动、睡眠、饮食三件事固定下来。' },
  { id: 90, field: 'health', text: '体魄安康、旧疾渐愈；宜借此佳期调养、增强体力，亦可开始学习一项新的运动以稳住进步。' },
  { id: 91, field: 'health', text: '身体康健、少有大碍；调理得宜，旧疾可愈，建议把日常走路、泡脚、冥想等简单习惯固定下来。' },
  { id: 94, field: 'health', text: '身体阻隔难通、宜尽快就医并多做善事调心；找一位真正信任的医生长期随访，比频换医院更有效。' },
  { id: 95, field: 'health', text: '身体反复迁延缠绕、宜尽快就医并多做善事调心；节制饮酒与娱乐，把欲望收一收，身体自会回应。' },
  { id: 97, field: 'health', text: '身体有反复（涉阴邪）、宜尽快就医并多做善事调心；除常规治疗外，可辅以正念冥想或心理咨询。' },
  { id: 99, field: 'health', text: '身体忧虑危迫、宜尽快寻求专业医疗；不要一个人硬扛，把家人朋友纳入支持网络、减轻心理负担。' },
]

// 校验：每条 >= 25 字
const BAD = EXPANSIONS.filter((e) => e.text.length < 25)
if (BAD.length) {
  console.error(`[err] ${BAD.length} entries shorter than 25 chars:`)
  for (const b of BAD) console.error(`  #${b.id} ${b.field} len=${b.text.length}: ${b.text}`)
  process.exit(1)
}

// 校验：同字段内互相不重复
for (const field of ['travel', 'health']) {
  const texts = EXPANSIONS.filter((e) => e.field === field).map((e) => e.text)
  const set = new Set(texts)
  if (set.size !== texts.length) {
    console.error(`[err] ${field} expansions have duplicates`)
    process.exit(1)
  }
}

// ---------- Step 1: 改写 lingqian-humanized.mjs ----------
const humanizedPath = path.join(ROOT, 'scripts/lingqian-humanized.mjs')
let src = fs.readFileSync(humanizedPath, 'utf8')

let replaced = 0
for (const exp of EXPANSIONS) {
  // 在 `id: N,` 之后、下一个 `id: M,` 或数组末尾 `]` 之前，匹配 `field: '...',`
  // 允许单引号或双引号、允许一个字符串里跨行？humanized 现在 topic 都是单行。
  const idPattern = new RegExp(
    `(\\bid:\\s*${exp.id}\\s*,)([\\s\\S]*?)(\\b${exp.field}:\\s*)['"]([^'"\\n]*?)['"](\\s*,)`,
    'm',
  )
  const m = src.match(idPattern)
  if (!m) {
    console.error(`[err] cannot find id=${exp.id} field=${exp.field} in humanized`)
    process.exit(1)
  }
  const before = src.slice(0, m.index)
  const after = src.slice(m.index + m[0].length)
  // 保留原引号类型
  const raw = m[0]
  const quoteChar = raw.includes(`${exp.field}: "`) ? '"' : "'"
  const newLine = `${m[1]}${m[2]}${m[3]}${quoteChar}${exp.text}${quoteChar}${m[5]}`
  src = before + newLine + after
  replaced += 1
}
fs.writeFileSync(humanizedPath, src, 'utf8')
console.log(`[ok] rewrote ${replaced} entries in scripts/lingqian-humanized.mjs`)

// ---------- Step 2: 同步到 guanyin.json ----------
const jsonPath = path.join(ROOT, 'src/modules/lingqian/data/guanyin.json')
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
const byId = new Map(data.map((it) => [it.id, it]))

let applied = 0
for (const exp of EXPANSIONS) {
  const cur = byId.get(exp.id)
  if (!cur) {
    console.error(`[err] id=${exp.id} not in guanyin.json`)
    process.exit(1)
  }
  cur.topics[exp.field] = exp.text
  applied += 1
}
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8')
console.log(`[ok] synced ${applied} entries to src/modules/lingqian/data/guanyin.json`)

console.log(`\n[done] travel + health short topics expanded to >= 25 chars.`)
