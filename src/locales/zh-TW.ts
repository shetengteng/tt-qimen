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
        heading: '八、政策更新',
        paragraphs: [
          '若本政策有重大變更，將在本頁面頂部「更新於 …」字樣處更新日期，並在 GitHub 倉庫的版本說明中標註。繼續使用本站即視為接受最新版本的隱私政策。',
        ],
      },
    ],
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

  bazi: {
    title: '八字',
    subtitle: '四柱推命 · 五行相生',
    pageTitle: '八字命盤',
    pageSubtitle: '四柱推演 · 五行強弱 · 十神格局 · 大運流年',
    breadcrumbHome: '首頁',
    breadcrumbCurrent: '八字命盤',

    inputCardTitle: '錄入生辰',
    calendar: { solar: '公曆', lunar: '農曆' },
    field: {
      year: '出生年',
      month: '月',
      day: '日',
      hour: '時辰',
      gender: '性別',
    },
    gender: { male: '男', female: '女', maleTitle: '乾造', femaleTitle: '坤造' },
    hours: [
      '子時 (23-1)', '丑時 (1-3)', '寅時 (3-5)', '卯時 (5-7)',
      '辰時 (7-9)', '巳時 (9-11)', '午時 (11-13)', '未時 (13-15)',
      '申時 (15-17)', '酉時 (17-19)', '戌時 (19-21)', '亥時 (21-23)',
    ],
    btn: {
      paipan: '開始排盤',
      paipanIcon: '◉',
      repaipan: '重新排盤',
      repaipanIcon: '◑',
      share: '生成分享卡片',
      shareIcon: '◈',
      save: '保存到本地',
      saveIcon: '◐',
      moreYears: '查看更多年份 →',
      shishenDetail: '查看詳細十神解讀 ▾',
      shishenDetailCollapse: '收起詳細十神解讀 ▴',
    },

    resultBanner: { title: '排盤結果', subtitle: '四柱 · 五行 · 十神 · 大運 · 流年' },
    resultZoneHint: '請在上方輸入生辰 · 點擊「開始排盤」以觀命盤',

    skeleton: {
      title: '推演中',
      subtitle: '取用神、配大運、繫流年',
    },

    computeError: {
      title: '排盤未完成',
      hint: '當前生辰無法生成命盤，請檢查生辰輸入後重新排盤。',
      retry: '重新排盤',
    },

    chartTitle: '排盤 · 乾造',
    chartTitlePrefix: '排盤',
    chartMeta: { solarLabel: '公曆', lunarLabel: '農曆' },

    pillars: { year: '年柱', month: '月柱', day: '日柱 · 我', hour: '時柱' },
    rowLabel: { gan: '天 干', zhi: '地 支', canggan: '藏 干', shishen: '十 神', nayin: '納 音' },
    rizhuTag: '日 主',
    canggangHint: '本氣',

    relations: {
      chong: '子午相沖',
      zixing: '午午自刑',
      anhe: '巳午暗合',
      chongDescMn: '年支 ↔ 日支，主動盪',
      zixingDescMn: '年支 ↔ 時支，主自耗',
      anheDescMn: '月支 ↔ 時支，主暗助',
    },

    shishen: {
      sectionTitle: '十神結構',
      sectionTag: '官印 · 財官格',
      moreShown: '查看詳細十神解讀',
      detailPanelLabel: '十神詳細解讀',
      longField: {
        trait: '性格特質',
        suit: '適宜方向',
        caution: '行運警示',
        relation: '與日主關係',
      },
      items: [
        {
          pillar: '年干',
          gan: '庚',
          shishen: '偏財',
          desc: '代表父親、意外之財、外在機遇。年干偏財透，早年得長輩提攜，可因外出或多元收入起家。',
          descMn: '代表父親、外在財富與機遇。主動求財而得，對外出、投資敏感。',
        },
        {
          pillar: '月干',
          gan: '辛',
          shishen: '正財',
          desc: '代表固定資產、妻宮、穩定回報。月干正財與年干偏財雙透，宜防「財多身弱」，合作重於獨幹。',
          descMn: '代表正職薪資、配偶。財星雙透需防「浮財」與勞碌，宜穩中求進。',
        },
        {
          pillar: '時干',
          gan: '甲',
          shishen: '偏印',
          desc: '代表才藝、繼母、靈感、宗教傾向。時干偏印透出，文思敏捷，晚年得才藝傍身，亦主子女聰明。',
          descMn: '代表才藝、學術、子女。文思敏捷，有靈感，適合創作與規劃。',
        },
        {
          pillar: '日主',
          gan: '丙',
          shishen: '日主',
          desc: '本命之主，為陽火丙。性格開朗、熱情、領導力強；取用神水木以潤澤，忌火土再旺。',
          descMn: '日主丙火，性格開朗、熱情、領導力強；用神水木以潤澤。',
        },
      ],
    },

    radar: {
      title: '五行強弱',
      desc: '火氣當令三勢，金兩透有根，木、水、土各有一勢。日主丙火坐子水、甲木生扶，身強能任財官，唯木弱、水淺，宜以水潤、木疏為上策。',
      descMn: '火氣當令三勢，金兩透有根，木、水、土各佔一勢。日主丙火坐子水、甲木生扶，身強能任財官；木弱水淺為短板，宜水潤、木疏為上策。',
      labels: { mu: '木', huo: '火', tu: '土', jin: '金', shui: '水' },
    },

    fiveElementsLabel: { strong: '偏旺', weak: '偏弱', balanced: '平' },

    interpret: {
      title: '命盤簡析',
      p1: '日主丙火生於巳月火旺之時，火氣當令，身強有力。天干庚辛金透出為財星，地支子水為官，有財有官而有用。唯獨木氣偏弱，年支午火過旺，宜以水潤之、以木疏之。',
      p2: '格局上偏印（甲）配日主，文思敏捷；財星雙透（庚辛），事業上宜與貴人合作。子水為官星，利於求職、升遷之事。',
      tags: ['身 · 強', '格 · 財官相濟', '用神 · 水木', '忌神 · 火土'],
      tagsMn: ['身強', '財官相濟', '用神 · 水木', '忌神 · 火土'],
      tagAnnots: [
        {
          focus: 'tag-shen',
          short: '身強：日主氣足，能擔財官。',
          long: '日主丙火生在巳月火旺之地，又得年時火土相助，氣勢充盈。身強者宜行財、官、食傷之運以洩秀，最忌再補印比助身。',
        },
        {
          focus: 'tag-pattern',
          short: '財官相濟：庚辛金為財、子水為官，財生官旺。',
          long: '天干庚辛金透出為財星，地支子水暗藏為官星，財能生官、官能護財，是事業宮位的穩定結構。利於在組織中擔任帶資源的中層角色，亦適合與貴人合作經商。',
        },
        {
          focus: 'tag-yongshen',
          short: '用神 · 水木：以水潤火、以木疏土。',
          long: '本盤火土偏旺，需以水克之、以木耗之。歲運若引動壬癸亥子（水）、甲乙寅卯（木）則身心順遂；流年遇水木相生之地，事業、感情、健康三方面同步上行。',
        },
        {
          focus: 'tag-jishen',
          short: '忌神 · 火土：火土再旺則身重難調。',
          long: '本盤已是火土偏旺，再遇丙丁巳午（火）或戊己辰戌丑未（土）的歲運，則身勢過亢，易表現為脾氣急躁、判斷激進、人際摩擦增加；行運至此宜以水木的事務、環境、人事來調和。',
        },
      ],
    },

    shensha: {
      title: '神煞',
      pillarAbbr: { year: '年', month: '月', day: '日', hour: '時' },
      category: {
        auspicious:   { title: '吉神', sub: '貴氣扶助' },
        neutral:      { title: '中性', sub: '助力與課題並存' },
        inauspicious: { title: '凶煞', sub: '宜留意' },
      },
      footerTip: '神煞僅作性格與趨勢參考，不代表絕對吉凶',
      empty: '本命四柱未命中常見神煞',
    },

    fortune: {
      title: '大運 · 十年一變',
      titleMn: '大運時間軸',
      subtitle: '起運 5 歲 · 一生十運 · 蛇形鋪陳',
      subtitleMn1: '起運 5 歲 · 十年一運',
      subtitleMn2: '一生十運 · 蛇形鋪陳',
      genderBadgeMale: '乾造 · 順行',
      genderBadgeFemale: '坤造 · 逆行',
      genderBadgeHint: '此模組按性別展開（四柱五行十神不受性別影響）',
      currentDetailTitle: '當前大運 · {age} 歲',
      currentDetailTitleMn: '當前大運 · {tenGod}',
      currentDetailSubtitleMn: '{ganzhi} · {tenGod} · {verdict}',
      yi: '宜',
      ji: '忌',
      /** @deprecated 舊示例文案（1990-05-20 男樣本），改為按 chart 動態拼裝；保留 key 僅為向後兼容，不再被任何路徑渲染 */
      currentDetailSubtitle: '天干乙木為正印，地支酉金為正財 · 印財相生 · 吉',
      /** @deprecated 同上，已由 chart.decades[*].hint 動態填充 */
      currentDetailHint: '此十年走正印配正財之運，印主學識、正氣與名聲；財主財富、務實與收獲。印星有利於進修、轉型、獲得資格認證；財星則提示在本行業深耕能得實利。總體是「長期投入 · 穩健回報」的階段。',
      /** @deprecated 同上，無可信源動態生成 yi/ji 行為列表，已刪除展示 */
      yiContent: '學習進修、拿證書、跟隨師長、處理文書、適度投資房產或長線資產',
      /** @deprecated 同上 */
      jiContent: '頻繁跳槽、投機冒險、與女性長輩衝突、過度消費',
      /** @deprecated 同上，吉/中/凶 badge 已由 chart.decades[*].tendency 動態生成 */
      currentBadge: '吉運',
      verdictJi: '吉',
      verdictZhong: '中',
      verdictXiong: '凶',
    },

    flow: {
      title: '流年 · 一歲一更',
      titleMn: '流年運勢',
      subtitle: '當年運勢與大運共振，取其要領而觀之',
      subtitleMn: '一歲一更 · 與大運共振',
      currentSuffix: '今年',
    },

    collapse: {
      collapseLabel: '收起',
      expandLabel: '展開',
      sectionChart: '◎ 命盤',
      sectionInterpret: '◎ 命盤簡析',
      sectionShensha: '◎ 神煞',
      sectionFortune: '◎ 大運時間軸',
      sectionFlow: '◎ 流年',
      sectionChartMn: '命盤',
      sectionInterpretMn: '命盤簡析',
      sectionShenshaMn: '神煞',
      sectionFortuneMn: '大運時間軸',
      sectionFlowMn: '流年運勢',
      annotExpand: '展開註釋',
      annotCollapse: '收起註釋',
      annotLabel: {
        nayin: '納音註釋',
        pattern: '格局註釋',
        shensha: '神煞註釋',
      },
    },

    share: {
      title: '我的八字命盤 · TT 占卜',
      text: '四柱 · 五行 · 十神 · 大運 · 流年。來自 TT 占卜的命盤解讀。',
    },

    source: {
      prefix: '出處：',
      classicalLabel: '古籍原文',
      pending: '待審校',
    },
  },
  ziwei: { title: '紫微斗數', subtitle: '十二宮垣 · 三方四正' },
  liuren: {
    title: '小六壬',
    subtitle: '掐指一算 · 應事即時',
    pageTitle: '小六壬',
    pageSubtitle: '大安 · 留連 · 速喜 · 赤口 · 小吉 · 空亡',
    breadcrumbHome: '首頁',
    breadcrumbCurrent: '小六壬',

    timeBar: {
      lunar: '當前農曆',
      monthStep: '月起',
      dayStep: '日數',
      hourStep: '時辰',
    },

    input: {
      title: '起 · 卦',
      modeImmediate: '即時起卦',
      modeCustom: '自訂時間',
      questionLabel: '心中一問（選填）',
      questionPlaceholder: '如：今年運勢、此事是否成功…',
      aspectLabel: '問事方向',
      hourLabel: '時辰',
      hourSuffix: '時',
      hourNowFmt: '當前（{name}）',
      monthLabel: '農曆月',
      dayLabel: '農曆日',
    },

    aspect: {
      overall: '綜合',
      career: '事業',
      love: '感情',
      wealth: '財運',
      health: '健康',
      travel: '出行',
    },

    btn: {
      paipan: '即刻起卦',
      paipanIcon: '◉',
      reset: '重新起卦',
      resetIcon: '◐',
      repaipan: '再起一卦',
      repaipanIcon: '◑',
      share: '生成分享卡片',
      shareIcon: '◈',
      save: '儲存到本機',
      saveIcon: '◐',
    },

    resultBanner: {
      title: '卦象既成',
      subtitle: '月起 · 日數 · 時辰 · 三步入宮',
    },

    skeleton: {
      title: '掐指推算',
      subtitle: '取月、加日、入時辰，三步定宮',
    },

    wheel: {
      centerLabel: '當 前 卦',
    },

    verdict: {
      idle: '—',
      ji: '吉 · 順勢可成',
      ping: '平 · 進退有度',
      xiong: '凶 · 宜守不宜進',
    },

    reading: {
      suitable: '宜',
      avoid: '忌',
    },

    placeholder: {
      title: '尚未起卦',
      reading: '請先「即刻起卦」或「自訂時間」起一卦，此處將顯示對應宮位的解讀。',
    },

    preview: {
      viewing: '正在查看「{palace}」宮的解讀（非本卦命中宮）',
      back: '返回本卦',
    },

    computeError: {
      title: '起卦未成',
      hint: '輸入資料有誤，請檢查月/日/時辰後重試。',
      retry: '重新起卦',
    },

    share: {
      title: '我的小六壬 · TT 占卜',
      text: '掐指一算 · 應事即時 · 來自 TT 占卜的小六壬結果。',
    },
  },
  chenggu: {
    title: '秤骨論命',
    subtitle: '袁天罡之訣 · 一斤一兩',
    pageTitle: '秤骨算命',
    pageSubtitle: '袁天罡古法 · 年月日時骨重 · 五十一段歌訣',
    breadcrumbHome: '首頁',
    breadcrumbCurrent: '秤骨算命',
    inputCardTitle: '錄入生辰',
    btn: {
      paipan: '開始秤骨',
      paipanIcon: '◈',
      repaipan: '重新秤骨',
      repaipanIcon: '◑',
      share: '生成分享卡片',
      shareIcon: '◈',
      save: '儲存到本地',
      saveIcon: '◐',
    },
    resultBanner: {
      title: '四骨秤重',
      subtitle: '年月日時 · 骨重相加 · 歌訣以推終身',
    },
    skeleton: {
      title: '秤骨中',
      subtitle: '查年柱、取月日、定時辰、加骨重',
    },
    section: {
      breakdown: '四骨分解',
      poem: '歌訣',
    },
    computeError: {
      title: '秤骨未成',
      hint: '生辰資料有誤或超出 1900-2100 年支援範圍，請檢查後重試。',
      retry: '重新錄入',
    },
    balance: {
      label: '骨 · 重',
      labelMn: '骨 · 重',
      unit: '兩',
      breakdown: { year: '年', month: '月', day: '日', hour: '時' },
    },
    placeholder: { displayWeight: '五兩一錢' },
    table: {
      year: '年 骨',
      month: '月 骨',
      day: '日 骨',
      hour: '時 骨',
      totalLabel: '四 骨 相 加',
    },
    level: {
      top: '極 · 貴極',
      high: '上 · 貴顯',
      middle: '中 · 平順',
      low: '下 · 辛勞',
      bottom: '貧 · 清苦',
    },
    poem: {
      seal: '啟門',
      eyebrow: '袁 天 罡 歌 訣',
      meta: '古法歌訣 · 公版整理',
    },
    interpret: {
      title: '◉ 歌訣釋義',
      titleMn: '◆ 歌訣釋義',
      note: '註：白話解讀由編輯團隊在公版古籍基礎上整理，僅供文化參考。',
    },
    share: {
      title: '我的秤骨算命 · TT 占卜',
      text: '年月日時 · 骨重相加 · 袁天罡古法。來自 TT 占卜的秤骨結果。',
    },
  },
  lingqian: {
    title: '靈籤問卜',
    subtitle: '虔誠一念 · 神明指引',
    pageTitle: '觀音靈籤',
    pageSubtitle: '心誠則靈 · 搖籤百支 · 問事指迷',
    breadcrumbHome: '首頁',
    breadcrumbCurrent: '觀音靈籤',

    tubeLabel: '觀音靈籤',

    /** 6 等級顯示文案（zh-TW，等級用語兩岸通用，保留漢字原文） */
    level: {
      '上上': '上上',
      '上吉': '上吉',
      '中吉': '中吉',
      '中平': '中平',
      '中凶': '中凶',
      '下下': '下下',
    },

    input: {
      title: '所 求 何 事',
      questionLabel: '心中所問（選填）',
      questionPlaceholder: '如：今年學業、姻緣、事業、求財…',
      topicLabel: '占問領域',
      hintBefore: '心中默念所求之事 ·',
      hintEmphasis: '三次深呼吸',
      hintAfter: '後輕按啟籤',
      rateLimit: '你已求籤 {count} 次 · 心誠則靈 · 莫頻頻擾佛',
    },

    topic: {
      overall: '綜合',
      family: '家宅',
      marriage: '婚姻',
      career: '事業',
      wealth: '財富',
      travel: '出行',
      health: '健康',
    },

    btn: {
      paipan: '啟籤',
      paipanIcon: '◈',
      reset: '再搖',
      resetIcon: '◐',
      repaipan: '重新求籤',
      repaipanIcon: '◑',
      share: '生成分享卡片',
      shareIcon: '◈',
      save: '保存到本地',
      saveIcon: '◐',
    },

    resultBanner: {
      title: '籤文既啟',
      subtitle: '觀音慈悲 · 靈籤指迷',
    },

    skeleton: {
      title: '搖籤百支',
      subtitle: '心誠則靈 · 神明開示',
    },

    qianTitle: {
      qianLabel: '第  籤',
      qianPrefix: '第',
      qianSuffix: '籤',
    },

    poem: {
      label: '◉ 籤 詩 ◉',
      taleLabel: '典故',
      taleLabelMn: '◆ 典故',
      taleIntro: '典出《{title}》。籤意詳見解曰/仙機與 6 大分類。',
      seal: '觀音',
    },

    jieyue: {
      label: '解 曰',
    },

    xianji: {
      label: '仙 機',
    },

    topics: {
      title: '◉ 分事而問 · 六事開示',
    },

    placeholder: {
      title: '尚未求籤',
      jieyue: '請先「啟籤」抽取一籤，此處將顯示白話解曰。',
      xianji: '籤文未出 · 仙機未啟',
      topic: '抽籤後將按「家宅 / 婚姻 / 事業 / 財富 / 出行 / 健康」逐項開示。',
    },

    divider: {
      qianTitle: '第 {num} 籤 · {level}',
    },

    computeError: {
      title: '未能求籤',
      hint: '樣本資料為空或載入失敗，請重新整理後再試。',
      retry: '重新求籤',
    },

    centerpiece: {
      ariaLabel: '第 {num} 籤 · {level} · {title}',
    },

    share: {
      title: '我的觀音靈籤 · TT 占卜',
      text: '虔誠一念 · 神明指引 · 來自 TT 占卜的觀音靈籤。',
    },
  },
  xingming: {
    title: '姓名學',
    subtitle: '五格剖象 · 三才配置',
    pageTitle: '姓名學五格',
    pageSubtitle: '康熙筆畫 · 天人地外總 · 八十一數理',
    breadcrumbHome: '首頁',
    breadcrumbCurrent: '姓名學五格',
    inputCardTitle: '姓名輸入',

    field: {
      surname: '姓氏',
      givenName: '名字',
      gender: '性別',
      birthYear: '出生年',
    },
    placeholder: {
      surname: '如：李',
      givenName: '如：文軒',
      birthYear: '可選 · 選擇年份',
    },
    birthYearOption: {
      unspecified: '未指定',
    },
    gender: {
      male: '男',
      female: '女',
    },

    btn: {
      calculate: '五格推演',
      recalculate: '更換名字',
      share: '生成分享卡片',
      save: '保存結果',
    },

    resultBanner: {
      title: '五格剖象結果',
      subtitle: '天地人外總 · 81 數理 · 綜合評分',
    },

    breakdown: {
      title: '筆畫拆解',
      simplified: '簡',
      kangxi: '康熙',
      kangxiWord: '康熙筆畫',
      hintPrefix: '姓名學以',
      hintSuffix: '為準，部分繁簡體筆畫不同。',
    },

    grids: {
      tian: '天格',
      ren: '人格',
      di: '地格',
      wai: '外格',
      zong: '總格',
    },

    levels: {
      '大吉': '大吉',
      '吉': '吉',
      '中吉': '中吉',
      '中平': '中平',
      '凶': '凶',
      '大凶': '大凶',
    },

    detail: {
      strokesUnit: '畫',
    },

    section: {
      fivegrids: '五格推演',
      sancai: '三才配置',
      overall: '綜合評分',
    },

    sancai: {
      sectionTitle: '三才配置',
      sectionSubtitle: '天 · 人 · 地 三才五行 · 五等級判定',
      slotLabel: {
        tian: '天才',
        ren: '人才',
        di: '地才',
      },
      level: {
        great: '大吉',
        good: '吉',
        mid: '中吉',
        bad: '凶',
        worst: '大凶',
      },
      relation: {
        sheng: '生',
        ke: '剋',
        tongHe: '比和',
        xie: '洩',
        hao: '耗',
      },
      relationFull: {
        sheng: '相生',
        ke: '相剋',
        tongHe: '比和',
        xie: '洩氣',
        hao: '受剋',
      },
      summary: {
        great: '三才相生 · 基業穩固',
        good: '生扶有力 · 順勢可成',
        mid: '不衝不悖 · 守成可安',
        bad: '一處生剋 · 須留意應對',
        worst: '層層相剋 · 需慎防波折',
      },
      hint: '三才取自天/人/地三格的姓名學五行；五行間生 (順) 剋 (逆) 比和 (同) 三種關係決定吉凶等級，獨立於綜合評分。',
      diagramAria: '三才配置：{tian} {tianToRen} {ren} {renToDi} {di}，等級 {level}',
    },

    overall: {
      label: '綜合評分',
      badge: {
        excellent: '優',
        good: '良',
        fair: '中',
        poor: '差',
      },
      badgeWord: {
        excellent: '格局開闊',
        good: '搭配良好',
        fair: '中規中矩',
        poor: '需多磨礪',
      },
      summary: '「{name}」整體五格{badgeWord}，人格 {renElement} · {renLevel}，總格 {zongElement} · {zongLevel}；綜合評分 {score} / 100。',
      gaugeAria: '綜合評分儀表盤，得分 {score} 分，等級：{badge}',
    },

    skeleton: {
      title: '五格推演中 · · ·',
      subtitle: '康熙筆畫 · 天人地外總 · 81 數理',
    },

    computeError: {
      title: '推演失敗',
      hint: '姓名輸入有誤，請檢查後重試。',
      retry: '重新推演',
      rareChar: '未收錄字：{char}（暫不支援生僻字）',
      byCode: {
        invalidInput: '姓名輸入不合法，請檢查後重試。',
        invariant: '內部計算異常（請把姓名截圖回饋給我們以便修復）。',
        depLoadFailed: '筆畫字庫載入失敗，請檢查網路後重試。',
        unknown: '未能完成姓名推演，請檢查輸入後重試。',
        empty: {
          surname: '請填寫姓氏。',
          givenName: '請填寫名字。',
        },
        nonCjk: {
          surname: '姓氏僅支援中文漢字（不支援英文 / 數字 / 符號）。',
          givenName: '名字僅支援中文漢字（不支援英文 / 數字 / 符號）。',
        },
        length: {
          surname: '僅支援單姓或複姓（1-2 字）。',
          givenName: '僅支援單字或雙字名（1-2 字）。',
        },
      },
    },

    share: {
      title: '我的姓名學五格 · TT 占卜',
      text: '康熙筆畫 · 天人地外總 · 81 數理 · 來自 TT 占卜的姓名學五格。',
    },

    disclaimer: '81 數理由熊崎健翁 1918 年整理，屬文化參考，不等於人格。',
  },
  huangli: {
    title: '老黃曆',
    subtitle: '宜忌吉時 · 節氣物候',
    pageTitle: '黃曆擇日',
    pageSubtitle: '每日宜忌 · 吉神凶煞 · 九類事由',
    breadcrumbHome: '首頁',
    breadcrumbCurrent: '黃曆擇日',

    resultBanner: {
      title: '黃曆一日',
      subtitle: '宜忌 · 神煞 · 九事 · 月曆',
    },

    query: {
      title: '查詢日期',
      fieldYear: '年',
      fieldMonth: '月',
      fieldDay: '日',
      fieldMatter: '所求事項（選填）',
      matterAll: '全部',
      btnQuery: '查詢',
      btnQueryIcon: '◈',
      btnToday: '今日',
      btnTodayIcon: '↻',
    },

    todayCard: {
      weekdayPrefix: '星 · 期 · ',
      infoGanzhi: '干 支',
      infoDuty: '值 日',
      infoFetus: '胎 神',
      infoChong: '沖 煞',
      infoPengzu: '彭祖忌',
      infoTerm: '節 氣',
      ecliptic: { yellow: '黃道', black: '黑道' },
      dutySuffix: '日',
      bigLabel: '建 · 除',
      chongFmt: '沖{zodiac}（{ganzhi}）· 煞{direction}',
      noFestival: '—',
    },

    yiji: {
      yiTitle: '今 · 日 · 宜',
      yiSubtitle: '推薦施行之事項',
      jiTitle: '今 · 日 · 忌',
      jiSubtitle: '宜避免之事項',
      empty: '無',
    },

    shensha: {
      gods: '吉 · 神',
      fiends: '凶 · 神',
      luckyHours: '吉 時',
      directions: '喜神 · 財神',
      directionsFmt: '喜神 {joy} · 財神 {wealth}',
      empty: '—',
    },

    matters: {
      sectionTitle: '九 事 速 查',
      sectionHint: '點擊事由，查看當日評判',
      all: '全部',
      names: {
        jisi:    '祭祀',
        qifu:    '祈福',
        jiaqu:   '嫁娶',
        chuxing: '出行',
        qianyue: '簽約',
        kaishi:  '開市',
        dongtu:  '動土',
        ruzhai:  '入宅',
        potu:    '破土',
      },
      verdict: {
        yi: '宜',
        ji: '忌',
        ping: '平',
      },
    },

    calendar: {
      divider: '◆ 月 曆 總 覽 ◆',
      title: '{year} 年 {month} 月',
      prev: '上月',
      next: '下月',
      prevMonthFmt: '{month} 月',
      nextMonthFmt: '{month} 月',
      prevMonthAria: '切換到 {month} 月（上月）',
      nextMonthAria: '切換到 {month} 月（下月）',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      legendHuangdao: '黃道日',
      legendHeidao: '黑道日',
      legendGood: '符合所選事由',
      matterHintPrefix: '當前篩選：',
      clearMatter: '清除篩選',
      gridAria: '{year} 年 {month} 月 月曆',
      dayAriaFmt: '{year} 年 {month} 月 {day} 日 週{weekday}',
      todayLabel: '今日',
      matchLabel: '符合所選事由',
      outOfMonthLabel: '非本月',
      nextGoodFmt: '下一個 ✓ 日：{month} 月 {day} 日',
      nextGoodAria: '跳轉到 {month} 月 {day} 日（下一個符合所選事由的日子）',
      openPickerAria: '打開年月選擇器（當前 {year} 年 {month} 月）',
      pickerYearFmt: '{year} 年',
      pickerMonthFmt: '{month} 月',
      pickerYearLabel: '年份',
      pickerMonthLabel: '月份',
      pickerToday: '返回今日',
      pickerConfirm: '確定',
      pickerYearListAria: '年份列表',
      pickerMonthGridAria: '月份網格',
      pickerPrevYearAria: '切換到 {year} 年',
      pickerNextYearAria: '切換到 {year} 年',
    },

    detail: {
      title: '所選日 · 詳情',
      dialogTitle: '黃曆詳情',
      closeAria: '關閉詳情',
      duty: '十二建星',
      dutyIntroFmt: '{duty}日',
      gods: '吉神',
      fiends: '凶神',
      chongLabel: '沖煞',
      pengzu: '彭祖忌',
      fetus: '胎神',
      luckyHours: '吉時',
      directions: '方位',
      directionsFmt: '喜神 {joy} · 財神 {wealth} · 福神 {fu}',
      dateFmt: '{date} · 週{weekday}',
      lunarFmt: '農曆 {lunar} · {ecliptic}',
      yi: '宜',
      ji: '忌',
      empty: '無',
    },

    btn: {
      share: '生成分享卡片',
      shareIcon: '◈',
      save: '儲存到本地',
      saveIcon: '◐',
      reset: '返回今日',
      resetIcon: '↻',
    },

    computeError: {
      title: '日期無效',
      hint: '請檢查年 / 月 / 日是否合法（支援範圍：1901–2099）。',
      retry: '返回今日',
      byCode: {
        invalidInput: '日期格式不合法（如 2026-02-30 不存在）。請檢查年 / 月 / 日後重試。',
        outOfRange: '該年份超出黃曆支援範圍（{min}–{max} 年）。請改用範圍內的日期。',
        unknown: '未能完成黃曆推演。請檢查日期後重試，或返回今日。',
      },
    },

    solarTerm: {
      dialogTitle: '節氣 · {name}',
      closeAria: '關閉節氣科普',
      viewDayBtn: '查看當日黃曆',
      notFound: '暫無該節氣的科普資料。',
      meaningLabel: '節氣含義',
      phenomenaLabel: '物候三候',
      customsLabel: '民俗與養生',
      season: { spring: '春', summer: '夏', autumn: '秋', winter: '冬' },
    },

    luckyHours: {
      dial: {
        ringAria: '12 時辰吉凶圓盤',
        cellAria: '{name}（{ganzhi} · {star}），{ecliptic}',
        nowLabel: '此時',
        summaryLabel: '黃道時辰',
        hintTapCell: '點擊扇區查看時辰詳情',
        fallbackSummary: '查看完整列表',
      },
    },

    share: {
      title: '我的黃曆一日 · TT 占卜',
      text: '每日宜忌 · 吉神凶煞 · 九類事由 · 來自 TT 占卜。',
    },
  },
  jiemeng: {
    title: '周公解夢',
    subtitle: '夢境尋蹤 · 心象索解',
    pageTitle: '周公解夢',
    pageSubtitle: '兩千詞條古籍 · 模糊查詢 · 現代建議',
    breadcrumbHome: '首頁',
    breadcrumbCurrent: '周公解夢',

    input: {
      title: '輸入所夢',
      keywordLabel: '夢境關鍵詞',
      keywordPlaceholder: '夢見了什麼？如：夢見蛇、掉牙、飛翔…',
      categoryLabel: '夢境分類',
      categoryAuto: '自動識別',
      hint: '支援模糊查詢 · 內建《周公解夢》公版詞條 · 古籍與現代雙解',
    },

    btn: {
      search: '查詢解夢',
      searchIcon: '☌',
      reset: '清空',
      resetIcon: '◐',
      share: '生成分享卡片',
      shareIcon: '◈',
      save: '儲存到本機',
      saveIcon: '◐',
      another: '查其他夢境',
      anotherIcon: '◑',
    },

    category: {
      sectionTitle: '按 類 瀏 覽',
      sectionSubtitle: '傳統《周公解夢》分類索引，點擊任一卡片篩選詞條',
      countFmt: '{n} 條',
      animal: '動物',
      people: '人物',
      nature: '自然',
      body: '身體',
      life: '生活',
      ghost: '神怪',
      building: '建築',
      other: '其他',
    },

    recent: {
      label: '近日所查',
      clear: '清空',
    },

    result: {
      searchHead: '"{q}" · 搜尋結果',
      categoryHead: '{name} · 分類瀏覽',
      allHead: '全部詞條',
      countFmt: '共 {n} 條詞條',
    },

    entry: {
      detailCta: '查看詳情',
    },

    empty: {
      title: '沒有找到相關詞條',
      desc: '試試換個關鍵詞，或點擊上方的分類卡片瀏覽所有詞條。',
    },

    detail: {
      classical: '古籍原文',
      classicalSource: '《周公解夢》公版古籍',
      modern: '現代解讀',
      adviceLabel: '建議：',
      sensitiveHint: '※ 本詞條含古籍中關於死亡、病痛、鬼神等文化象徵的原始表述，僅為傳統意象記錄，請以象徵視角理解，不作為現實預兆。',
      warning: '⚠ 夢境解讀因人而異，古籍僅供參考。若夢境頻繁困擾現實生活，建議諮詢專業心理諮詢師。',
      dialogTitle: '詞條詳情',
      closeAria: '關閉詳情',
    },

    tag: {
      auspicious: '吉兆',
      cautious: '警示',
      ambiguous: '多義',
      neutral: '中性',
    },

    share: {
      title: '我的解夢詞條 · TT 占卜',
      text: '古籍原文 · 現代解讀 · 來自 TT 占卜的周公解夢。',
    },
  },
}
