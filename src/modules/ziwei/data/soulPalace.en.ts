/**
 * Ziwei Dou Shu · Life Palace Major Star Reading — 14 entries (en skeleton)
 *
 * Status: SKELETON (English placeholder text + English keywords).
 *  - Skeleton text for each entry is intentionally short summary, NOT a full translation.
 *  - Full localization will be done by professional Ziwei translator + reviewer.
 *  - Keywords are translated to be UI-renderable now; chips render in English.
 *
 * Reference for star naming convention (Pinyin + parenthetical English meaning):
 *  follows mainstream English Ziwei literature — e.g. "Ziwei Dou Shu" by Liu Pei-jin.
 */
import type { MajorStarKey, SoulPalaceEntry } from './soulPalace'

export const SOUL_PALACE_EN: Record<MajorStarKey, SoulPalaceEntry> = {
  ziwei: {
    key: 'ziwei',
    name: 'Ziwei (Emperor Star)',
    text: "Ziwei is the Emperor Star and lord of the Northern Dipper. With Ziwei in the Life Palace, the native carries dignity and natural authority, with a strong sense of the bigger picture. Such people are decisive and principled, naturally taking the central role in any team. Strengths lie in vision, leadership and convening power; risks come from pride and resistance to dissent. Best suited for management, politics, branding and cultural leadership — roles that require setting the tone, not executing at the edge.",
    keywords: ['Emperor', 'Leadership', 'Vision', 'Authority', 'Pride'],
  },
  tianji: {
    key: 'tianji',
    name: 'Tianji (Wisdom Star)',
    text: 'Tianji is the Star of Brothers and intellect. With Tianji in the Life Palace, the native is sharp-minded, far-sighted and skilled at planning and adaptation. Such people enjoy thinking through systems and changes, often playing the strategist. Strengths lie in insight and adaptability — fitting careers like consulting, research, planning, advisory and education. Risks include overthinking and self-consumption; decisions may oscillate. The remedy is "stillness within motion": pair with grounded executors to bring ideas to life.',
    keywords: ['Strategy', 'Adaptability', 'Insight', 'Volatility', 'Planning'],
  },
  taiyang: {
    key: 'taiyang',
    name: 'Taiyang (Sun Star)',
    text: 'Taiyang governs the Career Palace as the Star of Officialdom. With Taiyang in the Life Palace, the native is bright, warm-hearted, responsible and altruistic. Naturally outgoing and reputation-conscious, they uplift others and shine on a public stage. Strengths lie in influence and credibility — suited for public service, education, healthcare, media and philanthropy. Risks include burnout and being targeted for being too upright. When Bright (廟旺), great achievement follows; when Fallen (落陷) or with malefics, watch for eye health, overwork and weak father bonds. The path of "helping others is helping oneself" works best.',
    keywords: ['Brightness', 'Passion', 'Officialdom', 'Altruism', 'Burnout'],
  },
  wuqu: {
    key: 'wuqu',
    name: 'Wuqu (Wealth Star)',
    text: 'Wuqu is the Wealth Star, hard metal of the Northern Dipper. With Wuqu in the Life Palace, the native is resolute, strong-willed and action-oriented — a textbook "doer". Direct in style, valuing promises and efficiency, with strong control over money and goals. Strengths lie in execution and financial discipline — fitting finance, engineering, military/police and industry. Risks include rigidity and emotional reticence; partners may feel distance. With Hua Lu/Hua Quan, wealth flourishes; with Hua Ji, beware of losses and accidents. The remedy is to soften strength with warmth and stay focused on one craft.',
    keywords: ['Resolve', 'Wealth', 'Execution', 'Decisive', 'Reserved'],
  },
  tiantong: {
    key: 'tiantong',
    name: 'Tiantong (Blessing Star)',
    text: 'Tiantong governs blessing and longevity. With Tiantong in the Life Palace, the native is gentle, content and well-liked. Naturally drawn to ease, they value lifestyle and harmony, and are skilled at defusing conflicts. Strengths lie in approachability and good fortune — fitting hospitality, design, counseling, food and entertainment. Risks include lack of drive and overindulgence in comfort; emotional spillover may also cost. When Bright with helper stars, life is well-fed and well-supported; when Fallen or with malefics, the native must actively temper the will.',
    keywords: ['Blessing', 'Gentle', 'Comfort', 'Harmony', 'Indolence'],
  },
  lianzhen: {
    key: 'lianzhen',
    name: 'Lianzhen (Probity / Peach Blossom)',
    text: "Lianzhen is the Secondary Peach Blossom and a Prison Star. With Lianzhen in the Life Palace, the native has a striking personality, intense feelings and a cool exterior with hot interior — combining principled rigor with romantic edge. Their psyche shifts between principle and passion, with a strong sense of aesthetics and gravitas. Strengths lie in taste, focus and negotiation — suited for law, art, design, politics and detective work. Risks include emotional entanglements and the inner pull between ideals and reality; with malefics or Hua Ji, beware of legal trouble, scandal and bloodshed. The path is 'self-discipline as freedom'.",
    keywords: ['Peach Blossom', 'Principle', 'Aesthetic', 'Persistent', 'Extreme'],
  },
  tianfu: {
    key: 'tianfu',
    name: 'Tianfu (Treasury Star)',
    text: "Tianfu is the lord of the Southern Dipper and the Treasury. With Tianfu in the Life Palace, the native is steady, generous and naturally seasoned, with deep composure. Calm and reserved in opinion, conservative and steady in decision, skilled at accumulation and stewardship. Strengths lie in reserves, coordination and risk control — fitting finance, administration, family business, traditional sectors and steady entrepreneurship. Risks include over-caution that misses fast-moving windows; growth caps without bold moves. With Hua Ke, reputation rises; the worst case is an 'empty treasury' — Tianfu without Lu Cun or Hua Lu — appearing strong but hollow.",
    keywords: ['Treasury', 'Steady', 'Stewardship', 'Generous', 'Conservative'],
  },
  taiyin: {
    key: 'taiyin',
    name: 'Taiyin (Moon Star)',
    text: 'Taiyin governs the Property Palace as the Moon Star of the Heavens. With Taiyin in the Life Palace, the native is gentle, introspective, perceptive and family-oriented, with deep emotional life. Quiet by nature, attuned to others and exquisitely sensitive to beauty and feelings, often gifted in art and writing. Strengths lie in reading people and shaping atmosphere — fitting writing, design, education, psychology, cultural industries and real estate. Risks include emotional swings and procrastination through fantasy; when Fallen or with malefics, watch maternal bonds and sleep. When Bright with helpers, life is well-fed and beautifully arranged inside and out.',
    keywords: ['Property', 'Subtle', 'Sensitive', 'Reserved', 'Emotional'],
  },
  tanlang: {
    key: 'tanlang',
    name: 'Tanlang (Greedy Wolf)',
    text: 'Tanlang is the Major Peach Blossom and the resolver of misfortune. With Tanlang in the Life Palace, the native is multi-talented, socially wide-reaching and richly desiring, agile and good at forming bonds. Lively and novelty-seeking, drawn to learning, art, metaphysics and social life — often described as "able to do a bit of everything". Strengths lie in learning breadth and PR power — fitting marketing, entertainment, hospitality, metaphysics, art and diplomacy. Risks include spreading thin and getting lost in pleasure and social obligations. Hua Lu brings a life of opportunity; Hua Ji warns against drink, lust and emotional entanglement.',
    keywords: ['Peach Blossom', 'Versatile', 'Social', 'Desire', 'Adaptive'],
  },
  jumen: {
    key: 'jumen',
    name: 'Jumen (Big Gate)',
    text: "Jumen is the Star of Speech and a Dark Star. With Jumen in the Life Palace, the native is articulate, analytically sharp and research-minded, gifted at unearthing the deep logic of things. Skeptical and meticulous, with cutting words and clear positions, near-obsessive about truth. Strengths lie in expression and insight — fitting law, media, teaching, consulting, sales, medicine and research. Risks include verbal disputes and accumulating enemies; with Hua Ji, watch for litigation, rumor and family quarrels. The path is 'win by wisdom rather than argument' — let the sharp tongue serve, not wound.",
    keywords: ['Eloquence', 'Analysis', 'Depth', 'Dispute', 'Skeptical'],
  },
  tianxiang: {
    key: 'tianxiang',
    name: 'Tianxiang (Seal Star)',
    text: 'Tianxiang is the Seal Star and assistant to the Career. With Tianxiang in the Life Palace, the native is gracious, dependable, trustworthy and ceremonious — the archetype of "Chief of Staff" or "Number Two". Just and coordinating, methodical and uplifting to others, often the stabilizer and binder of any team. Strengths lie in trust, execution and organization — suited for public service, administration, law, HR, consulting and brand management. Risks include lack of initiative and going with the flow; "Seal squeezed by Punishment-Ji" causes constraint. When Bright with helpers, life is rich in mentors and reputation; the worst case is a "naked seal" — isolated and unsupported.',
    keywords: ['Seal', 'Steady', 'Assist', 'Just', 'Dependent'],
  },
  tianliang: {
    key: 'tianliang',
    name: 'Tianliang (Shelter Star)',
    text: 'Tianliang is the Star of Parents, Longevity and Sheltering Virtue. With Tianliang in the Life Palace, the native is upright, compassionate and carries an "elder\'s presence" — averting danger and benefiting from noble patronage. Bookish and merciful, fond of solving others\' problems and offering opinions, mature beyond their years. Strengths lie in convening power and dispute resolution — fitting medicine, law, education, religion, philanthropy, oversight and consulting. Risks include over-involvement in others\' affairs and limited grasp of personal finance. Hua Lu averts misfortune throughout life; when Fallen with malefics, the native must let go of the "savior complex".',
    keywords: ['Shelter', 'Upright', 'Resolution', 'Aloof', 'Meddling'],
  },
  qisha: {
    key: 'qisha',
    name: 'Qisha (Seven Killings)',
    text: 'Qisha is the General Star and the Star of Severity. With Qisha in the Life Palace, the native is independent, decisive and lives a life of upheaval and creation. Cool outside, hard inside, valuing solo decisions and disliking being constrained, with explosive power at major turning points. Strengths lie in creation and resilience under pressure — fitting entrepreneurship, military/police, surgery, sports, construction and independent professions. Risks include excessive rigidity, social tension, and costs to relationships and health. With Lu Cun or Ziwei in the same palace, danger turns to fortune and the format succeeds; the worst case is voids stacked with malefics — requiring early hardship and mid-life consolidation to mature.',
    keywords: ['General', 'Pioneering', 'Decisive', 'Turbulent', 'Lone'],
  },
  pojun: {
    key: 'pojun',
    name: 'Pojun (Vanguard / Breaker)',
    text: 'Pojun is the Star of Consumption and the Vanguard General. With Pojun in the Life Palace, the native dares to revolutionize, has a unique character and breaks convention — the archetype of the "game-changer". Passionate with destructive edge, fond of replacing the old with the new, restless and decisive while others hesitate. Strengths lie in renewal and execution — fitting tech, sales, startups, art, overseas work and crisis handling. Risks include heavy consumption and volatile relationships and finances; with Hua Ji or Fire/Bell stars, beware of accidents and legal trouble. The path is "establish before breaking" — avoid breaking for breaking\'s sake; with Ziwei in the same palace or Hua Lu, life unfolds with grand vision.',
    keywords: ['Vanguard', 'Revolution', 'Consumption', 'Maverick', 'Pioneer'],
  },
}
