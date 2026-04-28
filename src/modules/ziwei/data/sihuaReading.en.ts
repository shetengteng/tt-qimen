/**
 * Ziwei Dou Shu · Four Transformations Reading — 40 entries (en skeleton)
 *
 * Status: SKELETON (English placeholder text + structure-aligned).
 *  - Skeleton text for each entry is an intentionally short summary (40-80 words),
 *    NOT a full translation of the zh-CN authoritative text.
 *  - Full localization will be done by professional Ziwei translator + reviewer.
 *
 * Reference for star naming convention (Pinyin + parenthetical English meaning):
 *  follows mainstream English Ziwei literature — e.g. "Ziwei Dou Shu" by Liu Pei-jin.
 */
import type { SihuaReadingMatrix } from './sihuaReading'

export const SIHUA_READING_EN: SihuaReadingMatrix = {
  jia: {
    lu: { star: 'Lianzhen (Probity)', text: 'Jia stem brings Lianzhen Hua-Lu — the Prison Star transforms to fortune, releasing fresh energy where rigidity once stood. Romance and talent rise together; favourable for art, design, politics and negotiation. Take Hua-Lu\'s "flow" into long-term commitment, and avoid drink and lust traps.', verdict: 'ji' },
    quan: { star: 'Pojun (Vanguard)', text: 'Jia stem brings Pojun Hua-Quan — the Vanguard General gains authority, with strong creation and execution power; dares to start over and craft new patterns. Suits entrepreneurship, reform and cross-border roles, but decisiveness may create enemies. Establish before breaking; avoid breaking for breaking\'s sake.', verdict: 'ji' },
    ke: { star: 'Wuqu (Wealth)', text: 'Jia stem brings Wuqu Hua-Ke — the Wealth Star gains reputation; upright action earns professional recognition in finance, engineering and uniformed services. Favourable for certifications, promotion and brand-building, but Hua-Ke leans on name over wealth — pair with Lu/Quan for material gain.', verdict: 'ji' },
    ji: { star: 'Taiyang (Sun)', text: 'Jia stem brings Taiyang Hua-Ji — the Sun is dimmed; career advance may face hidden arrows and reputation loss. Men beware conflicts with father, boss or son; women, with husband or male superior. Stay low-key and patient; "patience" dissolves Hua-Ji\'s "obstruction".', verdict: 'xiong' },
  },
  yi: {
    lu: { star: 'Tianji (Wisdom)', text: 'Yi stem brings Tianji Hua-Lu — wisdom flows freely, with sharp adaptability and shifting opportunities. Best for consulting, research, planning and teaching ("wisdom into wealth"). Cross-disciplinary integration brings windfalls; stay focused, avoid scattered overthinking.', verdict: 'ji' },
    quan: { star: 'Tianliang (Shelter)', text: 'Yi stem brings Tianliang Hua-Quan — the Shelter Star gains authority; just leadership combined with sheltering virtue. Best for medicine, law, education, oversight and religion. Plays the "elder" in teams; beware of "managing too much" and respect intervention boundaries.', verdict: 'ji' },
    ke: { star: 'Ziwei (Emperor)', text: 'Yi stem brings Ziwei Hua-Ke — the Emperor gains scholarly fame; authority and reputation pair well, with the chart easily winning recognition. Suits public service, branding and culture; Hua-Ke turns Ziwei\'s "dominance" into "nobility", more readily commanding respect.', verdict: 'ji' },
    ji: { star: 'Taiyin (Moon)', text: 'Yi stem brings Taiyin Hua-Ji — the Moon-Mother is troubled; bonds with mother, female elders or female subordinates may suffer. Emotional life turbulent, sleep poor, property at risk. Manage family proactively, regulate emotions; "clarity of mind" dissolves Hua-Ji\'s "darkness".', verdict: 'xiong' },
  },
  bing: {
    lu: { star: 'Tiantong (Blessing)', text: 'Bing stem brings Tiantong Hua-Lu — the Blessing Star earns wealth through enjoyment. Best for hospitality, food, design and counseling ("softness into wealth"). Life lacks for nothing; great social bonds. But Tiantong leans easy — Hua-Lu may amplify "ease into oblivion"; self-discipline is needed.', verdict: 'ji' },
    quan: { star: 'Tianji (Wisdom)', text: 'Bing stem brings Tianji Hua-Quan — wisdom gains authority; clear thinking, decisive action. Best for consulting, research, R&D ("wisdom holding power"). The "strategist becomes commander" pattern; but Hua-Quan Tianji may grow "self-righteous of intellect" — listen to dissent.', verdict: 'ji' },
    ke: { star: 'Wenchang (Literary)', text: 'Bing stem brings Wenchang Hua-Ke — literary star earns fame. Best for study, exams, writing, education and media; degrees attain, writing succeeds, certifications flow. Hua-Ke Wenchang leans "noble fame" over money; let name carry profit.', verdict: 'ji' },
    ji: { star: 'Lianzhen (Probity)', text: 'Bing stem brings Lianzhen Hua-Ji — the Prison Star turns sour; "blood, lawsuits, scandal" three risks rise. Affairs entangle in emotion; principle and reality wrestle. Watch legal risk, emotional limits and accidents; "self-discipline" dissolves Hua-Ji\'s "imprisonment".', verdict: 'xiong' },
  },
  ding: {
    lu: { star: 'Taiyin (Moon)', text: 'Ding stem brings Taiyin Hua-Lu — the Moon-Mother gains wealth. Real estate, maternal blessings and artistic income flourish. Best for culture, education, psychology, design and property. Hua-Lu Taiyin is "wealth from gentle affection" — build on emotion, avoid losing for emotion.', verdict: 'ji' },
    quan: { star: 'Tiantong (Blessing)', text: 'Ding stem brings Tiantong Hua-Quan — the Blessing Star activates initiative under its usual ease. Best for "service-led, brand-respected" enterprises. Quietly leads in harmony, without flash. But beware "becoming everyone\'s nice person".', verdict: 'ji' },
    ke: { star: 'Tianji (Wisdom)', text: 'Ding stem brings Tianji Hua-Ke — wisdom gains fame. Best for planning, consulting, teaching, writing and personal media; "tech expert into KOL" pattern. Hua-Ke Tianji is "recognized wisdom"; share generously, do not hoard.', verdict: 'ji' },
    ji: { star: 'Jumen (Big Gate)', text: 'Ding stem brings Jumen Hua-Ji — the Speech Star turns sour; "right and wrong, lawsuits, family quarrels" rise. Loose words invite small enemies. Mind speaking occasions and word choice; "say less, do more, write before speaking" — wisdom dissolves Hua-Ji.', verdict: 'xiong' },
  },
  wu: {
    lu: { star: 'Tanlang (Greedy Wolf)', text: 'Wu stem brings Tanlang Hua-Lu — the Peach Blossom Star earns wealth; multi-talents convert into multi-stream income. Best for marketing, entertainment, hospitality, metaphysics and art. Hua-Lu Tanlang is the "lucky one" pattern, but beware spreading thin — focus on one or two lanes.', verdict: 'ji' },
    quan: { star: 'Taiyin (Moon)', text: 'Wu stem brings Taiyin Hua-Quan — the Moon-Mother gains authority; the once-reserved Taiyin grows opinionated and decisive. Best for cultural industries, real estate, family business and counseling ("soft authority"). Women become capable household leaders; men have wives who lift them.', verdict: 'ji' },
    ke: { star: 'Youbi (Right Assistant)', text: 'Wu stem brings Youbi Hua-Ke — the Assistant Star earns fame. Best for PR, diplomacy, HR and assisting roles; the "deputy who steals the show" pattern. Hua-Ke Youbi is "fame through assistance" — be the green leaf willingly, avoid grabbing the trophy.', verdict: 'ji' },
    ji: { star: 'Tianji (Wisdom)', text: 'Wu stem brings Tianji Hua-Ji — wisdom is troubled; "overthinking, oscillating decisions, cleverness losing the big picture" all rise. The "outsmarting oneself" trap appears; think thrice, avoid tunnel vision; "from motion to stillness" dissolves Hua-Ji.', verdict: 'xiong' },
  },
  ji: {
    lu: { star: 'Wuqu (Wealth)', text: 'Ji stem brings Wuqu Hua-Lu — the Wealth Star is doubly blessed; wealth flows abundantly, industries thrive. Best for finance, engineering, uniformed services, surgery and machinery ("hard-skill" lanes). Hua-Lu Wuqu is the "money machine" pattern, but watch out for over-materialism and emotional flatness.', verdict: 'ji' },
    quan: { star: 'Tanlang (Greedy Wolf)', text: 'Ji stem brings Tanlang Hua-Quan — the Peach Blossom Star gains authority; multi-talents convert into control. Best for marketing, entertainment, metaphysics and art ("talent-led authority"). Hua-Quan Tanlang carries strong leadership desire; avoid "ruling by desire" pitfalls.', verdict: 'ji' },
    ke: { star: 'Tianliang (Shelter)', text: 'Ji stem brings Tianliang Hua-Ke — the Shelter Star earns fame. Best for medicine, law, education and oversight ("sheltering" roles); the "old scholar / elder presence" reputation. Hua-Ke Tianliang is "noble fame" — convince through virtue, avoid moralizing.', verdict: 'ji' },
    ji: { star: 'Wenqu (Literary Talent)', text: 'Ji stem brings Wenqu Hua-Ji — the Literary Star turns sour; "documents, exams, contracts, romance" all warp. Mind contract review, exam performance and emotional entanglements; "black ink on white paper, leave a trace" — meticulous detail dissolves Hua-Ji.', verdict: 'xiong' },
  },
  geng: {
    lu: { star: 'Taiyang (Sun)', text: 'Geng stem brings Taiyang Hua-Lu — the Sun gains wealth; career grows expansively, fame and gain together. Best for public service, education, healthcare, media and philanthropy ("shine for others"). Hua-Lu Taiyang is "wealth from light"; stand on sunlit lanes, avoid shady paths.', verdict: 'ji' },
    quan: { star: 'Wuqu (Wealth)', text: 'Geng stem brings Wuqu Hua-Quan — the Wealth Star gains authority; bold decisions, formidable execution. Best for finance, engineering, uniformed services ("hard skill + strong authority"). Hua-Quan Wuqu is the "iron-and-velvet doer"; build credit on power, do not crush with it.', verdict: 'ji' },
    ke: { star: 'Tianfu (Treasury)', text: 'Geng stem brings Tianfu Hua-Ke — the Treasury Star earns fame; "the steady name, the elder\'s honour". Best for finance, administration, family business, traditional sectors. Hua-Ke Tianfu is "credit as capital"; build name through stability, avoid impulsive moves that damage reputation.', verdict: 'ji' },
    ji: { star: 'Tiantong (Blessing)', text: 'Geng stem brings Tiantong Hua-Ji — the Blessing Star is troubled; the once-relaxed Tiantong loses balance, with "blessing depleted, health drained, emotions hurt". Mind body-and-mind care, relationship maintenance; "actively cultivate happiness, avoid sitting back" — motion-cultivation dissolves Hua-Ji.', verdict: 'xiong' },
  },
  xin: {
    lu: { star: 'Jumen (Big Gate)', text: 'Xin stem brings Jumen Hua-Lu — the Speech Star earns wealth. Best for law, media, teaching, consulting, sales, medicine and research ("speech-led" trades). Hua-Lu Jumen is the "sharp-tongued earner" pattern, but still beware "trouble through the mouth"; speak with care.', verdict: 'ji' },
    quan: { star: 'Taiyang (Sun)', text: 'Xin stem brings Taiyang Hua-Quan — the Sun gains authority; career grows grander, leadership stronger. Best for public service, politics, branding and culture ("framework-building"). Hua-Quan Taiyang is "bright with authority"; build power on "helping others is helping oneself".', verdict: 'ji' },
    ke: { star: 'Wenqu (Literary Talent)', text: 'Xin stem brings Wenqu Hua-Ke — the Literary Star earns fame. Best for writing, oratory, art and media; "talent widely recognized" pattern. Hua-Ke Wenqu differs slightly from Wenchang — leans toward "fame through eloquence and art"; build presence on talent.', verdict: 'ji' },
    ji: { star: 'Wenchang (Literary)', text: 'Xin stem brings Wenchang Hua-Ji — the Literary Star turns sour; "documents, exams, contracts, seals" all warp. Mind academics, signatures, lost stamps and document errors; "review key documents repeatedly" — reverence dissolves Hua-Ji.', verdict: 'xiong' },
  },
  ren: {
    lu: { star: 'Tianliang (Shelter)', text: 'Ren stem brings Tianliang Hua-Lu — the Shelter Star earns wealth; "wealth through good deeds, gain through virtue". Best for medicine, law, education, religion, philanthropy and oversight ("sheltering" roles). Hua-Lu Tianliang is the "yin-virtue into karmic blessing" pattern; carry compassion always.', verdict: 'ji' },
    quan: { star: 'Ziwei (Emperor)', text: 'Ren stem brings Ziwei Hua-Quan — the Emperor gains authority; both authority and leadership are formidable. Best for public service, politics, branding and culture ("framework-building"). Hua-Quan Ziwei is the "sovereign" pattern; beware excessive pride and stubbornness.', verdict: 'ji' },
    ke: { star: 'Tianfu (Treasury)', text: 'Ren stem brings Tianfu Hua-Ke — the Treasury Star earns fame; "steady name + abundant substance". Best for finance, administration, family business, traditional sectors. Hua-Ke Tianfu is "elder honour into actual treasury"; build name through stability.', verdict: 'ji' },
    ji: { star: 'Wuqu (Wealth)', text: 'Ren stem brings Wuqu Hua-Ji — the Wealth Star is troubled; "money loss, lawsuits, rigidity wounding feelings, metal disasters" all rise. Mind financial management, contract review, interpersonal communication, sport safety; "softness offsets hardness" — softening edges dissolves Hua-Ji.', verdict: 'xiong' },
  },
  gui: {
    lu: { star: 'Pojun (Vanguard)', text: 'Gui stem brings Pojun Hua-Lu — the Vanguard General earns wealth; "break and rebuild, gain through change". Best for tech, sales, startups, art, overseas work and crisis handling ("break-rebuild" trades). Hua-Lu Pojun is the "dare-to-dream-and-do earner" pattern; establish before breaking.', verdict: 'ji' },
    quan: { star: 'Jumen (Big Gate)', text: 'Gui stem brings Jumen Hua-Quan — the Speech Star gains authority; sharp words and firm stance. Best for law, media, debate and consulting ("authority through speech"). Hua-Quan Jumen is the "tongue-master" pattern; convince by reason, do not pressure by power.', verdict: 'ji' },
    ke: { star: 'Taiyin (Moon)', text: 'Gui stem brings Taiyin Hua-Ke — the Moon-Mother earns fame; "gentle name, artistic honour". Best for culture, education, psychology, design and property ("soft fame"). Hua-Ke Taiyin is the "widely loved" pattern.', verdict: 'ji' },
    ji: { star: 'Tanlang (Greedy Wolf)', text: 'Gui stem brings Tanlang Hua-Ji — the Peach Blossom Star is troubled; "scandal entanglements, drink-and-lust harm, missed opportunities, metaphysics confusion" all rise. Mind emotional limits, health restraint and opportunity discernment; "focus and deep work" — desire reduction dissolves Hua-Ji.', verdict: 'xiong' },
  },
}
