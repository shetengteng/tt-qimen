/**
 * 常见复姓白名单
 *
 * 用途：
 *  - 用户输入"姓氏"栏时可提示是否为复姓
 *  - 当用户把复姓整个填到"名字"栏（如 surname='欧', givenName='阳修'）时做辅助检测
 *
 * 数据来源：B 类公版（百家姓常见复姓约 20 个，参见百度百科《复姓列表》）
 *
 * isClassical: false — 本文件仅为工具白名单，不涉及古籍文献。
 */

export const COMPOUND_SURNAMES: readonly string[] = Object.freeze([
  '欧阳',
  '司马',
  '诸葛',
  '上官',
  '司徒',
  '尉迟',
  '夏侯',
  '端木',
  '百里',
  '公孙',
  '仲孙',
  '皇甫',
  '长孙',
  '东方',
  '西门',
  '南宫',
  '令狐',
  '慕容',
  '轩辕',
  '宇文',
])

/** 判断任意 2 字字符串是否为已知复姓 */
export function isCompoundSurname(s: string): boolean {
  return s.length === 2 && COMPOUND_SURNAMES.includes(s)
}

/**
 * 尝试在一个 3-4 字的全名前缀中检测复姓。
 * 返回匹配到的复姓长度（2），否则返回 0。
 *
 * 举例：detectCompoundPrefix('欧阳修') → 2；detectCompoundPrefix('李文轩') → 0
 */
export function detectCompoundPrefix(fullName: string): 0 | 2 {
  if (fullName.length < 3) return 0
  return COMPOUND_SURNAMES.includes(fullName.slice(0, 2)) ? 2 : 0
}
