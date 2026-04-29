export default {
  brand: 'tt-qimen',
  brandFull: '啟門問卜',
  brandMark: '啟',
  tagline: '占卜八面 · 知命歸心',
  disclaimer: '✦ 本站內容僅供文化體驗與娛樂參考 · 不構成專業建議 ✦',

  common: {
    theme: '主題',
    language: '語言',
    placeholder: {
      year: '請輸入年份',
      month: '請輸入月份',
      day: '請輸入日期',
      hour: '請輸入時辰',
    },
    button: {
      compute: '排盤',
      reset: '重置',
      back: '返回',
    },
    age: '{n} 歲',
    nodata: '暫無資料',
    loading: '推算中…',
    underConstruction: '此模組建設中，敬請期待。',
    share: {
      preview: {
        title: '分享預覽',
        closeAria: '關閉預覽',
        imageAlt: '分享卡預覽圖',
        generating: '正在生成預覽圖…',
        hint: '下方二維碼包含本次入參，掃描即可在他人裝置上重現同一排盤。',
        close: '關閉',
        save: '儲存到本機',
        share: '系統分享',
      },
      qrcode: {
        alt: '重現此排盤的二維碼',
        hint: '掃碼可在他人裝置上一鍵重現本次排盤',
      },
    },
    birthInput: {
      inputCardTitle: '錄入生辰',
      calendar: { solar: '公曆', lunar: '農曆' },
      field: {
        year: '出生年',
        month: '月',
        day: '日',
        hour: '時辰',
        gender: '性別',
      },
      gender: { male: '男', female: '女' },
      hours: [
        '子時 (23-1)', '丑時 (1-3)', '寅時 (3-5)', '卯時 (5-7)',
        '辰時 (7-9)', '巳時 (9-11)', '午時 (11-13)', '未時 (13-15)',
        '申時 (15-17)', '酉時 (17-19)', '戌時 (19-21)', '亥時 (21-23)',
      ],
      btn: {
        paipan: '開始排盤',
        paipanIcon: '◉',
      },
      birthplaceLabel: '城市（選填）',
      birthplaceSearchPlaceholder: '搜尋城市（可選 · 選了即開真太陽時）',
      birthplaceNoResult: '暫無匹配城市',
      birthplaceClear: '清除',
      cities: {
        beijing: '北京', shanghai: '上海', tianjin: '天津', chongqing: '重慶',
        shijiazhuang: '石家莊', taiyuan: '太原', hohhot: '呼和浩特', shenyang: '瀋陽',
        changchun: '長春', harbin: '哈爾濱',
        nanjing: '南京', hangzhou: '杭州', hefei: '合肥', fuzhou: '福州',
        nanchang: '南昌', jinan: '濟南', taipei: '臺北',
        zhengzhou: '鄭州', wuhan: '武漢', changsha: '長沙', guangzhou: '廣州',
        nanning: '南寧', haikou: '海口',
        chengdu: '成都', guiyang: '貴陽', kunming: '昆明', lhasa: '拉薩',
        xian: '西安', lanzhou: '蘭州', xining: '西寧', yinchuan: '銀川',
        urumqi: '烏魯木齊',
        hongkong: '香港', macau: '澳門',
      },
    },
    collapse: {
      collapseLabel: '收起',
      expandLabel: '展開',
    },
  },

  nav: {
    home: '首頁',
    bazi: '八字',
    ziwei: '紫微',
    chenggu: '秤骨',
    liuren: '小六壬',
    lingqian: '靈籤',
    xingming: '姓名',
    huangli: '黃曆',
    jiemeng: '解夢',
    menu: '導覽選單',
  },

  home: {
    title: '首頁',
    subtitle: '八門玄機 · 一念歸一',
    intro: '選擇下方任一門法，輸入生辰即可查看推演。所有資料僅於本機瀏覽器內運算，絕無上傳。',
    enter: '進入',
    hero: {
      ornament: '◈ ◈ ◈',
      titleMain: '啟門',
      titleAccent: '問卜',
      subtitle1: '承襲古法，演今人運命之趣',
      subtitle2: '七種中華傳統占卜方術 · 一站體驗',
      ctaPrimary: '測我八字',
      ctaSecondary: '瀏覽七法',
      ctaPrimaryIcon: '◉',
      ctaSecondaryIcon: '◐',
      sealRight: '啟門問卜',
      sealLeft: '丙午',
      eyebrow: 'MVP v1.0 · 七模組全面上線',
      titleMnLine1: '一站式',
      titleMnLine2A: '傳統命理',
      titleMnLine2B: '體驗',
      subtitleMn1: '基於開源演算法庫與公版古籍，離線運行、尊重隱私。',
      subtitleMn2: '在瀏覽器中體驗七種中國傳統占卜方術。',
      ctaMnPrimary: '立即排盤',
      ctaMnSecondary: '瀏覽模組',
    },
    stats: {
      methods: '占卜方法',
      methodsValue: '7',
      jiemengEntries: '解夢詞條',
      jiemengEntriesValue: '2380',
      lingqian: '觀音靈籤',
      lingqianValue: '100',
      offline: '完全離線',
      offlineValue: '∞',
    },
    huangli: {
      day: '18',
      monthLunar: '農曆戊戌',
      lunarDay: '三月初二',
      monthMnLine1: '四月 · 週六',
      monthMnLine2: '農曆三月初二',
      ganzhiLabel: '干支：',
      ganzhi: '丙午年 壬辰月 辛卯日',
      yi: '宜',
      yiValue: '祭祀 · 祈福 · 出行 · 會友 · 簽約',
      ji: '忌',
      jiValue: '動土 · 嫁娶 · 開業',
      detailLink: '查看詳情 →',
      detailLinkMn: '查看完整黃曆',
      todayLabel: '今日干支',
    },
    sectionDivider: '✦ 七法問卜 ✦',
    sectionTitle: '擇其一法，問心而行',
    sectionSubtitle: '每一種占卜，皆是文化的傳承與內心的對話',
    sectionTitleMn: '七大模組',
    sectionSubMn: '點擊任一卡片，開始你的占卜之旅',
    featuresDivider: '◆ 啟門之道 ◆',
    featuresTitleMn: '為什麼選擇 tt-qimen',
    featuresSubMn: '專注可靠、尊重隱私、尊重文化',
  },

  modules: {
    bazi:    { name: '八字', short: '八', title: '八字命盤', desc: '四柱推演 · 五行強弱 · 十神格局 · 大運流年一覽', descMn: '四柱推演、五行強弱、十神格局、大運流年全覽。', tags: ['專業推薦', '含大運', '含流年'], tagsMn: ['專業', '含大運', '含流年'], badge: '核心', sub: '四柱推命 · 五行相生' },
    ziwei:   { name: '紫微', short: '紫', title: '紫微斗數', desc: '十二宮推演 · 主星副星 · 四化飛星 · 大限小限', descMn: '十二宮推演、主星副星、四化飛星、大限小限全覆蓋。', tags: ['專業推薦', '12 宮', '四化'], tagsMn: ['專業', '12 宮', '四化'], badge: '核心', sub: '十二宮垣 · 三方四正' },
    chenggu: { name: '秤骨', short: '秤', title: '秤骨算命', desc: '袁天罡古歌訣 · 五十一段骨重定命格', descMn: '袁天罡古歌訣，透過生辰骨重查詢 51 段命格歌訣。', tags: ['入門友好', '古風歌訣'], tagsMn: ['入門', '古風'], sub: '袁天罡之訣 · 一斤一兩' },
    liuren:  { name: '小六壬', short: '壬', title: '小六壬', desc: '大安留連速喜 · 赤口小吉空亡 · 隨時問卜', descMn: '大安、留連、速喜、赤口、小吉、空亡，日常速問。', tags: ['日常速問'], tagsMn: ['快速'], sub: '掐指一算 · 應事即時' },
    lingqian:{ name: '靈籤', short: '籤', title: '觀音靈籤', desc: '心誠則靈 · 搖籤百支 · 問事指迷', descMn: '搖籤百支、配古人典故與五事指引，儀式感占卜。', tags: ['儀式感'], tagsMn: ['100 籤'], sub: '虔誠一念 · 神明指引' },
    xingming:{ name: '姓名', short: '名', title: '姓名學五格', desc: '康熙筆畫 · 天人地外總五格 · 八十一數理', descMn: '康熙筆畫計算天人地外總格，結合 81 數理分析。', tags: ['實用工具'], tagsMn: ['實用'], sub: '五格剖象 · 三才配置' },
    huangli: { name: '黃曆', short: '曆', title: '黃曆擇日', desc: '每日宜忌 · 吉神凶煞 · 九類事由速查', descMn: '每日宜忌、吉凶神煞、九類事由點選速查。', tags: ['高頻可用'], tagsMn: ['高頻'], sub: '宜忌吉時 · 節氣物候' },
    jiemeng: { name: '解夢', short: '夢', title: '周公解夢', desc: '兩千詞條古籍 · 模糊查詢 · 現代建議', descMn: '兩千詞條古籍 + 現代心理學解讀，關鍵詞模糊查詢。', tags: ['隨時查閱'], tagsMn: ['2380 條'], sub: '夢境尋蹤 · 心象索解' },
  },

  features: {
    items: [
      { icon: '卍', title: '古籍考據', desc: '歌訣籤文皆取自公版古籍，保留原貌，以白話輔註' },
      { icon: '☷', title: '靜態無憂', desc: '生辰資訊僅存於本機，無上傳、無追蹤、無廣告打擾' },
      { icon: '☯', title: '文化為本', desc: '以傳承為首，娛樂為輔；不作吉凶絕對之言' },
      { icon: '卐', title: '可存可分享', desc: '一鍵生成分享卡，典雅印章風，朋友圈文藝範' },
    ],
    itemsMn: [
      { icon: '✓', title: '公版古籍 + 開源演算法', desc: '核心依賴 tyme4ts、chinese-character-strokes 等開源庫；籤文歌訣均取自公版古籍。' },
      { icon: '⌂', title: '純靜態 · 完全離線', desc: '生辰資訊僅存於本機 LocalStorage，不上傳、不追蹤、無廣告。' },
      { icon: '◐', title: '文化為本 · 娛樂為輔', desc: '不作吉凶絕對之言，保留傳統表達，輔以現代化解讀。' },
      { icon: '◇', title: '分享友好', desc: '一鍵生成結果卡片，支援儲存至相簿或分享至社交平台。' },
    ],
  },

  footer: {
    branding: '啟門問卜 · tt-qimen · 古今同道',
    brandingMn: 'tt-qimen · 啟門問卜 · 版本 v1.0',
    about: '關於',
    disclaimerLink: '免責聲明',
    dataSource: '資料來源',
    privacy: '隱私',
    privacyMn: '隱私政策',
    copyright: '© 2026 tt-qimen · 僅供文化體驗，不構成專業建議',
    copyrightMn: '© 2026 tt-qimen. 僅供文化體驗，不構成專業建議。',
  },

  about: {
    title: '關於本站',
    lastUpdated: '更新於 2026 年 4 月',
    sections: [
      {
        heading: '一、本站定位',
        paragraphs: [
          '「啟門問卜（tt-qimen）」是一款集合八字、紫微、小六壬、稱骨、靈籤、姓名學、黃曆、解夢等中華傳統命理工具的開源 Web 應用，面向對中國傳統術數文化感興趣的愛好者、研究者與文化體驗者。',
          '本站不是占卜服務，也不是宗教法事場所。所有計算與推演均按公開古籍及通用演算法在你的瀏覽器中本地完成，結果為文化體驗性質的演示輸出。',
        ],
      },
      {
        heading: '二、設計理念',
        paragraphs: [
          '我們認同傳統命理是中華文明的重要組成部分，承載著古人對時間、宇宙、人生的觀察與思考。本站希望以現代、克制、可讀的方式呈現這一文化遺產，避免神秘化、絕對化、商業化的不當宣傳。',
        ],
        list: [
          '文化為本：忠於經典文獻的術語與編排，不刻意美化或扭曲。',
          '娛樂為輔：所有結論以「參考」「描述」「示意」為表達底色，絕不作吉凶定論。',
          '工具友好：保持響應式、無登入、無廣告、無追蹤、可離線運行。',
          '開源透明：核心演算法可在 GitHub 倉庫中查閱與審計。',
        ],
      },
      {
        heading: '三、技術與資料',
        paragraphs: [
          '本站基於 Vue 3 + TypeScript + Vite 構建，命理計算依賴以下開源庫：tyme4ts（萬年曆與四柱）、iztro（紫微斗數）、以及自研的稱骨歌、觀音靈籤、姓名學三才五格等資料集。詳見「資料來源」頁面。',
          '所有用戶輸入（生辰、姓名、夢境關鍵字等）僅在瀏覽器內存與 localStorage 中處理，從不上傳至任何伺服器。詳見「隱私政策」頁面。',
        ],
      },
      {
        heading: '四、版本與回饋',
        paragraphs: [
          '當前版本為 v1.0，仍在持續打磨。如發現術語錯誤、資料來源不準確、或對某條解讀有更佳的傳統文獻依據，歡迎透過 GitHub Issue 提出。本站將謹慎評估並以版本說明的方式更新。',
        ],
      },
    ],
  },

  disclaimerPage: {
    title: '免責聲明',
    lastUpdated: '更新於 2026 年 4 月',
    sections: [
      {
        heading: '一、內容性質',
        paragraphs: [
          '本站所提供的所有命理推算結果（包括但不限於八字命盤、紫微斗數、小六壬卦象、稱骨重量、靈籤、姓名分數、黃曆宜忌、解夢釋義等）均為基於傳統術數文獻的「文化體驗性輸出」，不構成任何形式的專業建議、預測、保證或承諾。',
        ],
      },
      {
        heading: '二、不構成專業建議',
        paragraphs: [
          '本站的輸出內容明確不構成醫學、心理、法律、金融、婚姻、教育、命名、風水、宗教等任何領域的專業建議。任何基於本站輸出做出的決定均由用戶自行承擔全部責任與後果。',
        ],
        list: [
          '醫療健康：身體或精神不適請優先諮詢持牌醫生或心理諮詢師，不要將本站輸出作為診斷或治療依據。',
          '法律事務：婚姻、合約、訴訟等問題請諮詢專業律師。',
          '財務投資：投資有風險，決策應基於市場分析與持牌財務顧問意見，本站不提供任何投資建議。',
          '人生重大決定：升學、擇業、婚配、遷居等請綜合自身實際情況與專業建議，傳統命理僅可作為文化參考之一。',
        ],
      },
      {
        heading: '三、傳統術數的局限性',
        paragraphs: [
          '中華傳統命理誕生於古代農業社會，其哲學背景與社會語境與現代差異較大。同一命盤在不同流派、不同時代、不同解讀者之間結論可能截然不同，這是術數本身的特點而非本站的缺陷。',
          '本站採用主流公開文獻的演算法與解讀，但不代表「唯一正確」的解讀，請用戶保持開放與批判的態度。',
        ],
      },
      {
        heading: '四、不作吉凶絕對之言',
        paragraphs: [
          '本站在術語呈現上保留傳統表達（如「貴人」「凶煞」「吉日」「忌日」），但配套解讀均強調「參考性」「概率性」「描述性」，不會向用戶作出「必然」「一定」「絕對」之類的吉凶論斷。',
          '若用戶在使用過程中感到焦慮、恐懼、依賴或被動，請立即停止使用並尋求專業心理支持。',
        ],
      },
      {
        heading: '五、責任限制',
        paragraphs: [
          '本站為開源、免費、無廣告的公益性文化體驗工具。在適用法律允許的最大範圍內，本站作者及貢獻者對任何因使用、誤用、依賴本站內容而產生的直接、間接、附帶、特殊、衍生、懲罰性損失，概不負責。',
          '使用本站即視為已閱讀、理解並同意本免責聲明的全部內容。',
        ],
      },
    ],
  },

  dataSourcePage: {
    title: '資料來源',
    lastUpdated: '更新於 2026 年 4 月',
    sections: [
      {
        heading: '一、總體說明',
        paragraphs: [
          '本站所有命理演算法、文本、解讀模板均基於公開古籍、通行流派著作與開源社區維護的資料集，未引入任何未公開的私有秘傳內容。下文按模組逐一列舉。',
        ],
      },
      {
        heading: '二、八字（四柱推命）',
        paragraphs: [
          '曆法計算依賴開源 npm 套件 tyme4ts（作者：6tail），涵蓋公曆、農曆、節氣、干支、神煞等。',
        ],
        list: [
          '《滴天髓》《子平真詮》《三命通會》：用神、格局、十神類化的術語與判斷框架。',
          '《窮通寶鑒》：調候用神（寒暖燥濕）參考。',
          '《淵海子平》：基礎四柱排盤原則。',
          '神煞資料：綜合《協紀辨方書》《欽定協紀辨方書》及通行流派整理。',
        ],
      },
      {
        heading: '三、紫微斗數',
        paragraphs: [
          '排盤演算法依賴開源 npm 套件 iztro（MIT 協議）。',
        ],
        list: [
          '《紫微斗數全書》：宮位、星曜、四化的基礎排佈與釋義。',
          '《十八飛星策天紫微斗數》：輔星、煞星補充。',
          '現代台港流派注解：作為四化飛星與三方四正的參考釋義。',
        ],
      },
      {
        heading: '四、小六壬',
        paragraphs: [
          '基於《六壬時課》《大六壬指南》中關於「小六壬」時盤的簡化版本，按月、日、時三層數推得宮位（大安、留連、速喜、赤口、小吉、空亡）。',
        ],
      },
      {
        heading: '五、稱骨算命',
        paragraphs: [
          '根據民間流傳的《袁天罡稱骨歌》整理，骨重對應歌訣來自公開印本，本站將不同版本的差異在解讀文字中作了溫和折中。',
        ],
      },
      {
        heading: '六、觀音靈籤',
        paragraphs: [
          '採用流通最廣的「觀音靈籤一百籤」體系，籤詩、解曰、籤意均來自公開寺廟印本與開源整理。本站不主張任何宗教立場。',
        ],
      },
      {
        heading: '七、姓名學（三才五格）',
        paragraphs: [
          '採用日本熊崎健翁創立、流傳至中國的「五格剖象法」。',
        ],
        list: [
          '筆畫資料：參考《康熙字典》部首筆畫體系。',
          '81 數理吉凶：來自《姓名學》（熊崎健翁）通行注本。',
          '本站對姓名分數與五格吉凶僅作展示，不建議據此改名，傳統命名應綜合家族文化、個人含義與現代審美。',
        ],
      },
      {
        heading: '八、黃曆',
        paragraphs: [
          '基於 tyme4ts 提供的節氣、干支、建除十二神、二十八宿、彭祖百忌、神煞等資料，宜忌矩陣與每日吉凶時辰按通行黃曆版本整理。',
        ],
      },
      {
        heading: '九、解夢',
        paragraphs: [
          '夢象詞條整理自公開整理的《周公解夢》通行本，並按現代心理與文化語境作了溫和注解，去除了過度神秘化、宿命化的用語。',
        ],
      },
      {
        heading: '十、致謝',
        paragraphs: [
          '感謝上述古籍的歷代撰者、注者，以及 tyme4ts、iztro、qrcode、html2canvas、reka-ui 等開源項目的作者與維護者。本站站在他們的肩膀上才得以呈現。',
        ],
      },
    ],
  },

  privacyPage: {
    title: '隱私政策',
    lastUpdated: '更新於 2026 年 4 月',
    sections: [
      {
        heading: '一、核心承諾',
        paragraphs: [
          '本站不收集、不存儲、不上傳任何用戶的個人資料。所有計算均在你的瀏覽器本地完成。',
        ],
      },
      {
        heading: '二、本地資料範圍',
        paragraphs: [
          '為提升體驗，下列資訊會在你的瀏覽器 localStorage 中本地存儲，僅你本人可讀取：',
        ],
        list: [
          '生辰輸入（年月日時、性別、陽曆/陰曆）：用於跨頁保留排盤上下文。',
          '主題與語言偏好（國風/簡約、簡體/繁體/英文）。',
          '模組自有的臨時狀態（如黃曆當前查詢日期、夢境關鍵字最近搜尋）。',
        ],
      },
      {
        heading: '三、不收集的資訊',
        paragraphs: [
          '本站不會收集以下任何資訊：',
        ],
        list: [
          '真實姓名、身分證號、電話、電子郵件、地址等可識別身分的資訊。',
          '裝置指紋、IP 位址、瀏覽器畫像、廣告識別碼。',
          '使用行為日誌、點擊熱圖、停留時長。',
          '第三方 Cookie、跨站追蹤。',
        ],
      },
      {
        heading: '四、第三方資源',
        paragraphs: [
          '本站靜態資源（HTML/JS/CSS/字型/圖示）均自行託管或來自版本固定的開源 CDN，不會嵌入任何第三方分析、廣告或社交追蹤腳本（如 Google Analytics、Facebook Pixel、百度統計等）。',
          '若你透過瀏覽器系統級分享（Web Share API）將結果卡片分享至社交平台，相關分享行為受目標平台自身的隱私政策約束，本站無法干預。',
        ],
      },
      {
        heading: '五、二維碼與分享',
        paragraphs: [
          '頁腳與分享彈窗中的二維碼由 qrcode 庫在瀏覽器本地生成，僅編碼當前頁面的 URL，不包含任何用戶身分資訊。掃描後跳轉的目的地仍為本站公開頁面，由掃描者的瀏覽器再次本地計算結果。',
        ],
      },
      {
        heading: '六、資料清理',
        paragraphs: [
          '若你希望清除本地保存的偏好與生辰資料，可透過瀏覽器「清除網站資料 / 清除 localStorage」功能完成，本站不持有任何副本，因此一經清除便無法恢復。',
        ],
      },
      {
        heading: '七、兒童隱私',
        paragraphs: [
          '本站為開源公益工具，不主動面向 13 歲以下未成年人。若監護人發現未成年人長時間使用本站並產生焦慮或依賴情緒，請立即停止使用並尋求心理支持。',
        ],
      },
      {
        heading: '八、AI 解讀功能',
        paragraphs: [
          '本站提供可選的 AI 命盤解讀功能，由 DeepSeek 大模型 API 驅動。該功能完全基於「自帶 API Key」（BYOK）模式：',
        ],
        list: [
          'API Key 僅保存在你本機的 localStorage，本站不收集、不上傳、不代理你的 Key。',
          '所有 AI 請求由你的瀏覽器**直接發送給 DeepSeek 伺服器**，本站不經任何中間代理或日誌記錄伺服器。',
          '發送給 DeepSeek 的內容包含：當前命盤的結構化欄位（年月日時、五行、十神、卦象等）+ 你輸入的提問。**不包含**真實姓名、IP、信箱或可辨識身分的資訊。',
          'DeepSeek 伺服器對 API 請求有自己的隱私政策（保留期、訓練用途等），請參閱 https://www.deepseek.com 的官方政策。',
          '對話歷史僅保存在你本機 localStorage（按命盤指紋分組），可在「設定 - 對話歷史 - 清空所有 AI 會話」一鍵清除。',
          '從 header 直接打開 AI 進入「自由諮詢」模式時，對話內容不持久化，關閉即清。',
        ],
      },
      {
        heading: '九、政策更新',
        paragraphs: [
          '若本政策有重大變更，將在本頁面頂部「更新於 …」字樣處更新日期，並在 GitHub 倉庫的版本說明中標註。繼續使用本站即視為接受最新版本的隱私政策。',
        ],
      },
    ],
  },

  ai: {
    askButton: '詢問 AI',
    askButtonAria: '使用 AI 解讀當前命盤',
    header: {
      toggleOpen: '開啟 AI 解讀',
      toggleClose: '關閉 AI 解讀',
    },
    freeChat: {
      label: '自由諮詢',
      welcomeTitle: '與 AI 命理顧問自由對話',
      welcomeBody:
        '當前沒有命盤上下文。你可以直接提問關於八字、紫微、擇日、解夢等命理話題；如想得到針對你個人的精準解讀，請先在對應模組錄入生辰排盤。',
      inputPlaceholder: '請輸入你的命理諮詢問題…',
      hintGoModule: '想要排盤？請前往頂部導航選擇對應模組',
    },
    drawer: {
      title: 'AI 解讀',
      closeAria: '關閉 AI 解讀面板',
      stop: '停止生成',
      retry: '重試',
      send: '發送',
      sendAria: '發送（⌘ + ↵）',
      placeholder: '基於當前命盤提問；按 ⌘ + ↵ 發送',
      generating: '正在生成…',
      scrollToBottom: '回到底部',
      emptyKey: {
        title: '尚未配置 API Key',
        body: '本模組需要你提供 DeepSeek API Key 才能呼叫。',
        cta: '前往設定',
        privacyNote: 'Key 僅儲存於本機瀏覽器，不會上傳至本站任何後端。',
      },
      firstResponse: '請基於上述命盤資訊，為我做一份簡明的整體解讀。',
    },
    model: {
      v4Flash: 'DeepSeek V4 Flash · 快速 / 便宜',
      v4Pro: 'DeepSeek V4 Pro · 深度推理',
    },
    error: {
      aborted: '已中止生成',
      unauthorized: 'API Key 無效或已失效，請至設定頁檢查',
      'rate-limited': '請求過於頻繁，請稍後再試',
      'server-error': 'AI 服務暫時不可用，請稍後再試',
      network: '網路連線失敗，請檢查網路後重試',
      unknown: 'AI 呼叫失敗，請稍後再試',
    },
  },

  errorBoundary: {
    title: '推演中斷',
    unknown: '頁面在渲染過程中遇到未預期的問題，已為你保留輸入資料，可重試或返回首頁。',
    moduleLabel: '模組',
    codeLabel: '錯因',
    retry: '重試',
    goHome: '返回首頁',
    fortuneCode: {
      'empty-dataset': '術數資料集暫時為空，可能是離線包未就緒，稍後再試。',
      'invalid-input': '輸入格式不被識別，請檢查生辰、姓名或關鍵字後重試。',
      'out-of-range': '輸入超出本模組支持的範圍，請調整後重試。',
      'dep-load-failed': '依賴資源載入失敗，可能是網路不穩，請刷新或稍後再試。',
      invariant: '內部狀態出現意外，已為你中斷本次推演，請回饋到 GitHub Issue。',
      unknown: '推演過程中遇到未分類問題，請重試或返回首頁。',
    },
  },

}
