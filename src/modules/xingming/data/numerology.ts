/**
 * 姓名学 81 数理（熊崎健翁流派 · 1918）
 *
 * 数据说明：
 *   - 1..81 每数一条，含 number / level / element / summary / description
 *   - level：6 档 '大吉' | '吉' | '中吉' | '中平' | '凶' | '大凶'（通行版等级）
 *   - element：按数字末位推衍 1/2=木 3/4=火 5/6=土 7/8=金 9/0=水
 *   - summary：一句话定性（约 10-15 字）
 *   - description：现代白话解读（约 50-90 字）
 *
 * 来源：B 类公版（熊崎派通行版《姓名学之神秘》+ 普及出版物） + C 类编辑整理（现代化语境）
 * isClassical: false — 本文件为现代化产品模板，不是古籍可逐条溯源的白话改写
 *
 * 维护约定：
 *   - 等级与现行各流派普及版保持一致（81 吉凶口径公认度较高）
 *   - description 避免玄学化；用"参考、建议、注意"等中性词，不作绝对断言
 *   - 非古籍，不做出处行渲染
 */

import type { NumerologyEntry } from '../types'

export const NUMEROLOGY: readonly NumerologyEntry[] = Object.freeze([
  {
    number: 1,
    level: '大吉',
    element: '木',
    summary: '万事开端 · 开天辟地之数',
    description: '古称"太极之数"，主自立、开拓、独行向前。此数之人多具首创精神，适合开业、研发、创新领域。早期辛苦耕耘，中年渐入佳境；注意过刚易折，宜学协作。',
  },
  {
    number: 2,
    level: '凶',
    element: '木',
    summary: '混沌分离 · 动摇多变之数',
    description: '古称"两仪之数"，主分离、动摇、多变少成。意味独立维艰。建议依附团队、不宜单打独斗；慢即是快，忌追风口、忌急进。',
  },
  {
    number: 3,
    level: '大吉',
    element: '火',
    summary: '三才形成 · 进取如意之数',
    description: '天地人三才之象，主有为、吉祥、成事。此数格局开阔，适合领导、外交、艺文各路。性情热情外放，注意戒骄戒躁。',
  },
  {
    number: 4,
    level: '凶',
    element: '火',
    summary: '万物不全 · 艰难消极之数',
    description: '四为凶数之首，主破败、艰辛。表现上易有"事倍功半"之叹。建议把注意力放在夯实基础和长期积累上，忌投机。中年后修性格可改善。',
  },
  {
    number: 5,
    level: '大吉',
    element: '土',
    summary: '阴阳和合 · 福禄长寿之数',
    description: '古称"福禄长寿"，主温和稳健、大器晚成。此数人缘佳、事业顺遂，婚姻家庭皆能得助。宜守诚信、忌贪多，步步为营即可收获。',
  },
  {
    number: 6,
    level: '大吉',
    element: '土',
    summary: '万宝集门 · 德厚载物之数',
    description: '主厚德、安稳、福慧双修。此数如宅基坚固，长期看好。适合经营、服务、管理；与人为善即能长久。注意不可过于保守错失良机。',
  },
  {
    number: 7,
    level: '大吉',
    element: '金',
    summary: '精悍刚毅 · 独立权威之数',
    description: '金性锐利、刚正不阿。此数之人意志坚定、富执行力，适合专业技术、法律、军警等硬核方向。待人和气但原则性强，注意不要过于孤傲。',
  },
  {
    number: 8,
    level: '大吉',
    element: '金',
    summary: '八方来财 · 意志坚如磐石',
    description: '八卦八方之象，主意志刚强、凡事能成。勤奋加持下事业稳步向上。适合自己做主、不甘屈就于他人之下；注意人际过刚易生摩擦。',
  },
  {
    number: 9,
    level: '大凶',
    element: '水',
    summary: '破舟待渡 · 多难兴邦之数',
    description: '古称"破舟进海"，主波折、困顿、多磨。表面光鲜下常有危机感。需极强的逆商和恒心；健康与合作都要格外谨慎；可借兴趣爱好调节压力。',
  },
  {
    number: 10,
    level: '大凶',
    element: '水',
    summary: '万事终局 · 空虚无成之数',
    description: '古言"终局之数"，主空虚与反复。现代语境下宜视为"重置机遇"：及时承认失败、止损重启，反能另开天地。忌执念深重。',
  },
  {
    number: 11,
    level: '大吉',
    element: '木',
    summary: '旱苗逢雨 · 重整旗鼓之数',
    description: '枯木逢春之象，主复兴、转机、稳健长进。适合文艺、教育、科研等"静水深流"的行业。性格温厚，能得贵人提携，长线价值高。',
  },
  {
    number: 12,
    level: '凶',
    element: '木',
    summary: '掘井无泉 · 薄弱不足之数',
    description: '主体力或根基不足、外强中干。宜量力而行、不逞强。建议在一两项专长上深扎，放弃摊大饼；健康保养尤为重要。',
  },
  {
    number: 13,
    level: '大吉',
    element: '火',
    summary: '春日牡丹 · 智略超群之数',
    description: '主聪明、机敏、思路开阔。适合谋划、策略、创作等用脑密集的领域。善于解决复杂问题，但不宜过度自信、锋芒太露。',
  },
  {
    number: 14,
    level: '凶',
    element: '火',
    summary: '破兆之数 · 孤独飘零之数',
    description: '古谓之"破兆"，主亲情缘薄、内心孤独。建议主动建设稳定的小圈子和兴趣社群；靠长期可靠的陪伴来补足情感；中年后转运可期。',
  },
  {
    number: 15,
    level: '大吉',
    element: '土',
    summary: '福寿双全 · 万物齐备之数',
    description: '主福禄寿兼备、与世无争而得众心。此数之人为人谦和、度量宽宏，家庭事业两得利。注意过于随和易让人越界，偶需立界。',
  },
  {
    number: 16,
    level: '大吉',
    element: '土',
    summary: '贵人得助 · 厚德载物之数',
    description: '主有长者扶持、贵人得助。善于团结协作，可做组织者、协调者；适合管理、公关、教育。凡事不急不躁，稳扎稳打成大器。',
  },
  {
    number: 17,
    level: '吉',
    element: '金',
    summary: '刚强突破 · 破私营公之数',
    description: '金锐突破之象，主果敢、能成事。常在压力下表现出色，适合挑战型岗位。个性较硬朗，需注意协作与沟通的温度。',
  },
  {
    number: 18,
    level: '吉',
    element: '金',
    summary: '刚柔相济 · 进取有成之数',
    description: '外刚内柔、攻守兼备。此数之人做事方法灵活、边界清晰。适合创业、销售、外联等"以柔克刚"的场合。避免过于圆滑失诚意。',
  },
  {
    number: 19,
    level: '凶',
    element: '水',
    summary: '风雨飘摇 · 多难成败之数',
    description: '才华外显但常遇阻，成败起伏大。需在关键节点管好风险，避免大起大落。中年后若能沉潜一段，反能再起。',
  },
  {
    number: 20,
    level: '大凶',
    element: '水',
    summary: '屋下藏金 · 凡事难成之数',
    description: '主徒劳无功、外强中空。建议放下执念、重新定义目标；身边合适的小事先做起来；健康是底盘，必须守住。',
  },
  {
    number: 21,
    level: '大吉',
    element: '木',
    summary: '明月中天 · 独立权威之数',
    description: '光明开朗、格局开阔。此数之人有领导气质，中晚年成就显著。适合独当一面的创业或主管岗；女性需注意与家人沟通节奏。',
  },
  {
    number: 22,
    level: '凶',
    element: '木',
    summary: '秋草逢霜 · 中途挫败之数',
    description: '才气外露但根基弱、易中途受挫。建议先做足基础能力和资源积累，再拓展野心；情绪管理和身体健康为长期资本。',
  },
  {
    number: 23,
    level: '大吉',
    element: '火',
    summary: '旭日东升 · 威势冲天之数',
    description: '主气势磅礴、领导力强。从无到有白手起家的典型数理。适合规模化事业；女性需注意刚强气过盛，影响家庭和谐，宜刚柔并济。',
  },
  {
    number: 24,
    level: '大吉',
    element: '火',
    summary: '路径发家 · 德望丰盛之数',
    description: '天赋财运与人缘兼备，以智谋致富。适合商业、金融、管理领域。常能白手起家、逆袭上位；注意不骄不纵，维系本心。',
  },
  {
    number: 25,
    level: '吉',
    element: '土',
    summary: '资性聪敏 · 英敏俊迈之数',
    description: '才智过人、事业有成；但性格较独特、与人相处偶有芥蒂。建议多听取不同观点；事业适合专业型深耕，不一定要当管理者。',
  },
  {
    number: 26,
    level: '凶',
    element: '土',
    summary: '变怪奇异 · 英雄豪杰之数',
    description: '常有惊人才华但命途多舛；多英雄悲剧色彩。宜低调做事、守住本行；情感上避免激烈冲突；健康与人际并重。',
  },
  {
    number: 27,
    level: '凶',
    element: '金',
    summary: '一成一败 · 中折难安之数',
    description: '前半生有功名，后半段易生反复。此数需极强的自制力和理财意识；功名不宜过盛，见好就收；家庭是抗风险底盘。',
  },
  {
    number: 28,
    level: '大凶',
    element: '金',
    summary: '自豪之数 · 波澜重叠之数',
    description: '才能高但人生常现孤立、波折。宜修养性情、减少对抗；靠专业立身而非靠人情；中年以后家庭关系需特别经营。',
  },
  {
    number: 29,
    level: '吉',
    element: '水',
    summary: '智谋渊深 · 财力丰盈之数',
    description: '聪慧多谋、财富容易积累。适合经营、投资、策划等需要复杂判断的领域；注意过度算计易伤人情，人脉需温情维护。',
  },
  {
    number: 30,
    level: '凶',
    element: '水',
    summary: '浮沉多变 · 吉凶相伴之数',
    description: '成败一念之间；好运坏运都可能突然到来。建议建立长期稳健的规划而非投机；人生选择越慢越稳越好；维持本业最安全。',
  },
  {
    number: 31,
    level: '大吉',
    element: '木',
    summary: '智勇得志 · 名利双收之数',
    description: '智勇双全、名利双收的大吉之数。能以谋定胜，适合各种经营与领导岗位；待人有度、处事从容，常得上下一致好评。',
  },
  {
    number: 32,
    level: '大吉',
    element: '木',
    summary: '池中游龙 · 侥幸多望之数',
    description: '易得贵人提携，顺风顺水；但也要避免过度依赖运气。适合合伙共赢的局面；努力加实干，把机遇转化为可持续资产。',
  },
  {
    number: 33,
    level: '大吉',
    element: '火',
    summary: '旭日升天 · 家门昌隆之数',
    description: '刚健壮旺、意气风发。适合大开大合的事业，成名成家。男性此数阳刚尤盛；女性此数需注意柔和平衡，否则反噬感情。',
  },
  {
    number: 34,
    level: '大凶',
    element: '火',
    summary: '破家亡身 · 破兆四起之数',
    description: '此数多凶，主意外、破财、挫折。建议凡事留足余地，不争一时；情绪修养、家庭稳定、身体健康是抵御之本。',
  },
  {
    number: 35,
    level: '吉',
    element: '土',
    summary: '温和平静 · 优雅和顺之数',
    description: '主温和、聪敏、淡泊。适合文创、教学、设计等柔性路径。此数不争强好胜，反多长寿；但需警惕过于被动错失良机。',
  },
  {
    number: 36,
    level: '凶',
    element: '土',
    summary: '波澜重叠 · 英雄侠义之数',
    description: '有侠气但常为他人做嫁衣。建议理性设界，不过度承担他人问题；事业上忌拍胸脯承诺，踏实交付更重要。',
  },
  {
    number: 37,
    level: '大吉',
    element: '金',
    summary: '权威显达 · 独立权威之数',
    description: '果断、刚毅、有威望。适合独当一面的岗位，是典型的领导型数理。注意不宜过于独断，听一听不同声音才能走得更远。',
  },
  {
    number: 38,
    level: '中吉',
    element: '金',
    summary: '磨铁成针 · 文艺有成之数',
    description: '外柔内韧，适合文艺、设计、科研等"慢工出细活"的方向。大事可成，但忌急功近利；沉得住气才能打磨出真价值。',
  },
  {
    number: 39,
    level: '大吉',
    element: '水',
    summary: '富贵荣华 · 权势盛大之数',
    description: '富贵、荣华、权势之象。事业易得大成，尤其适合能施展格局的行业。高位后更需修身、惜福，保持初心以长久。',
  },
  {
    number: 40,
    level: '凶',
    element: '水',
    summary: '退守保安 · 变化无常之数',
    description: '主聪明但多变、波折。事业起起伏伏之相；建议退守守成、踏实经营；避免投机与争强斗狠；家庭是稳定的港湾。',
  },
  {
    number: 41,
    level: '大吉',
    element: '木',
    summary: '德望高大 · 纯阳独秀之数',
    description: '有德望、能服众，事业格局大而正。适合公共事业、公益、教育等能发挥影响力的方向。待人以诚，自有长久。',
  },
  {
    number: 42,
    level: '凶',
    element: '木',
    summary: '十艺不成 · 博而不精之数',
    description: '才多艺广但精深有限，样样通样样松。建议聚焦一到两项核心技能深耕十年；少做"全能人"，多做"专家"。',
  },
  {
    number: 43,
    level: '凶',
    element: '火',
    summary: '散财破家 · 雨夜之花之数',
    description: '表面光鲜但内里空虚，易散财。建议建立严格的收支分账；投资保守、理财谨慎；多留几分应急金而非"all in"。',
  },
  {
    number: 44,
    level: '大凶',
    element: '火',
    summary: '愁眉难展 · 破败魔障之数',
    description: '此数主困顿、挫折较多。遇此数不必恐慌，改善靠长期的自我修养和外部环境重塑；心理健康保障尤为重要。',
  },
  {
    number: 45,
    level: '大吉',
    element: '土',
    summary: '顺风扬帆 · 兴家福泽之数',
    description: '主吉祥、顺遂、风生水起。事业稳步上扬，婚姻家庭皆能得助。注意顺境中不宜麻痹；适度危机感可保长久。',
  },
  {
    number: 46,
    level: '凶',
    element: '土',
    summary: '载宝沉舟 · 浮沉不定之数',
    description: '表面有才、实则根基薄，易在关键时刻翻船。建议打好底层能力，别急着"翻身"；稳健是此数的最佳策略。',
  },
  {
    number: 47,
    level: '大吉',
    element: '金',
    summary: '点石成金 · 开花结实之数',
    description: '灵感敏锐、善把握机遇。适合商业、投资、创作等需要"嗅觉"的方向。功成后要反哺团队与家人，路方能走远。',
  },
  {
    number: 48,
    level: '大吉',
    element: '金',
    summary: '德智兼备 · 青云直上之数',
    description: '德才兼备、名利双收。适合教育、咨询、管理等需要权威与智慧的领域。常能扮演"导师"或"智囊"角色。',
  },
  {
    number: 49,
    level: '凶',
    element: '水',
    summary: '吉凶难测 · 转变不安之数',
    description: '关键时刻常有转折；吉凶参半。凡事不宜急断，多留观察期；重大决策前先问问"最坏情况是否可承受"。',
  },
  {
    number: 50,
    level: '凶',
    element: '水',
    summary: '小成大破 · 一成一败之数',
    description: '早年小成、后易大破。建议在上升期就开始为回调期做准备；少背高风险杠杆；稳健资产配置比豪赌更可靠。',
  },
  {
    number: 51,
    level: '凶',
    element: '木',
    summary: '盛衰交加 · 半世繁华之数',
    description: '人生上下起伏明显。宜"早做减法"：砍掉不必要的负担，聚焦核心；中年后少折腾、以守为主方能安享。',
  },
  {
    number: 52,
    level: '大吉',
    element: '木',
    summary: '先见之明 · 达眼先机之数',
    description: '眼光独到、把握时机能力强。适合投资、创业、战略规划。切忌过度自信；多问"如果我判断错了会怎样"。',
  },
  {
    number: 53,
    level: '凶',
    element: '火',
    summary: '内虚外实 · 外祥内苦之数',
    description: '表面风光，实则辛苦。建议及时调整节奏、减少对外展示的压力；生活和工作的"真实感"才是长期幸福感来源。',
  },
  {
    number: 54,
    level: '大凶',
    element: '火',
    summary: '多难之数 · 损伤多难之数',
    description: '此数困顿感较强，宜修身养性、广结善缘。遇到挫折不急着翻盘，给自己留足缓冲；心理和身体健康都要投入时间。',
  },
  {
    number: 55,
    level: '凶',
    element: '土',
    summary: '善恶混同 · 内虚外美之数',
    description: '看似圆满实则心有不安。建议减少"表演式成功"，把精力放在真正喜欢的事上；与少量深交者建立长期关系。',
  },
  {
    number: 56,
    level: '大凶',
    element: '土',
    summary: '浪里行舟 · 消极败兆之数',
    description: '意志易受环境影响、决心不坚。建议用清晰的目标管理系统自我约束；好习惯比好运气更值得培养。',
  },
  {
    number: 57,
    level: '吉',
    element: '金',
    summary: '春花秋实 · 寒雪青松之数',
    description: '年轻时磨砺，中年后开花结果。适合长期积累型路径：技术、学术、手艺。越做越深，越做越值。',
  },
  {
    number: 58,
    level: '凶',
    element: '金',
    summary: '先凶后吉 · 晚苗逢秋之数',
    description: '前期多艰辛，后期渐入佳境。把时间拉长看，此数反而稳。建议不和同龄人比短期成就；做自己的时间表。',
  },
  {
    number: 59,
    level: '凶',
    element: '水',
    summary: '寒蝉悲风 · 失意落寞之数',
    description: '孤独感较重、成事需更长时间。可借助社群、兴趣、家人给自己注入生命能量；精神世界的充盈比事业更先行。',
  },
  {
    number: 60,
    level: '凶',
    element: '水',
    summary: '黑暗无光 · 动摇不定之数',
    description: '事业与情感都易动摇。建议减少同时进行的选项，一次只做一件大事；简单的日常节律反而能带来长期的稳定。',
  },
  {
    number: 61,
    level: '吉',
    element: '木',
    summary: '名利双收 · 独立独行之数',
    description: '独立性强、事业有成。适合自由职业、个人品牌、专家路线。注意团队合作的柔性；别让"独行"变成"孤立"。',
  },
  {
    number: 62,
    level: '凶',
    element: '木',
    summary: '基础虚弱 · 衰败根虚之数',
    description: '根基不牢、外强中干。建议回头补基础能力：健康、家庭、底层技能。欲速则不达；重来一次比带病硬挺更好。',
  },
  {
    number: 63,
    level: '大吉',
    element: '火',
    summary: '万事如意 · 富贵荣华之数',
    description: '顺境居多，贵人辅助。适合主业深耕和副业拓展并行；多做可复利的事；顺风时候更要系好安全带。',
  },
  {
    number: 64,
    level: '凶',
    element: '火',
    summary: '十九不成 · 沉浮多难之数',
    description: '计划多、落地少；易半途而废。建议用更小的目标颗粒度倒逼执行；每完成一件小事都给自己正向反馈。',
  },
  {
    number: 65,
    level: '大吉',
    element: '土',
    summary: '万事亨通 · 家门兴隆之数',
    description: '主家运兴旺、老少同乐。适合经营稳健型事业；家庭和事业同步发展。此数常见于"以家族为单位"的成功路径。',
  },
  {
    number: 66,
    level: '凶',
    element: '土',
    summary: '岩上枯松 · 内外不和之数',
    description: '表面坚强内心疲惫。建议主动寻求心理支持、家人沟通；不把所有压力都扛在自己身上；及时止损比坚持更需要勇气。',
  },
  {
    number: 67,
    level: '大吉',
    element: '金',
    summary: '通达有成 · 万宝集门之数',
    description: '通达、顺畅、事业有成。适合需要长期信任积累的行业，比如咨询、服务、教育。把客户和伙伴变成"老朋友"。',
  },
  {
    number: 68,
    level: '大吉',
    element: '金',
    summary: '兴家立业 · 智勇双全之数',
    description: '智勇双修、适合独立创业或担当要职。此数人不张扬但实力深厚；大器虽晚成，但一成即能稳。',
  },
  {
    number: 69,
    level: '凶',
    element: '水',
    summary: '坐立不安 · 穷途末日之数',
    description: '多虑、不安定。可通过规律作息、运动、冥想稳定心神；减少信息噪音摄入；长期看"小而稳"优于"大而险"。',
  },
  {
    number: 70,
    level: '凶',
    element: '水',
    summary: '残菊逢霜 · 惨淡寂寞之数',
    description: '整体能量较低、需主动补给。建议围绕兴趣和健康建立长期习惯；选一两位可信伙伴深交，远胜广泛社交。',
  },
  {
    number: 71,
    level: '中吉',
    element: '木',
    summary: '晚成发达 · 养精蓄锐之数',
    description: '前期积累期较长，中后期发力。宜保持耐心，把积累转化为关键节点的突破；别和早熟型人才硬拼早期节奏。',
  },
  {
    number: 72,
    level: '凶',
    element: '木',
    summary: '先甘后苦 · 吉凶相伴之数',
    description: '前期顺利、后期易反噬。建议顺境时主动建设抗风险能力：储蓄、副业、人脉、健康四件套。',
  },
  {
    number: 73,
    level: '吉',
    element: '火',
    summary: '平凡安逸 · 无灾无难之数',
    description: '不求大富大贵，但一生少灾少难。适合喜欢安定、注重家庭的生活方式；不必强求做大；小确幸也很值得。',
  },
  {
    number: 74,
    level: '凶',
    element: '火',
    summary: '无能为力 · 沉沦不起之数',
    description: '能量偏弱、做事心有余而力不足。建议通过刻意练习和小目标逐步积累信心；一次突破一点即是胜利。',
  },
  {
    number: 75,
    level: '中吉',
    element: '土',
    summary: '守旧安顺 · 兴家保安之数',
    description: '守成守旧，安稳就好。不适合剧烈变革，但适合长期做一件事。"慢而持续"是这类数最大的资产。',
  },
  {
    number: 76,
    level: '凶',
    element: '土',
    summary: '破产离散 · 内外不和之数',
    description: '易在中年后出现较大起伏。建议提前做好家庭沟通与财务隔离；多修人际关系；健康是压舱石，定期检查。',
  },
  {
    number: 77,
    level: '中吉',
    element: '金',
    summary: '先苦后甘 · 家运先兴之数',
    description: '前期辛苦，中后期渐入佳境。适合认准方向就死磕的路径。早年少抱怨、多积累，命运有回响。',
  },
  {
    number: 78,
    level: '中平',
    element: '金',
    summary: '晚景欠佳 · 先盛后衰之数',
    description: '前期顺利、晚景需注意。建议中年后逐步从"扩张"转为"守成"；子女教育、健康和理财提前布局。',
  },
  {
    number: 79,
    level: '凶',
    element: '水',
    summary: '穷逆不振 · 贫困多难之数',
    description: '境遇波折、内心疲惫。建议主动调整生活半径；选择对自己有正向能量的人与环境；小步快跑好过停滞。',
  },
  {
    number: 80,
    level: '凶',
    element: '水',
    summary: '凶星入命 · 凡事多难之数',
    description: '整体趋于保守与内敛；不宜大张旗鼓。建议低调做人、稳妥做事；健康和家庭是比事业更重要的资产。',
  },
  {
    number: 81,
    level: '大吉',
    element: '水',
    summary: '万宝之数 · 还元归一之数',
    description: '最大数又归于本源之意，主吉祥圆满、还元归始。此数人福慧兼具、能得长寿；人生自有一份安定、知止与从容。',
  },
]) as readonly NumerologyEntry[]

/**
 * 支持的 locale 标记。
 * `zh-CN` 为简体真源，`zh-TW`/`en` 为覆盖层；缺失字段回退到简体。
 */
export type NumerologyLocale = 'zh-CN' | 'zh-TW' | 'en'

/**
 * 按数字 + locale 查询 81 数理条目；越界返回 null。
 *
 * - `zh-CN`：直接返回 `NUMEROLOGY[n-1]`（简体真源）。
 * - `zh-TW`：用 `numerology.zhTW.ts` 覆盖层（运行时 chinese-conv 转换）。
 * - `en`：用 `numerology.en.ts` 覆盖层（人工翻译 summary，description 回退中文）。
 *
 * 任意 locale 缺失字段都回退到简体，保证 UI 永不空白。
 *
 * 注：覆盖层为同步加载（每份 ~10KB，按需加载意义不大），与 i18n locale 切换路径一致。
 */
export async function getNumerologyAsync(
  n: number,
  locale: NumerologyLocale = 'zh-CN',
): Promise<NumerologyEntry | null> {
  if (!Number.isInteger(n) || n < 1 || n > 81) return null
  const base = NUMEROLOGY[n - 1]
  if (!base) return null
  if (locale === 'zh-CN') return base

  const overrides = await loadOverrides(locale)
  const ovr = overrides[n - 1] ?? {}
  return {
    ...base,
    summary: ovr.summary ?? base.summary,
    description: ovr.description ?? base.description,
  }
}

/** 同步版本：仅 zh-CN，其它 locale 返回简体回退（用于不能 await 的旧调用方） */
export function getNumerology(n: number): NumerologyEntry | null {
  if (!Number.isInteger(n) || n < 1 || n > 81) return null
  return NUMEROLOGY[n - 1] ?? null
}

let zhTwCache: ReadonlyArray<{ summary?: string; description?: string }> | null = null
let enCache: ReadonlyArray<{ summary?: string; description?: string }> | null = null

async function loadOverrides(
  locale: 'zh-TW' | 'en',
): Promise<ReadonlyArray<{ summary?: string; description?: string }>> {
  if (locale === 'zh-TW') {
    if (zhTwCache) return zhTwCache
    const mod = await import('./numerology.zhTW')
    zhTwCache = mod.NUMEROLOGY_ZHTW
    return zhTwCache
  }
  if (enCache) return enCache
  const mod = await import('./numerology.en')
  enCache = mod.NUMEROLOGY_EN
  return enCache
}

/** 按末位推衍五行：1/2=木 3/4=火 5/6=土 7/8=金 9/0=水 */
export function getElementByNumber(n: number): NumerologyEntry['element'] {
  const last = n % 10
  if (last === 1 || last === 2) return '木'
  if (last === 3 || last === 4) return '火'
  if (last === 5 || last === 6) return '土'
  if (last === 7 || last === 8) return '金'
  return '水'
}
