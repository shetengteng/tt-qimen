#!/usr/bin/env node
/**
 * 观音灵签 · 100 签数据构建脚本（一次性运行）
 *
 * 输入：公版文献三篇（1-25 / 26-50 / 51-75）的抓取文本 + 脚本内嵌的 76-100 签数据
 * 输出：src/modules/lingqian/data/guanyin.json —— 100 签 LingqianItem[]
 *
 * level 映射（按与用户确认的 simple-map 方案）：
 *   上上 → 上上 ｜ 上 → 上吉 ｜ 中 → 中平 ｜ 下 → 中凶 ｜ 下下 → 下下
 *
 * topics 映射（15 项原始仙机 → 6 大分类）：
 *   family:   家宅 + 田蚕 + 六畜
 *   marriage: 婚姻 + 六甲 + 寻人
 *   career:   自身 + 公讼
 *   wealth:   求财 + 交易 + 失物 + 山坟
 *   travel:   行人 + 移徙
 *   health:   疾病
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

// ─────────────────────────────────────────────────────────────────────
// 1. 文本预处理 & 中文数字转换
// ─────────────────────────────────────────────────────────────────────

/** 把"二十五"这类中文数字转成阿拉伯数字（0-100 范围内） */
function cn2num(cn) {
  const D = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }
  cn = cn.trim()
  if (cn === '百' || cn === '一百') return 100
  if (!cn.includes('十')) return D[cn] ?? NaN
  const [a, b] = cn.split('十')
  const tens = a === '' ? 1 : D[a] ?? NaN
  const ones = b === '' ? 0 : D[b] ?? NaN
  return tens * 10 + ones
}

/** 把任意空白（\n, \r, 全角空格, 多空格）归一为单空格；同时清洗抓取残留 */
function normalize(text) {
  return text
    .replace(/\r/g, '')
    .replace(/\[\*?展开全文\*?\]\s*\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]+\)/g, '') // 其它 markdown 链接
    .replace(/\s+/g, ' ')
    .replace(/　+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─────────────────────────────────────────────────────────────────────
// 2. 分签切分 & 字段抽取
// ─────────────────────────────────────────────────────────────────────

/**
 * 从一大段文本切出每签的原始字符串
 *   触发锚点：`观音灵签第(中文数字)签：{title}({等级标签})`
 *   等级标签可为：`上上签` | `上签` | `中签` | `下签` | `下下签`
 */
function splitSigns(all) {
  // title 限制 1-8 个非标点汉字，避免跨典故段贪吃到下一签的等级标签
  const signHeadRe = /观音灵签第([一二三四五六七八九十百]+)签：\s*([\u4e00-\u9fa5]{1,8})\s*[（(](上上签|上签|中签|下签|下下签)[)）]/g
  const matches = []
  let m
  while ((m = signHeadRe.exec(all)) !== null) {
    matches.push({ idx: m.index, num: cn2num(m[1]), title: m[2], levelLabel: m[3], end: m.index + m[0].length })
  }
  const out = []
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i]
    const next = matches[i + 1]
    const body = all.slice(cur.end, next ? next.idx : all.length)
    out.push({ ...cur, body })
  }
  return out
}

const LEVEL_MAP = {
  上上签: '上上',
  上签: '上吉',
  中签: '中平',
  下签: '中凶',
  下下签: '下下',
}

/** 抽 `【{level}签{宫位}】{诗}` 的诗句 */
function extractPoem(body) {
  const m = body.match(/【[^】]+】\s*([^观]+?)(?=观音灵签第[一二三四五六七八九十百]+签：诗意|观音灵签第[一二三四五六七八九十百]+签：解曰|观音灵签第[一二三四五六七八九十百]+签：仙机|观音灵签第[一二三四五六七八九十百]+签：典故)/)
  if (!m) return null
  const raw = m[1].trim().replace(/。\s*$/, '')
  // 按 ； ， 。 切四句
  const lines = raw.split(/[，；。]/).map((s) => s.trim()).filter(Boolean)
  if (lines.length < 4) return null
  // 前 4 句
  return lines.slice(0, 4)
}

/** 抽 `观音灵签第X签：{section}` 后到下一个锚点 之间的正文 */
function extractSection(body, section) {
  const re = new RegExp(`观音灵签第[一二三四五六七八九十百]+签：${section}\\s*([\\s\\S]+?)(?=观音灵签第[一二三四五六七八九十百]+签：(?:诗意|解曰|仙机|典故)|$)`)
  const m = body.match(re)
  if (!m) return null
  return m[1].trim().replace(/^\[?\s*展开全文\s*\]?\(?[^)]*\)?\s*/, '')
}

/** 把仙机解析为 15 项 k→v 字典 */
const XIANJI_KEYS = ['家宅', '自身', '求财', '交易', '婚姻', '六甲', '行人', '田蚕', '六畜', '寻人', '公讼', '移徙', '失物', '疾病', '山坟']

/**
 * 公版文献中常见的"键缩写"，这些缩写应当映射回标准 15 关键字。
 * 例：sohu 系列把"田蚕、六畜"两段合并写成"蚕畜利"，需要把"蚕畜"识别为同时影响这两个键。
 */
const XIANJI_ALIAS_KEYS = {
  // "蚕畜" → 田蚕 + 六畜（值复制到两边）
  蚕畜: ['田蚕', '六畜'],
}
const ALIAS_PATTERN = Object.keys(XIANJI_ALIAS_KEYS)

function parseXianji(rawXianji) {
  if (!rawXianji) return {}
  const text = normalize(rawXianji)
  const keyPattern = [...XIANJI_KEYS, ...ALIAS_PATTERN].join('|')
  const re = new RegExp(`(${keyPattern})`, 'g')
  const parts = text.split(re).filter(Boolean)
  const result = {}
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i]
    if (XIANJI_KEYS.includes(seg)) {
      const next = parts[i + 1]
      if (next && !XIANJI_KEYS.includes(next) && !ALIAS_PATTERN.includes(next)) {
        result[seg] = normalize(next).replace(/\(.*?\)|（.*?）/g, '').trim()
        i++
      }
    } else if (ALIAS_PATTERN.includes(seg)) {
      const next = parts[i + 1]
      if (next && !XIANJI_KEYS.includes(next) && !ALIAS_PATTERN.includes(next)) {
        const value = normalize(next).replace(/\(.*?\)|（.*?）/g, '').trim()
        for (const realKey of XIANJI_ALIAS_KEYS[seg]) {
          if (!result[realKey]) result[realKey] = value
        }
        i++
      }
    }
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────
// 3. 15 → 6 topics 映射（现代化标签 + 值白话化）
// ─────────────────────────────────────────────────────────────────────

/** 15 项原始关键字 → 现代用户可读标签 */
const LABEL_MAP = {
  家宅: '家宅',
  自身: '自身',
  求财: '求财',
  交易: '交易',
  婚姻: '婚姻',
  六甲: '子嗣',
  行人: '出行',
  田蚕: '农事',
  六畜: '家畜',
  寻人: '寻亲',
  公讼: '诉讼',
  移徙: '搬迁',
  失物: '失物',
  疾病: '疾病',
  山坟: '祖坟',
}

/**
 * 通用-值 白话映射（覆盖最常见的晦涩短词，按"积极/中性/消极"三类组织）
 * 这是给"家宅 / 自身 / 求财 / 交易 / 田蚕 / 六畜 / 行人 / 移徙 / 失物 / 山坟 / 寻人 / 公讼 / 疾病"
 * 这些"非婚姻、非子嗣"字段共用的兜底映射；婚姻/子嗣有更细的专用映射在下方。
 */
const COMMON_VALUE_MAP = {
  // 积极
  大吉: '十分吉利',
  吉: '顺利',
  吉利: '顺利',
  '吉利': '顺利',
  顺: '顺遂',
  顺利: '顺遂',
  顺遂: '顺遂',
  遂意: '称心如意',
  从心: '随心顺意',
  随意: '随心',
  如意: '称心如意',
  好: '良好',
  好合: '美好和顺',
  康泰: '安康顺泰',
  泰: '安泰',
  安: '平安',
  平安: '平安',
  安吉: '平安吉利',
  即安: '很快安顺',
  安康: '安然康泰',
  得力: '有助力',
  胜: '占上风',
  有理: '占理',
  有信: '有消息',
  有: '可得',
  在: '在身边',
  见: '可见',
  得见: '可寻见',
  得: '可得',
  至: '将至',
  动: '可启程',
  喜: '有喜事',
  兴: '兴旺',
  旺: '兴旺',
  发: '发达',
  利: '有利',
  小利: '略有所得',
  福: '有福',
  禄: '有禄',
  '中吉': '小有吉象',
  中吉: '小有吉象',
  // 中性
  中平: '平稳无奇',
  平: '平稳',
  平平: '平淡',
  平常: '寻常',
  平稳: '平稳',
  慢: '缓慢',
  迟: '稍晚而至',
  迟见: '稍晚可见',
  待时: '宜静候时机',
  待时机: '宜静候时机',
  守待: '守而待之',
  谨守: '宜谨慎守持',
  守旧: '宜守旧不动',
  旧: '宜守旧',
  守: '宜安守',
  守己: '宜守本分',
  小心: '小心为上',
  谨防: '宜小心防范',
  谨慎: '宜小心谨慎',
  慎: '宜谨慎',
  慎出: '不宜轻易出门',
  慎重: '务必慎重',
  劳心: '颇费心力',
  劳力: '颇费体力',
  劳神: '颇费精神',
  作福: '宜积福行善',
  祈福: '宜祈福',
  祈保: '宜祈佑',
  许愿: '宜许愿酬谢',
  许经: '宜诵经积善',
  还愿: '宜还旧愿',
  还旧愿: '宜了结旧愿',
  禳星: '宜禳灾解星',
  禳灾: '宜禳灾保安',
  和: '宜以和为贵',
  '宜和': '宜以和解',
  宜和: '宜以和解',
  急断: '宜速断速决',
  早断: '宜早作了结',
  // 消极
  虚: '虚而少实',
  虚名: '虚名而已',
  欠安: '不甚安宁',
  欠利: '不甚得利',
  欠吉: '不甚吉利',
  不安: '不安宁',
  不利: '不利',
  不就: '难以成事',
  未成: '尚未成事',
  未遇: '尚未遇上',
  未许: '尚未许诺',
  未就: '尚未成事',
  未回: '尚未归来',
  未至: '尚未到来',
  阻: '受阻',
  阻滞: '多有阻滞',
  阻隔: '阻隔难通',
  滞: '迟滞',
  难: '艰难',
  难成: '难以成事',
  难寻: '难以寻得',
  难见: '难以相见',
  难痊: '难以痊愈',
  难养: '难以养育',
  破: '破耗',
  破财: '有破财之虞',
  小人: '宜防小人',
  口舌: '易招口舌',
  忧: '多忧',
  忧危: '忧虑危迫',
  忧疑: '忧虑疑惑',
  忧恼: '忧愁烦恼',
  烦: '烦扰',
  延: '迟延',
  延滞: '拖延滞缓',
  延缠: '迁延缠绕',
  延安: '虽延仍安',
  急: '宜速行',
  招非: '易招是非',
  亏: '不利己方',
  反复: '多有反复',
  迁: '宜迁动',
  改: '宜变更',
  宜改: '宜改弦更张',
  宜修: '宜修整',
  改向吉: '改换方向则吉',
  守旧大吉: '守旧不动则大吉',
  绝: '气数已尽',
  败: '败落',
  凶: '不利',
  灾: '有灾',
  险: '有险',
  无踪: '杳无踪影',
  杳: '杳无音讯',
  空: '徒劳无获',
  无: '不可得',
  少: '所得不多',
  多灾: '多有灾患',
  半收: '收成减半',
  五分: '只得半数',
  半吉: '半吉半凶',
  七分: '七成可得',
  半熟: '收成减半',
  晚: '宜晚不宜早',
  晚成: '需待迟成',
  晚丰: '迟而丰足',
  尾利: '末段方利',
  缺: '欠缺',
  损: '损耗',
  微微: '微薄',
  // 时令/方位（保持原样的，加引导词）
  秋吉: '秋季有吉',
  秋利: '秋季得利',
  秋熟: '秋季成熟',
  秋旺: '秋季兴旺',
  夏秋吉: '夏秋之间有吉',
  冬吉: '冬季有吉',
  春利: '春季得利',
  春旺: '春季兴旺',
  宜早: '宜早不宜迟',
  早种: '宜早播种',
  宜早种: '宜早播种',
  迟到: '稍晚抵达',
  // 健康专用
  殁送: '宜送神禳解',
  作福禳星: '宜作福禳星',
  '即痊愈': '很快痊愈',
  即痊愈: '很快痊愈',
  拜送: '宜拜送禳解',
  良方: '可遇良方',
  遇良方: '可遇良方',
  解: '可解',
  '即痊': '可速愈',
  // 出行/搬迁专用补充
  阻平安: '途中虽阻终安',
  去: '宜出门',
  回: '将归来',
  近: '宜走近途',
  远: '宜远途',
  远可: '宜远迁',
  动: '可启程',
  顺: '一路顺风',
  // 寻人专用补充
  '寻人见': '寻人可见',
  // 子嗣专用补充
  '生男': '宜得男胎',
  '生女': '宜得女胎',
  // 交易/求财补充
  允: '可成约',
  合: '可成议',
  胜: '占上风',
  // 家畜补充
  慎吉: '宜善加照护',
  '慎养': '宜精心养护',
  慎养: '宜精心养护',
  // 家宅/祖坟补充
  旧吉: '守旧则吉',
  旧安: '守旧则安',
  '南利': '宜面南',
  南利: '宜面南',
  '北利': '宜面北',
  北利: '宜面北',
  '东利': '宜面东',
  东利: '宜面东',
  '西利': '宜面西',
  西利: '宜面西',
  '昌盛': '昌盛兴旺',
  昌盛: '昌盛兴旺',
  '修整': '宜修整',
  '宜修': '宜修整',
  // 疾病补充
  延安: '虽迁延仍安康',
  延滞: '迁延滞缓',
  延缠: '迁延缠绕',
  '迁延缠绕': '迁延缠绕',
  '迁延滞缓': '迁延滞缓',
  解愈: '可解可愈',
  愈: '可愈',
  即安: '很快安顺',
  '即痊愈，': '很快痊愈',
  即愈: '很快痊愈',
  '安康': '安然康泰',
  // 6 甲补充
  '虚惊': '虚惊无碍',
  // 田蚕补充
  '中熟': '中等收成',
  中熟: '中等收成',
  '丰': '丰收',
  '丰收': '丰收',
  '丰熟': '丰收',
  丰熟: '丰收',
  半: '减半',
  '熟': '熟成',
  熟: '熟成',
  // 寻人补充
  '杳': '杳无音讯',
  '隔': '阻隔',
  '凶': '不利',
  '远': '远在他方',
  '勤': '宜勤寻问',
  '速寻': '宜速速寻问',
  // 公讼补充
  '惊': '有惊无险',
  '亏': '不利己方',
  '宜和': '宜以和解',
  '有贵人': '有贵人相助',
  '莫兴': '不宜兴讼',
  // 失物补充
  '速寻': '宜速寻',
  '不见': '不可寻见',
  '迟见': '稍晚可见',
  '难寻': '难以寻得',
  '难见': '难以相见',
  '在': '物在身边',
  // 婚姻补充
  '双配': '宜结良缘',
  双配: '宜结良缘',
  // 短动词/形容词补充（来自 validate 报告：交易成、家畜稳、求财遂、农事稳、家畜成）
  成: '可成',
  遂: '顺遂',
  稳: '安稳',
  半: '减半',
  // 残缺单字补充（来自数据画像：自身防、出行到、出行困、寻亲劳、家畜瘟、诉讼搁、诉讼祸）
  防: '宜防小人',
  到: '可至',
  困: '受困受阻',
  劳: '劳而无功',
  瘟: '宜防瘟疫',
  搁: '搁置无果',
  祸: '宜防祸患',
  // 残缺词组补充
  东西: '物在东西方',
  '东西吉': '宜葬东西方向',
  贵人: '逢贵人扶持',
  // 失物方向词（保持原样）
  东方: '物在东方',
  南方: '物在南方',
  西方: '物在西方',
  北方: '物在北方',
  东南: '物在东南',
  东北: '物在东北',
  西南: '物在西南',
  西北: '物在西北',
  南: '物在南方',
  东: '物在东方',
  西: '物在西方',
  北: '物在北方',
  // 婚姻特殊词，被 COMMON 兜底（婚姻字段会先查 MARRIAGE 专用 map）
  '宜祈福保佑': '宜祈福保佑',
  '宜祈佑': '宜祈佑',
}

/** 婚姻-值 白话映射（专用，优先于 COMMON） */
const MARRIAGE_VALUE_MAP = {
  成: '姻缘可成',
  成就: '姻缘可成',
  合: '两情相合',
  就: '可成姻缘',
  好: '美满和顺',
  好合: '美满和合',
  大吉: '姻缘大吉',
  吉: '姻缘吉利',
  中吉: '姻缘小吉',
  利: '姻缘有利',
  允: '婚事可允',
  和合: '和合顺遂',
  '两情相合': '两情相合',
  顺遂: '姻缘顺遂',
  随缘: '随缘可成',
  阻: '姻缘受阻',
  阻滞: '姻缘多滞',
  阻隔: '姻缘阻隔',
  难: '姻缘艰难',
  难合: '难以相合',
  难成: '难以成姻',
  不合: '不相投契',
  不长: '难以长久',
  不就: '尚难成就',
  未合: '缘分未至',
  未许: '缘分未至',
  未就: '尚难成就',
  未成: '尚未成姻',
  未长: '难以长久',
  迟: '姻缘迟来',
  迟合: '缘分迟至',
  迟滞: '姻缘迟滞',
  平平: '平淡无奇',
  中平: '平稳无奇',
  随意: '随缘可成',
  虚: '有名无实',
  祈福: '宜祈福保佑',
  祈保: '宜祈佑',
  作福: '宜积德求福',
  待时: '宜待时机',
  待时机: '宜待时机',
  '宜祈福保佑': '宜祈福保佑',
  '宜祈佑': '宜祈佑',
  '不相投契': '不相投契',
  '姻缘受阻': '姻缘受阻',
  '姻缘可成': '姻缘可成',
  '姻缘阻隔': '姻缘阻隔',
  '尚未成': '尚未成姻',
  '尚难成就': '尚难成就',
  '缘分未至': '缘分未至',
  '美满和顺': '美满和顺',
  '顺遂美满': '美满和顺',
  '宜迟': '宜稍延',
  宜迟: '宜稍延',
  刑克: '互有刑克',
  有成: '可有所成',
  遂意: '称心如意',
  '姻缘艰难': '姻缘艰难',
  '姻缘阻滞': '姻缘多滞',
}

/** 子嗣（原六甲）-值 白话映射 */
const LIUJIA_VALUE_MAP = {
  男: '宜得男胎',
  女: '宜得女胎',
  生男: '宜得男胎',
  生女: '宜得女胎',
  虚: '孕象未显',
  虚惊: '虚惊无碍',
  有险: '须防险情',
  险: '须防险情',
  有惊: '有惊无险',
  虚险: '虚惊小险',
  安: '母子平安',
  平安: '母子平安',
  祈福: '宜祈福',
  祈保: '宜祈佑',
  作福: '宜积福',
  不利: '不利孕育',
  多灾: '多有波折',
  喜: '有添丁之喜',
  煞旺: '宜禳煞保安',
  刑损: '须防刑伤损耗',
  '宜得男胎': '宜得男胎',
  '宜得女胎': '宜得女胎',
  '母子平安': '母子平安',
  '宜祈福': '宜祈福',
  '宜积福': '宜积福',
}

const VALUE_MAPS = {
  婚姻: MARRIAGE_VALUE_MAP,
  六甲: LIUJIA_VALUE_MAP,
}

/** 把"标签：值"对子拼接成自然句；优先用专用映射，否则用 COMMON */
function humanizeOne(key, raw) {
  if (!raw) return null
  const label = LABEL_MAP[key] ?? key
  // 清洗：去掉括号注释、内部空格、连续重复字
  const cleaned = raw
    .replace(/[（(].*?[）)]/g, '')
    .replace(/[\s　]+/g, '')
    .trim()
  if (!cleaned) return null
  const specific = VALUE_MAPS[key]?.[cleaned]
  const common = COMMON_VALUE_MAP[cleaned]
  const humanized = specific ?? common ?? cleaned
  return { label, value: humanized }
}

/**
 * 把若干 "标签：白话值" 拼成"通顺指引"；策略：
 *   - 1 项：`{label}{value}。`
 *   - 2-3 项：`{label}{value}，{label}{value}；... 。`
 *   - 4+ 项：分号分句 + 句末加句号
 * 这比原来的 "标签：值；标签：值" 更像"指引"而非"表格"。
 */
function joinHumanized(xianji, keys, placeholder) {
  const parts = keys
    .map((k) => humanizeOne(k, xianji[k]))
    .filter(Boolean)

  if (parts.length === 0) return placeholder

  if (parts.length === 1) {
    const { label, value } = parts[0]
    return `${label}${endsWithLabel(value, label) ? value : value}。`.replace(/[。；，]+$/, '。')
  }

  // 多项：`家宅平安，亲友音讯可至；今年田蚕兴旺、家畜健康。`
  const sentences = parts.map(({ label, value }) => `${label}${value}`)
  return sentences.join('，').replace(/[，。；]+$/, '') + '。'
}

/** 当 raw 已经以 label 开头（如"姻缘可成"以"姻缘"开头），无需再前置 label */
function endsWithLabel(value, label) {
  return value.startsWith(label.slice(0, 1))
}

/**
 * 把 free-form 仙机（如"此签诸事佳吉。求之顺遂。"）按 6 个 topic 切出"侧重句"。
 * 如果整段太短（< 6 个分句），就给 6 个 topic 各自配一个"领域化引言"，
 * 把通用语句作为"通用提示"放在每条之后，避免 6 个 topic 完全相同。
 */
function spreadFreeform(rawXianji) {
  const text = normalize(rawXianji)
    .replace(/\s+/g, '')
    .replace(/^此签/, '此签')
  const segments = text.split(/[。；！]/).map((s) => s.trim()).filter(Boolean)
  // 6 个 topic 各自的"领域引导词"，让 free-form 看起来不那么单调
  const TOPIC_PREFIX = {
    family: '家宅运',
    marriage: '婚姻缘',
    career: '事业运',
    wealth: '财禄运',
    travel: '出行运',
    health: '疾病康健',
  }
  const tail = segments.length ? segments.join('；') + '。' : text
  return {
    family: `${TOPIC_PREFIX.family}：${tail}`,
    marriage: `${TOPIC_PREFIX.marriage}：${tail}`,
    career: `${TOPIC_PREFIX.career}：${tail}`,
    wealth: `${TOPIC_PREFIX.wealth}：${tail}`,
    travel: `${TOPIC_PREFIX.travel}：${tail}`,
    health: `${TOPIC_PREFIX.health}：${tail}`,
  }
}

function mapTopics(xianji, rawXianji) {
  if (Object.keys(xianji).length === 0 && rawXianji) {
    return spreadFreeform(rawXianji)
  }
  return {
    family: joinHumanized(xianji, ['家宅', '寻人', '田蚕', '六畜'], '家宅平安，宜修养德行。'),
    marriage: joinHumanized(xianji, ['婚姻', '六甲'], '姻缘顺其自然，不可强求。'),
    career: joinHumanized(xianji, ['自身', '公讼'], '事业须勤勉守分，不可冒进。'),
    wealth: joinHumanized(xianji, ['求财', '交易', '失物', '山坟'], '财帛平平，宜稳守本业。'),
    travel: joinHumanized(xianji, ['行人', '移徙'], '出行择吉日，诸事留心。'),
    health: joinHumanized(xianji, ['疾病'], '起居有常，注意调养。'),
  }
}

// ─────────────────────────────────────────────────────────────────────
// 4. 单签解析流水线
// ─────────────────────────────────────────────────────────────────────

/**
 * jieyue 原始往往是"四言诗 + '此卦…' 总论"用全角空格 `　` 黏合，
 * 例：`急速兆速年　未值时　观音降笔先报君知　此卦盘古初开天地之象，诸事皆吉也。`
 * 这里把全角空格 / 多个半角空格统一替换为"中文逗号"，并补一个"四字节奏断句"
 * 启发式：sohu 源中常见的形如"急速兆速年未值时观音降笔先报君知"这种纯连写、
 * 总长 16/20/24 字、无标点的段落，按 4 字一断重新加逗号，让节奏可读。
 */
function smoothJieyue(text) {
  if (!text) return ''
  let out = normalize(text)
  // 第一步：把全角/半角空格替换为中文逗号
  out = out.replace(/[\s　]{1,}/g, '，')

  // 第二步：检测 "前段（无标点的纯汉字串）+ '此卦…' 段" 结构，对前段做 4 字断句
  out = out.replace(/^([\u4e00-\u9fa5]{12,28})(?=此卦|此象|此为)/g, (m, head) => {
    if (/[，。；！？、,.\s]/.test(head)) return head
    return chunkBy4Chars(head)
  })

  // 第三步：单独的纯汉字段（没有"此卦"），也尝试 4 字断
  out = out.replace(/^([\u4e00-\u9fa5]{12,28})$/g, (m) => chunkBy4Chars(m))

  // 第四步：「…，此卦」/「…」前段与后段中间补句号
  out = out.replace(/，?(?=此卦|此象|此为)/g, '。')
  // 把空格分隔的「前段 此卦后段」改为「前段。此卦后段」
  out = out.replace(/[\s ]+此卦/g, '。此卦')

  // 第五步：清理冗余标点 + 强制末尾句号
  out = out.replace(/，+(?=[。；！？])/g, '')
  out = out.replace(/。{2,}/g, '。')
  out = out.replace(/^[，。；]+/, '')
  out = out.replace(/[，；]+$/, '')
  if (!/[。！？]$/.test(out)) out += '。'
  return out
}

/**
 * 把一段没有标点的中文字符串按 4 字一节奏断句；
 * 如果长度是 12/16/20/24（4 的倍数），均匀切；否则按 4 字断 + 余字尾加逗号。
 */
function chunkBy4Chars(s) {
  const parts = []
  let i = 0
  while (i < s.length) {
    parts.push(s.slice(i, i + 4))
    i += 4
  }
  return parts.join('，')
}

/**
 * 清洗抓取脚注尾巴：搜狐网页常在文末带「，平台声明：…搜狐…阅读(**)」之类残留，
 * 应作为脏数据剔除，避免出现在用户最终看到的「典故」中。
 * 这里采取保守做法——只剪掉最末尾匹配到的脚注片段，前面的正文一概保留。
 */
function cleanScrapeTail(text) {
  if (!text) return text
  let cleaned = text
    .replace(/[，。；]?\s*平台声明[\s\S]*$/u, '')
    .replace(/[，。；]?\s*搜狐(号|仅)[\s\S]*$/u, '')
    .replace(/[，。；]?\s*阅读\s*\(\s*\*+\s*\)\s*。?$/u, '')
    .replace(/[，；\s]+$/u, '')
  if (!/[。！？]$/.test(cleaned)) cleaned += '。'
  return cleaned
}

/**
 * 公共标点修复：处理拼接造成的"；。"/"，。"/"。。"/孤立分号结尾 等问题。
 * 仅做"修补"，不改语义。
 */
function cleanPunct(text) {
  if (!text) return text
  return text
    .replace(/[；;]+\s*。/g, '。')
    .replace(/[，,]+\s*。/g, '。')
    .replace(/。{2,}/g, '。')
    .replace(/[；;，,]+$/g, '。')
    .replace(/^[，,；;。]+/g, '')
}

function parseOneSign(seg) {
  const body = normalize(seg.body)
  const poem = extractPoem(body)
  const shiyi = extractSection(body, '诗意')
  const jieyueRaw = extractSection(body, '解曰')
  const xianjiRaw = extractSection(body, '仙机')
  const diangu = extractSection(body, '典故')

  if (!poem) {
    console.warn(`[warn] sign ${seg.num} 签诗解析失败 → 跳过`)
    return null
  }

  const xianjiMap = parseXianji(xianjiRaw)

  // jieyue 顺序：先"解曰"（断语），再"诗意"（卦象总论），保证读起来"先释义、再概括"。
  // 用空字符串拼接 —— smoothJieyue 已在每段末尾补"。"，再 join 会出现连续句号，由后续清洗处理。
  const jieyueParts = []
  if (jieyueRaw) jieyueParts.push(smoothJieyue(jieyueRaw))
  if (shiyi) jieyueParts.push(smoothJieyue(shiyi))
  const jieyue = (jieyueParts.filter(Boolean).join('').replace(/。{2,}/g, '。')
    || '以古语观之，凡事宜顺势而行。')

  // xianji 用作"仙机总引言"：
  //   - 若结构化解析成功（15 项），输出"白话化的整段引言"
  //   - 若 free-form，按白话化风格清洗
  //   - 若都没有，给一句默认引言
  let xianjiSummary
  if (Object.keys(xianjiMap).length > 0) {
    xianjiSummary = XIANJI_KEYS
      .map((k) => {
        const raw = xianjiMap[k]
        if (!raw) return null
        const h = humanizeOne(k, raw)
        return h ? `${h.label}${h.value}` : null
      })
      .filter(Boolean)
      .join('；') + '。'
  } else if (xianjiRaw) {
    xianjiSummary = smoothJieyue(xianjiRaw)
  } else {
    xianjiSummary = '凡事谋定而动，积善成吉。'
  }

  const dianguClean = diangu ? cleanScrapeTail(smoothJieyue(diangu)) : ''

  return {
    id: seg.num,
    level: LEVEL_MAP[seg.levelLabel],
    title: seg.title,
    poem,
    jieyue: cleanPunct(jieyue),
    xianji: cleanPunct(xianjiSummary),
    topics: mapTopics(xianjiMap, xianjiRaw),
    diangu: dianguClean,
  }
}

// ─────────────────────────────────────────────────────────────────────
// 5. 主流程
// ─────────────────────────────────────────────────────────────────────

const AGENT_TOOLS = '/Users/TerrellShe/.cursor/projects/Users-TerrellShe-Documents-tt-projects-tt-qimen/agent-tools'

const SOURCE_FILES = [
  path.join(AGENT_TOOLS, '4b85453c-bfc4-4af2-b0f9-5726c826aaa8.txt'), // sohu 系列 1 (1-25)
  path.join(AGENT_TOOLS, 'df3758b8-dfd7-48b4-b6af-93b91f822a33.txt'), // sohu 系列 2 (26-50)
  path.join(AGENT_TOOLS, '1c9a658a-f9dd-4fcd-917b-5e42f96a315d.txt'), // sohu 系列 3 (51-75)
  path.join(AGENT_TOOLS, '1694739b-85f7-4cda-983d-498be2d86928.txt'), // 163 系列 4 (77-100，76 签由 MANUAL 补)
]

// 76-100 签（由 zhouyi.cc / 解签网手工整理的公版文献）
import { MANUAL_76_100 } from './lingqian-76-100.mjs'
// 公版文献缺失/损坏导致需要人工补正的特殊签（id=84 仙机解析失败、id=86/90/91/100 6 topic 共用）
import { LINGQIAN_OVERRIDES } from './lingqian-overrides.mjs'
// 100 签白话化重写（人工撰写）：把白话写到主字段，原文移入 raw 子对象
import { LINGQIAN_HUMANIZED } from './lingqian-humanized.mjs'

function main() {
  const parsed = []
  for (const file of SOURCE_FILES) {
    if (!fs.existsSync(file)) {
      console.error(`[err] source missing: ${file}`)
      process.exit(1)
    }
    const text = fs.readFileSync(file, 'utf8')
    const signs = splitSigns(text)
    console.log(`[debug] ${path.basename(file)} matched ids:`, signs.map((s) => s.num).join(','))
    for (const s of signs) {
      const it = parseOneSign(s)
      if (it) parsed.push(it)
    }
  }

  const byId = new Map()
  for (const it of parsed) {
    if (!byId.has(it.id)) byId.set(it.id, it)
  }
  for (const it of MANUAL_76_100) {
    byId.set(it.id, it)
  }
  // OVERRIDE：把同 id 字段的 fix 合并进去（不动其它字段）
  for (const fix of LINGQIAN_OVERRIDES) {
    const cur = byId.get(fix.id)
    if (cur) {
      byId.set(fix.id, { ...cur, ...fix, topics: { ...cur.topics, ...(fix.topics ?? {}) } })
    } else {
      byId.set(fix.id, fix)
    }
  }

  // HUMANIZED：把白话写入主字段，原公版字段平移到 item.raw（保留古文用于"查看原文"开关）
  for (const h of LINGQIAN_HUMANIZED) {
    const cur = byId.get(h.id)
    if (!cur) continue
    const raw = {
      jieyue: cur.jieyue,
      xianji: cur.xianji,
      topics: cur.topics,
      ...(cur.diangu ? { diangu: cur.diangu } : {}),
    }
    byId.set(h.id, {
      ...cur,
      jieyue: h.jieyue,
      xianji: h.xianji,
      topics: h.topics,
      ...(h.diangu ? { diangu: h.diangu } : {}),
      raw,
    })
  }

  const all = [...byId.values()].sort((a, b) => a.id - b.id)

  const missing = []
  for (let i = 1; i <= 100; i++) {
    if (!byId.has(i)) missing.push(i)
  }
  if (missing.length) {
    console.warn(`[warn] missing signs: ${missing.join(', ')}`)
  }

  const outPath = path.join(ROOT, 'src/modules/lingqian/data/guanyin.json')
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2), 'utf8')

  const dist = all.reduce((acc, it) => {
    acc[it.level] = (acc[it.level] || 0) + 1
    return acc
  }, {})

  console.log(`[ok] wrote ${all.length} signs → ${path.relative(ROOT, outPath)}`)
  console.log(`     level distribution:`, dist)
}

main()
