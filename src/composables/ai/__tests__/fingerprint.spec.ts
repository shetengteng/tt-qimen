import { describe, expect, it } from 'vitest'
import { FINGERPRINT_FIELDS, buildFingerprint, buildFingerprintSync } from '../fingerprint'
import type { ModuleId } from '@/router'

/**
 * P5-10：fingerprint 单元测试
 *
 * 覆盖：
 * - 字段顺序无关（异步 + 同步）
 * - 模块互不干扰（同一份入参换 moduleId 必生不同 fp）
 * - 关键字段任一变化必生不同 fp
 * - 仅 FINGERPRINT_FIELDS 之外的字段被排除（noise 字段不影响 fp）
 * - 输出格式：`{moduleId}:{16-hex}` (async) / `{moduleId}:{8-hex}` (sync)
 *
 * 8 个模块 × 5 个样本：
 * - 1 baseline
 * - 2 改一个核心字段（应换 fp）
 * - 3 字段顺序打乱（应同 fp）
 * - 4 加 noise 字段（应同 fp）
 * - 5 换日期（应换 fp）
 */

interface ModuleSample {
  moduleId: ModuleId
  /** 5 份样本：[baseline, 改字段, 乱序, +noise, 换日期] */
  samples: [
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
  ]
}

const SAMPLES: readonly ModuleSample[] = [
  {
    moduleId: 'bazi',
    samples: [
      { calendar: 'solar', year: 1985, month: 11, day: 8, hour: 12, minute: 0, gender: 'male' },
      { calendar: 'solar', year: 1985, month: 11, day: 8, hour: 12, minute: 0, gender: 'female' },
      { gender: 'male', minute: 0, hour: 12, day: 8, month: 11, year: 1985, calendar: 'solar' },
      {
        calendar: 'solar', year: 1985, month: 11, day: 8, hour: 12, minute: 0, gender: 'male',
        birthplace: '北京', name: '张三',
      },
      { calendar: 'solar', year: 1990, month: 6, day: 1, hour: 12, minute: 0, gender: 'male' },
    ],
  },
  {
    moduleId: 'ziwei',
    samples: [
      { calendar: 'solar', year: 1985, month: 11, day: 8, hour: 12, gender: 'male' },
      { calendar: 'lunar', year: 1985, month: 11, day: 8, hour: 12, gender: 'male' },
      { gender: 'male', hour: 12, day: 8, month: 11, year: 1985, calendar: 'solar' },
      {
        calendar: 'solar', year: 1985, month: 11, day: 8, hour: 12, gender: 'male',
        location: '上海',
      },
      { calendar: 'solar', year: 2000, month: 1, day: 1, hour: 12, gender: 'male' },
    ],
  },
  {
    moduleId: 'liuren',
    samples: [
      { year: 2026, month: 4, day: 29, hour: 10, minute: 30, second: 0 },
      { year: 2026, month: 4, day: 29, hour: 10, minute: 30, second: 15 },
      { second: 0, minute: 30, hour: 10, day: 29, month: 4, year: 2026 },
      {
        year: 2026, month: 4, day: 29, hour: 10, minute: 30, second: 0,
        question: '今日运势如何', randomSeed: 42,
      },
      { year: 2027, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
    ],
  },
  {
    moduleId: 'chenggu',
    samples: [
      { calendar: 'solar', year: 1985, month: 11, day: 8, hour: 12, gender: 'male' },
      { calendar: 'solar', year: 1985, month: 11, day: 8, hour: 13, gender: 'male' },
      { gender: 'male', hour: 12, day: 8, month: 11, year: 1985, calendar: 'solar' },
      {
        calendar: 'solar', year: 1985, month: 11, day: 8, hour: 12, gender: 'male',
        comment: '只算骨重',
      },
      { calendar: 'lunar', year: 1985, month: 11, day: 8, hour: 12, gender: 'male' },
    ],
  },
  {
    moduleId: 'lingqian',
    samples: [
      { qianId: 'guanyin-001' },
      { qianId: 'guanyin-002' },
      { qianId: 'guanyin-001' },
      { qianId: 'guanyin-001', drawerName: '匿名', timestamp: 1234 },
      { qianId: 'huangdaxian-001' },
    ],
  },
  {
    moduleId: 'xingming',
    samples: [
      { name: '张三', gender: 'male', calendar: 'solar', year: 1985, month: 11, day: 8 },
      { name: '李四', gender: 'male', calendar: 'solar', year: 1985, month: 11, day: 8 },
      { day: 8, month: 11, year: 1985, calendar: 'solar', gender: 'male', name: '张三' },
      {
        name: '张三', gender: 'male', calendar: 'solar', year: 1985, month: 11, day: 8,
        wuge: { tian: 12, ren: 14 },
      },
      { name: '张三', gender: 'female', calendar: 'solar', year: 1985, month: 11, day: 8 },
    ],
  },
  {
    moduleId: 'huangli',
    samples: [
      { year: 2026, month: 4, day: 29 },
      { year: 2026, month: 4, day: 30 },
      { day: 29, month: 4, year: 2026 },
      { year: 2026, month: 4, day: 29, lunar: '丙午年三月初十', solarTerm: '谷雨' },
      { year: 2027, month: 1, day: 1 },
    ],
  },
  {
    moduleId: 'jiemeng',
    samples: [
      { dreamId: 'dream-蛇' },
      { dreamId: 'dream-龙' },
      { dreamId: 'dream-蛇' },
      { dreamId: 'dream-蛇', summary: '梦见红蛇盘绕', mood: 'positive' },
      { dreamId: 'dream-飞翔' },
    ],
  },
]

describe('FINGERPRINT_FIELDS', () => {
  it('contains an entry for each of the 8 modules', () => {
    const allModules: ModuleId[] = ['bazi', 'ziwei', 'liuren', 'chenggu', 'lingqian', 'xingming', 'huangli', 'jiemeng']
    for (const m of allModules) {
      expect(FINGERPRINT_FIELDS[m]).toBeTruthy()
      expect(FINGERPRINT_FIELDS[m].length).toBeGreaterThan(0)
    }
  })
})

describe('buildFingerprint (async, SHA-1 truncated)', () => {
  for (const ms of SAMPLES) {
    const [s0, s1, s2, s3, s4] = ms.samples

    describe(`module: ${ms.moduleId}`, () => {
      it('outputs the format `{moduleId}:{16-hex}`', async () => {
        const fp = await buildFingerprint(ms.moduleId, s0)
        expect(fp).toMatch(new RegExp(`^${ms.moduleId}:[0-9a-f]{16}$`))
      })

      it('changes when a core field differs', async () => {
        const fpA = await buildFingerprint(ms.moduleId, s0)
        const fpB = await buildFingerprint(ms.moduleId, s1)
        expect(fpA).not.toBe(fpB)
      })

      it('is field-order-agnostic (shuffled keys → same fp)', async () => {
        const fpA = await buildFingerprint(ms.moduleId, s0)
        const fpC = await buildFingerprint(ms.moduleId, s2)
        expect(fpA).toBe(fpC)
      })

      it('ignores non-fingerprint noise fields', async () => {
        const fpA = await buildFingerprint(ms.moduleId, s0)
        const fpD = await buildFingerprint(ms.moduleId, s3)
        expect(fpA).toBe(fpD)
      })

      it('changes when the date / id differs', async () => {
        const fpA = await buildFingerprint(ms.moduleId, s0)
        const fpE = await buildFingerprint(ms.moduleId, s4)
        expect(fpA).not.toBe(fpE)
      })
    })
  }

  it('different modules with the same params produce different fingerprints', async () => {
    const sharedParams = { year: 2026, month: 4, day: 29 }
    const fpHuangli = await buildFingerprint('huangli', sharedParams)
    const fpLiuren = await buildFingerprint('liuren', sharedParams)
    expect(fpHuangli).not.toBe(fpLiuren)
    expect(fpHuangli.startsWith('huangli:')).toBe(true)
    expect(fpLiuren.startsWith('liuren:')).toBe(true)
  })
})

describe('buildFingerprintSync (djb2 hash)', () => {
  for (const ms of SAMPLES) {
    const [s0, s1, s2, s3, s4] = ms.samples

    describe(`module: ${ms.moduleId}`, () => {
      it('outputs the format `{moduleId}:{8-hex}`', () => {
        const fp = buildFingerprintSync(ms.moduleId, s0)
        expect(fp).toMatch(new RegExp(`^${ms.moduleId}:[0-9a-f]{8}$`))
      })

      it('changes when a core field differs', () => {
        expect(buildFingerprintSync(ms.moduleId, s0))
          .not.toBe(buildFingerprintSync(ms.moduleId, s1))
      })

      it('is field-order-agnostic (shuffled keys → same fp)', () => {
        expect(buildFingerprintSync(ms.moduleId, s0))
          .toBe(buildFingerprintSync(ms.moduleId, s2))
      })

      it('ignores non-fingerprint noise fields', () => {
        expect(buildFingerprintSync(ms.moduleId, s0))
          .toBe(buildFingerprintSync(ms.moduleId, s3))
      })

      it('changes when the date / id differs', () => {
        expect(buildFingerprintSync(ms.moduleId, s0))
          .not.toBe(buildFingerprintSync(ms.moduleId, s4))
      })
    })
  }

  it('different modules with the same params produce different fingerprints', () => {
    const sharedParams = { year: 2026, month: 4, day: 29 }
    expect(buildFingerprintSync('huangli', sharedParams))
      .not.toBe(buildFingerprintSync('liuren', sharedParams))
  })

  it('is deterministic (same input → same output across calls)', () => {
    const fpA = buildFingerprintSync('bazi', SAMPLES[0].samples[0])
    const fpB = buildFingerprintSync('bazi', SAMPLES[0].samples[0])
    expect(fpA).toBe(fpB)
  })
})
