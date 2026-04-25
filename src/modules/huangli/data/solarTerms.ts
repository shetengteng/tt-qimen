/**
 * 24 节气数据 — 黄历节气科普卡用
 *
 * 顺序：从「立春」开始，按一年顺序排列（农历传统次序）。
 * 数据来源：公版历法常识。
 *
 * 字段：
 *   - name        节气名（中文，与 tyme4ts 输出一致）
 *   - pinyin      汉语拼音（用于英文环境标注 / 拼音搜索）
 *   - season      所属季节（春/夏/秋/冬）
 *   - meaning     含义说明（约 60-90 字，繁体由 chinese-conv 自动转换）
 *   - phenomena   物候三候（每候约 10 字，可选；为空表示尚未编辑）
 *   - customs     民俗活动（短语数组，用于科普卡列表展示）
 */

export type SolarTermSeason = 'spring' | 'summer' | 'autumn' | 'winter'

export interface SolarTermMeaning {
  name: string
  pinyin: string
  season: SolarTermSeason
  meaning: string
  phenomena: readonly string[]
  customs: readonly string[]
}

export const SOLAR_TERMS: readonly SolarTermMeaning[] = [
  {
    name: '立春',
    pinyin: 'Lì Chūn',
    season: 'spring',
    meaning: '春天的开始。冬寒已尽，阳气始升，万物复苏。古人以立春为岁首，行迎春礼以祈五谷丰登。',
    phenomena: ['东风解冻', '蛰虫始振', '鱼陟负冰'],
    customs: ['迎春', '咬春（吃春饼）', '糊春牛', '戴春鸡'],
  },
  {
    name: '雨水',
    pinyin: 'Yǔ Shuǐ',
    season: 'spring',
    meaning: '降水增多，气温回升，冰雪消融为雨。农事上意味着春耕将近，需护苗防春寒。',
    phenomena: ['獭祭鱼', '候雁北', '草木萌动'],
    customs: ['回娘家', '拉保保（认干亲）', '占稻色'],
  },
  {
    name: '惊蛰',
    pinyin: 'Jīng Zhé',
    season: 'spring',
    meaning: '春雷乍动，蛰伏地下的虫兽被惊醒。阳气真正开始活跃，是春耕的关键节点。',
    phenomena: ['桃始华', '仓庚（黄鹂）鸣', '鹰化为鸠'],
    customs: ['吃梨', '炒虫', '蒙鼓皮', '祭白虎'],
  },
  {
    name: '春分',
    pinyin: 'Chūn Fēn',
    season: 'spring',
    meaning: '昼夜均分，寒暑平衡。「分」即一半，太阳直射赤道。此后北半球昼长夜短，气温稳步上升。',
    phenomena: ['玄鸟（燕子）至', '雷乃发声', '始电'],
    customs: ['竖蛋', '吃春菜', '送春牛图', '放风筝'],
  },
  {
    name: '清明',
    pinyin: 'Qīng Míng',
    season: 'spring',
    meaning: '天气清朗，草木繁茂。既是节气也是传统节日，兼具祭祖扫墓与踏青游春之双重民俗。',
    phenomena: ['桐始华', '田鼠化为鴽', '虹始见'],
    customs: ['扫墓祭祖', '踏青', '插柳', '放风筝', '荡秋千'],
  },
  {
    name: '谷雨',
    pinyin: 'Gǔ Yǔ',
    season: 'spring',
    meaning: '雨生百谷之意。降水显著增多，谷物得以滋长。是春季最后一个节气，预示初夏将至。',
    phenomena: ['萍始生', '鸣鸠拂其羽', '戴胜降于桑'],
    customs: ['采茶（雨前茶）', '赏牡丹', '祭海', '走谷雨'],
  },
  {
    name: '立夏',
    pinyin: 'Lì Xià',
    season: 'summer',
    meaning: '夏天的开始。气温显著回升，雷雨增多，农作物进入旺盛生长期。古人以「迎夏」礼祈丰年。',
    phenomena: ['蝼蝈鸣', '蚯蚓出', '王瓜生'],
    customs: ['尝新（樱桃、青梅）', '秤人', '斗蛋', '煮鼎边糊'],
  },
  {
    name: '小满',
    pinyin: 'Xiǎo Mǎn',
    season: 'summer',
    meaning: '夏熟作物（如麦类）籽粒开始饱满，但尚未成熟。「小满」即「将熟未熟」之态，雨水显著增多。',
    phenomena: ['苦菜秀', '靡草死', '麦秋至'],
    customs: ['祭车神', '祭蚕', '吃苦菜', '看麦梢黄'],
  },
  {
    name: '芒种',
    pinyin: 'Máng Zhòng',
    season: 'summer',
    meaning: '有芒之谷类作物（麦）可收，有芒之稻可种。农事进入「双抢」最忙时节，故又称「忙种」。',
    phenomena: ['螳螂生', '鵙（伯劳）始鸣', '反舌（百舌鸟）无声'],
    customs: ['送花神', '安苗', '煮梅', '打泥巴仗'],
  },
  {
    name: '夏至',
    pinyin: 'Xià Zhì',
    season: 'summer',
    meaning: '太阳直射北回归线，北半球昼最长夜最短。阳气至盛，但「至」也含「极」转「衰」之意，盛极而阴生。',
    phenomena: ['鹿角解', '蜩（蝉）始鸣', '半夏生'],
    customs: ['吃夏至面', '消夏避伏', '祭神祭祖', '称体重'],
  },
  {
    name: '小暑',
    pinyin: 'Xiǎo Shǔ',
    season: 'summer',
    meaning: '「暑」即热，「小」者未达极致。盛夏开始，江南多雨入梅，华北多雷阵雨，需防暑降温。',
    phenomena: ['温风至', '蟋蟀居壁', '鹰始鸷'],
    customs: ['食新（吃新米）', '晒书晒衣', '吃藕', '吃饺子'],
  },
  {
    name: '大暑',
    pinyin: 'Dà Shǔ',
    season: 'summer',
    meaning: '一年中最热时段，常伴湿热「桑拿天」。农作物生长最快，旱涝、风灾亦多发，是抗灾关键期。',
    phenomena: ['腐草为萤', '土润溽暑', '大雨时行'],
    customs: ['饮伏茶', '晒伏姜', '烧伏香', '吃仙草'],
  },
  {
    name: '立秋',
    pinyin: 'Lì Qiū',
    season: 'autumn',
    meaning: '秋天的开始，万物从「生长」转入「成熟」。但暑气并未即刻消退，民间有「秋老虎」之说。',
    phenomena: ['凉风至', '白露降', '寒蝉鸣'],
    customs: ['贴秋膘', '啃秋（吃西瓜）', '晒秋', '称水'],
  },
  {
    name: '处暑',
    pinyin: 'Chǔ Shǔ',
    season: 'autumn',
    meaning: '「处」即停止、退避之意，意为暑气至此而止。早晚渐凉，但午间仍可能闷热，是夏秋过渡期。',
    phenomena: ['鹰乃祭鸟', '天地始肃', '禾乃登（成熟）'],
    customs: ['出游迎秋', '放河灯', '开渔节', '吃鸭子'],
  },
  {
    name: '白露',
    pinyin: 'Bái Lù',
    season: 'autumn',
    meaning: '清晨草木始凝白色露珠，因水气遇冷凝结。气温显著下降，昼夜温差加大，为典型秋凉之始。',
    phenomena: ['鸿雁来', '玄鸟归', '群鸟养羞（储食）'],
    customs: ['收清露', '酿白露米酒', '祭禹王', '吃龙眼'],
  },
  {
    name: '秋分',
    pinyin: 'Qiū Fēn',
    season: 'autumn',
    meaning: '与春分相对，昼夜再次均分。此后昼短夜长，气温下降加快。是秋收秋种最关键节点。',
    phenomena: ['雷始收声', '蛰虫坯户', '水始涸'],
    customs: ['祭月（中秋前身）', '吃秋菜', '竖蛋', '送秋牛图'],
  },
  {
    name: '寒露',
    pinyin: 'Hán Lù',
    season: 'autumn',
    meaning: '露水更冷，将凝为霜。气温显著低于白露，是秋季向冬季的过渡。北方深秋，南方仲秋。',
    phenomena: ['鸿雁来宾', '雀入大水为蛤', '菊有黄华（盛开）'],
    customs: ['赏菊', '登高', '吃芝麻', '钓鱼（鱼游浅水边）'],
  },
  {
    name: '霜降',
    pinyin: 'Shuāng Jiàng',
    season: 'autumn',
    meaning: '初霜出现，温度降至 0°C 上下。秋气最凉之时，天地肃杀，是养生进补、防寒保暖的关键节点。',
    phenomena: ['豺乃祭兽', '草木黄落', '蛰虫咸俯（蛰伏）'],
    customs: ['吃柿子', '登高赏菊', '进补（霜降补冬）', '送芋鬼'],
  },
  {
    name: '立冬',
    pinyin: 'Lì Dōng',
    season: 'winter',
    meaning: '冬天的开始。「冬，终也，万物收藏也」，农事由「藏」入手。古人以「迎冬」礼并贺冬。',
    phenomena: ['水始冰', '地始冻', '雉入大水为蜃'],
    customs: ['吃饺子（北方）', '吃葱（南京）', '酿黄酒', '冬泳'],
  },
  {
    name: '小雪',
    pinyin: 'Xiǎo Xuě',
    season: 'winter',
    meaning: '气温降至冰点以下，开始降雪但量未大。北方初雪，南方阴冷雨雾。是腌腊、储冬菜的开始。',
    phenomena: ['虹藏不见', '天气上升地气下降', '闭塞而成冬'],
    customs: ['腌腊肉', '吃糍粑', '晒鱼干', '酿酒'],
  },
  {
    name: '大雪',
    pinyin: 'Dà Xuě',
    season: 'winter',
    meaning: '降雪量进一步增大，地面常有积雪。古人以「大」「小」状其雪量。「瑞雪兆丰年」即此时之愿。',
    phenomena: ['鹖鴠（寒号鸟）不鸣', '虎始交', '荔挺（兰草）出'],
    customs: ['观赏封河', '腌肉', '进补', '滑冰雪'],
  },
  {
    name: '冬至',
    pinyin: 'Dōng Zhì',
    season: 'winter',
    meaning: '太阳直射南回归线，北半球白昼最短、夜最长。阴极阳生，从此白昼渐长。古称「亚岁」，仅次于过年。',
    phenomena: ['蚯蚓结', '麋角解', '水泉动'],
    customs: ['吃饺子（北）', '吃汤圆（南）', '九九消寒图', '祭祖'],
  },
  {
    name: '小寒',
    pinyin: 'Xiǎo Hán',
    season: 'winter',
    meaning: '「寒」气尚未至极。北方进入「数九」第二九，是常年最冷起点之一。农人安排冬储与岁末事宜。',
    phenomena: ['雁北乡', '鹊始巢', '雉始雊（鸣叫）'],
    customs: ['吃腊八粥', '画九（消寒图）', '冰戏', '探梅'],
  },
  {
    name: '大寒',
    pinyin: 'Dà Hán',
    season: 'winter',
    meaning: '一年中最冷时段，「大」者极致也。但物极必反，节后即立春。是除旧迎新、备办年货的尾声节气。',
    phenomena: ['鸡始乳（孵蛋）', '征鸟厉疾（鹰隼凶猛）', '水泽腹坚（冰冻最厚）'],
    customs: ['尾牙祭', '迎灶神（扫尘）', '蒸年糕', '腌制年肴'],
  },
] as const

/** 节气名 → 数据 的快速查询 Map（不区分大小写不必要，节气名为中文） */
const TERM_INDEX: ReadonlyMap<string, SolarTermMeaning> = new Map(
  SOLAR_TERMS.map((t) => [t.name, t]),
)

/** 按节气名取数据；未收录返回 null。 */
export function getSolarTerm(name: string | null | undefined): SolarTermMeaning | null {
  if (!name) return null
  return TERM_INDEX.get(name) ?? null
}
