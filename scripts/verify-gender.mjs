#!/usr/bin/env node
/**
 * 验证：男女在相同生辰下，bazi 与 ziwei 的输出差异。
 * 期望：大运、起运岁数、（紫微）大限/小限/流年方向 都应不同。
 */

import { ChildLimit, Gender, SolarTime } from 'tyme4ts'

const birth = { year: 1990, month: 5, day: 20, hour: 12, minute: 0 }
const solar = SolarTime.fromYmdHms(birth.year, birth.month, birth.day, birth.hour, birth.minute, 0)

console.log('='.repeat(60))
console.log('八字静态部分（男女应一样）')
console.log('='.repeat(60))
const ec = solar.getLunarHour().getEightChar()
console.log('年柱:', ec.getYear().getName())
console.log('月柱:', ec.getMonth().getName())
console.log('日柱:', ec.getDay().getName())
console.log('时柱:', ec.getHour().getName())

console.log()
console.log('='.repeat(60))
console.log('男 · 大运（应顺排）')
console.log('='.repeat(60))
const childLimitMan = ChildLimit.fromSolarTime(solar, Gender.MAN)
console.log('起运岁数:', childLimitMan.getYearCount(), '岁', childLimitMan.getMonthCount(), '个月')
let curMan = childLimitMan.getStartDecadeFortune()
for (let i = 0; i < 8; i++) {
  console.log(
    `  大运 ${i + 1}: ${curMan.getSixtyCycle().getName()} (${curMan.getStartAge()}-${curMan.getEndAge()}岁, ${curMan.getStartSixtyCycleYear().getYear()}-${curMan.getEndSixtyCycleYear().getYear()})`,
  )
  curMan = curMan.next(1)
}

console.log()
console.log('='.repeat(60))
console.log('女 · 大运（应逆排，与男相反方向）')
console.log('='.repeat(60))
const childLimitWoman = ChildLimit.fromSolarTime(solar, Gender.WOMAN)
console.log('起运岁数:', childLimitWoman.getYearCount(), '岁', childLimitWoman.getMonthCount(), '个月')
let curWoman = childLimitWoman.getStartDecadeFortune()
for (let i = 0; i < 8; i++) {
  console.log(
    `  大运 ${i + 1}: ${curWoman.getSixtyCycle().getName()} (${curWoman.getStartAge()}-${curWoman.getEndAge()}岁, ${curWoman.getStartSixtyCycleYear().getYear()}-${curWoman.getEndSixtyCycleYear().getYear()})`,
  )
  curWoman = curWoman.next(1)
}

console.log()
console.log('='.repeat(60))
console.log('结论')
console.log('='.repeat(60))
const manCycle1 = childLimitMan.getStartDecadeFortune().getSixtyCycle().getName()
const womanCycle1 = childLimitWoman.getStartDecadeFortune().getSixtyCycle().getName()
console.log(`男第一步大运: ${manCycle1}`)
console.log(`女第一步大运: ${womanCycle1}`)
console.log(`是否不同: ${manCycle1 !== womanCycle1 ? '✅ 不同（正确）' : '❌ 相同（异常！）'}`)
