/**
 * 命盘指纹 = sha1(moduleId + 关键入参)
 *
 * 用途：作为 ChatSession 的主键。换一个生辰 = 换一个 fingerprint = 自动切到新会话；
 * 同一个生辰 / 相同入参 = 复用历史对话。
 *
 * 用 Web Crypto API（浏览器原生），不引第三方依赖。
 */

import type { ModuleId } from '@/router'

/**
 * 各模块 fingerprint 入参字段的**参考定义**（设计文档 §11.2）。
 *
 * 历史教训：早期实现把这里当作"白名单"过滤 params —— 但各 contextBuilder
 * 实际传入的 key 名常与此处不一致（例如 bazi 传 solar / yearGanzhi，
 * 而本表写的是 year / month / day），导致除 gender 外所有字段被过滤掉，
 * fingerprint 全部退化为"按性别一组" → 不同生辰复用同一个 AI 会话。
 *
 * 当前策略：本常量不再参与 hash，仅作**文档化注释 + 单测对照**。
 * 真正进入 hash 的是 buildFingerprintSync 收到的 params 全部 own keys。
 * 调用方负责保证："命盘身份不同 → params 内容不同"。
 */
export const FINGERPRINT_FIELDS: Record<ModuleId, readonly string[]> = {
  bazi:     ['calendar', 'year', 'month', 'day', 'hour', 'minute', 'gender'],
  ziwei:    ['calendar', 'year', 'month', 'day', 'hour', 'gender'],
  liuren:   ['year', 'month', 'day', 'hour', 'minute', 'second'],
  chenggu:  ['calendar', 'year', 'month', 'day', 'hour', 'gender'],
  lingqian: ['qianId'],
  xingming: ['name', 'gender', 'calendar', 'year', 'month', 'day'],
  huangli:  ['year', 'month', 'day'],
  jiemeng:  ['dreamId'],
}

/**
 * 把 params 序列化成 hash 输入字符串。
 * - 按 key 字典序排序，保证字段顺序无关
 * - undefined / null 用空串占位，与之前行为兼容
 */
function serializeParams(params: Record<string, unknown>): string {
  const keys = Object.keys(params).sort()
  const parts: string[] = []
  for (const k of keys) {
    const v = params[k]
    parts.push(`${k}=${v == null ? '' : String(v)}`)
  }
  return parts.join('|')
}

/**
 * 构造命盘指纹（异步，因 Web Crypto 是 async）。
 *
 * - 字段顺序无关：先按 key 排序再 stringify
 * - 取 SHA-1 前 16 hex（64 bit），冲突概率 ~2^-32，对个人占卜量足够
 * - 输出形如：`bazi:a3f2c4d18b9e0d11`
 */
export async function buildFingerprint(
  moduleId: ModuleId,
  params: Record<string, unknown>,
): Promise<string> {
  const text = `${moduleId}|${serializeParams(params)}`
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text))
  const hex = Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return `${moduleId}:${hex.slice(0, 16)}`
}

/**
 * 同步版本（仅用于无法 await 的场景，如 computed）。
 *
 * 牺牲加密强度换同步：把字段拼成字符串后做 djb2 hash，输出 8 hex。
 * 不能用于安全场景，但对"会话身份"语义完全够用，且不可逆。
 */
export function buildFingerprintSync(
  moduleId: ModuleId,
  params: Record<string, unknown>,
): string {
  const text = `${moduleId}|${serializeParams(params)}`
  /* djb2 hash */
  let hash = 5381
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i)
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0')
  return `${moduleId}:${hex}`
}
