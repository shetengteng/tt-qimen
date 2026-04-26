/**
 * 小六壬 6 宫的英文解读覆盖层
 *
 * 翻译策略（与 numerology.en.ts 范式一致 · skeleton-but-actionable）：
 *  - 保留中文文化意象（Da-An / Su-Xi 等宫名以拼音示意）
 *  - 6 维 readings 单段语义自洽，每段 30-50 词
 *  - suitable/avoid 用 5 项动作短语（动词起头），与中文项数对齐
 *  - 不强行直译"留连"为 "Lingering"，而是抓"滞 / delay"的意象
 *
 * 何时使用：在 LiurenPage 的 calculateLiuren 调用时，根据 locale='en' 选择本表覆盖 palaces.ts 默认的 zh-CN。
 */

import type { Aspect, PalaceName } from '../types'

export interface PalaceLocaleOverride {
  /** 宫的副标题（"静"/"喜" 等单字标签的英文版，用于 PalaceWheel 显示） */
  tag: string
  readings: Record<Aspect, string>
  suitable: readonly string[]
  avoid: readonly string[]
}

export const PALACES_EN: Readonly<Record<PalaceName, PalaceLocaleOverride>> = Object.freeze({
  大安: {
    tag: 'Stillness',
    readings: {
      overall:
        'Da-An governs stillness — the most stable of the six palaces. Things move slowly but the foundation is solid. Hold the line, do not force a quick win; steady progress is itself the best omen.',
      career:
        'Stay the course on existing plans. Leadership leans conservative right now, so postpone bold proposals. Use this window to polish details and consolidate prior wins.',
      love:
        'Relationships are stable; no major upheavals. Singles need not rush — destiny has not arrived. Couples deepen the bond through everyday companionship; slow water carves the deepest channel.',
      wealth:
        'Income is steady, speculation is bleak. Avoid trading, leverage, or large new commitments. Cash is king — preserving what you have is the play.',
      health:
        'Body is in balance, no flare-ups expected. Favor gentle movement (yoga, walking) and a light diet. Avoid overworking yourself.',
      travel:
        'Short trips go smoothly; long-haul not advised. If you must travel far, stick to proven routes — skip the adventurous destinations and extreme activities.',
    },
    suitable: ['Hold position', 'Consolidate gains', 'Recover energy', 'Plan long-term', 'Polish current work'],
    avoid: ['Forcing speed', 'Large investments', 'Long-haul travel', 'Frequent changes', 'Reactive decisions'],
  },

  留连: {
    tag: 'Delay',
    readings: {
      overall:
        'Liu-Lian governs delay — things will drag, recur, and stay unresolved. Not a bad omen, but you must actively push, organize, and communicate to break the stickiness.',
      career:
        'Projects get stuck in approvals, handoffs, and reporting layers. Proactively follow up with the key person; do not wait. Documents and contracts deserve double-checking.',
      love:
        'Old delays or misunderstandings need clearing — do not avoid them. State your needs and limits openly; the longer you postpone, the harder it gets.',
      wealth:
        'Receivables are slow, residuals hard to collect. Chase payments early and tidy your books. Do not commit to new large expenses now.',
      health:
        'Chronic issues recur — do not ignore old conditions. Keep follow-up appointments, take medication on time, avoid late nights and prolonged sitting.',
      travel:
        'Schedules slip — delays and reschedules are likely. Verify timetables in advance and have backups; avoid itineraries with many transfers.',
    },
    suitable: ['Push for progress', 'Clarify openly', 'Clear backlog', 'Re-check documents', 'Settle old debts'],
    avoid: ['Passive waiting', 'New commitments', 'Long contracts', 'Burning the candle', 'Avoiding issues'],
  },

  速喜: {
    tag: 'Joy',
    readings: {
      overall:
        'Su-Xi means joy from the sky — good news is near, seize the timing. Most matters resolve quickly, especially anything already in motion. New beginnings benefit from riding the wave.',
      career:
        'Career is in an upswing window. Pending deals and awaited opportunities have a strong chance of landing soon. Push out, take initiative — communication with bosses and clients flows easier than usual.',
      love:
        'Romance moves fast. Singles meet someone soon; couples warm up. Confessions, declarations, and DTR talks all timed well.',
      wealth:
        'Active money flow — earned income or side gigs. Small investments worth trying; avoid leverage and chasing peaks.',
      health:
        'High energy, training works well. Good moment to start a new fitness plan. Watch out for overstimulation and spicy food.',
      travel:
        'Smooth journeys with pleasant surprises. Business or pleasure both reward; spontaneous short trips especially deliver.',
    },
    suitable: ['Decide fast', 'Take initiative', 'Visit clients', 'Speak your heart', 'Interview / move'],
    avoid: ['Hesitation', 'Endless waiting', 'Nitpicking', 'Missing windows', 'Avoiding the spotlight'],
  },

  赤口: {
    tag: 'Strife',
    readings: {
      overall:
        'Chi-Kou governs disputes — verbal friction, misunderstandings, arguments. Not catastrophic, but mind your words, your emails, and your social moments. Think twice before you speak.',
      career:
        'Workplace friction likely — coordination misfires within the team or tone clashes with externals. Do not decide on emotion; reread important emails before sending.',
      love:
        'Couples bicker over small things. Skip the old grievances and harsh words; reach out first, do not let the night end in cold war. Singles avoid rushed dating right now.',
      wealth:
        'Money disputes appear: chasing debts, partnership disagreements, returns and refunds. Postpone signings; clarify all terms first.',
      health:
        'Throat, mouth, respiratory issues likely. Hydrate, do not shout; emotional tension may bring chest tightness or insomnia.',
      travel:
        'Small frictions on the road (drivers, companions, hosts). Stay polite and contained; avoid confrontation.',
    },
    suitable: ['Speak with care', 'Avoid drama', 'Soften your tone', 'Listen first', 'Stay cool'],
    avoid: ['Picking fights', 'Critical signings', 'Drunk talking', 'Online quarrels', 'Opening partnerships'],
  },

  小吉: {
    tag: 'Harmony',
    readings: {
      overall:
        'Xiao-Ji governs harmony — the warmest, most welcomed of the six palaces. Small matters flow, people get along. Not a grand triumph, but the atmosphere blooms with little surprises.',
      career:
        'Workplace mood is warm, ideal for teamwork and cross-functional collaboration. Small projects ship; large projects in their alignment phase land best now.',
      love:
        'Relationships harmonize. Singles join social events and friend circles — affinity often arrives this way. Couples enjoy short trips and shared time.',
      wealth:
        'Steady money with small gains; unexpected red envelopes, bonuses, rebates all fit this palace. Side income exists — but greed is a trap.',
      health:
        'Body and mind are well, ideal for fine-tuning diet and routine. Minor ailments heal easily; emotional buoyancy supports long-term health.',
      travel:
        'Short trips at their best, especially with friends or partner. Look for warm small moments en route, or unexpected reunions.',
    },
    suitable: ['Gather socially', 'Collaborate', 'Mediate conflict', 'Team meals', 'Open partnerships'],
    avoid: ['Going solo too hard', 'Cold withdrawal', 'Glory grabbing', 'Breaking the peace', 'Excessive demands'],
  },

  空亡: {
    tag: 'Void',
    readings: {
      overall:
        'Kong-Wang governs emptiness — what you ask for likely will not come, or comes hollow. Not necessarily bad, but a sign to slow major decisions, turn inward, and stop expanding outward.',
      career:
        'Big decisions and new project launches are not for now. Use the window to review, learn, and clean house. Finish old work before starting new.',
      love:
        'Relationships drift; thoughts and intentions misalign. Do not rush confessions or breakups; sit quietly with each other and let time settle.',
      wealth:
        'Money has a "slips through fingers" feel: expected income delays, unexpected expenses appear. Avoid large investments and personal loans.',
      health:
        'Mind feels empty, sleep light, mood low. Get sunlight, see family and friends; if low mood persists, seek professional help.',
      travel:
        'Long trips, overseas, and big itineraries should be deferred. If you must go, watch your belongings and stick to safe routes.',
    },
    suitable: ['Reflect and review', 'Tidy and clean', 'Rest and recover', 'Read and learn', 'Let go of attachments'],
    avoid: ['Big decisions', 'Long-haul moves', 'Large investments', 'New contracts', 'Forcing outcomes'],
  },
})
