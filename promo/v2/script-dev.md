# tt-qimen 宣传片 · 开发者版 · 总分镜脚本(v1.5)

**版本** v1.5 · 在 v1.4 基础上做"文案与术语减肥":融入"摆盘看不懂 · 交给 AI"这条贯穿全片的核心 hook;去掉过细的开发者术语(CSS Token / URL 参数 / Tauri 2 / BYOK / localStorage / DevTools / Vue 3 SPA / Tailwind v4 / GitHub Pages / .dmg / .msi 等);S4b 屏上标题与字幕从"这就是真实运行的产品页面"换成"八门 · 七法,立等可现"。**画面、镜头、时长全部保持 120s/13 镜头不变**
**总时长** 120 秒(目标 90-120 秒区间,**已到上限**)
**用途** GitHub 仓库 README hero / 技术社区分享 / 招募贡献者
**受众** 有开发经验的工程师 / 想 Star 仓库的技术人 / 潜在 contributor
**风格基调** 功能 50 + 技术 50,看得见演示、点得到库名、可考据
**画幅** 1920×1080 (16:9),60 fps
**色谱** 朱砂红 `#C23A2A` · 宣纸黄 `#FFFBF0` · 墨黑 `#1A1613` · 终端绿 `#7ec699`(代码角标)
**字体** 标题 `STZhongsong / Noto Serif CJK SC`,代码/标签 `JetBrains Mono / Menlo`,正文 `PingFang SC / Inter`

---

## 时间轴一览(13 镜头 · 120 秒)

| # | 起点 | 时长 | 镜头标题 | 信息焦点 |
|---|---|---|---|---|
| S0 | 00:00 | 6s | **GitHub 真截图 · 开场** | 浏览器壳 + 1440×8668 真实仓库截图 + Ken Burns 慢推 |
| S1 | 00:06 | 6s | **启门问卜** | 与 v1 风格完全一致:"古人问天 · 今人问己" |
| S2 | 00:12 | 9s | **八字排盘 demo(mock)** | 仿古 4 柱呈现 + `tyme4ts` 角标 |
| S3 | 00:21 | 8s | **古籍考据** | 4 本古籍仿古页面飞过 + "一切有迹可循" |
| S4 | 00:29 | 11s | **8 大模块矩阵** | 模块卡 + 每张底部核心库角标 |
| S4b | 00:40 | 10s | **真实产品页轮播** | 5 张真实站点截图轮播:首页 → 八字 → 紫微 → 黄历 → 设置 |
| **S5** | **00:50** | **14s** | **AI 解读 · v1.4 改:左半真截图 + 右半真 markdown** | **左半 `app-bazi-result.png`**(带 query 自动排好的真实页面)+ 浏览器壳 + `LIVE` 角标;**右半 4 块逐段揭示的真 markdown 输出**(命盘总览/格局/喜忌/神煞/免责声明),8 家 LLM chip 切换 |
| S6 | 01:04 | 10s | **双主题(真截图)** | 左右各嵌入一张真实截图 `theme-guofeng.png` / `theme-minimal.png` |
| **S7** | **01:14** | **10s** | **三种形态 · v1.4 改:真截图 × 3** | Web / macOS / Windows 三个窗口外壳各自嵌入 `app-home.png` 真截图 + 平台标签(GitHub Pages / .dmg / .msi),顶部主标"一份代码 · 三种形态" |
| S8 | 01:24 | 10s | **隐私本地** | 零后端 / BYOK / localStorage |
| S9 | 01:34 | 12s | **核心技术栈墙** | 13 个技术 logo + 标签平铺呈现 |
| **S10** | **01:46** | **10s** | **项目设计思路(v1.4 新)** | 4 层架构图(UI → Application → Domain Core → AI Layer · BYOK)逐层入场 + 层间虚线箭头;右侧 aside 卡列 4 条设计原则 |
| S11 | 01:56 | 4s | **CTA · Star 与贡献** | git clone / GitHub 链接 / MIT License |

---

## 详细分镜

### S0 · 00:00–00:06 · GitHub 真截图 · 开场(v1.3 新)

| 项 | 内容 |
|---|---|
| **视觉** | 全黑底 → 顶部 40px 仿浏览器顶栏(三色圆点 + URL `github.com/shetengteng/tt-qimen`)→ 底下一张真实截取的 1440×8668 GitHub 仓库截图,初始 fit-to-width 居顶显示;右上一枚朱砂红圆角徽 `github.com/shetengteng/tt-qimen · MIT · Open Source` |
| **动效** | 截图 `opacity 0→1`(1.2s 入场);随后 `transform: translateY(0)→translateY(-18%) scale(1.00→1.04)` 做 6s 的 Ken Burns 缓动,自然向下推进让人看到 README 的开头;**不再有任何朱砂红圈/标签锚点指引**,信息全交给字幕 |
| **屏上文字** | (仅浏览器壳与右上徽,无锚点说明) |
| **旁白(zh)** | (静默 0.8s)"一份开源的中式占卜浏览器,代码托管在 GitHub,MIT License。" |
| **字幕(2 行)** | `github.com/shetengteng/tt-qimen` / 一份开源的中式占卜浏览器 · MIT License |
| **配音语气** | 男低音,平直陈述,像电影片头报字幕 |
| **依赖资产** | `promo/v2/assets/github-repo.png`(Playwright 截自真实 GitHub 仓库) |
| **v1.3 改动** | 整条镜头从原 S10(尾部)挪到首位作 S0;删除 `gh-annotations` 整块,删除 5 个 `.ann-*` 标注与对应 schedule;改用 Ken Burns 单一动效 |

### S1 · 00:06–00:12 · 启门问卜 (6s)

| 项 | 内容 |
|---|---|
| **视觉** | 纯黑底 → 中央朱砂"启"字(320px,衬线)浮现 → 下方主标 "启门问卜"(衬线字 56pt,字间距 0.5em) → 副标 `tt-qimen · open the gate, ask the way`(衬线小字 18pt,透明度 0.55,英文小写) |
| **动效** | "启"字 `scale 1.15→1.0` + `filter: blur(8px)→0`(1.8s, delay 0.4s);主标 `fadeUp`(1.8s 后入场);副标(2.4s 后入场) |
| **屏上文字** | 启 / 启门问卜 / tt-qimen · open the gate, ask the way |
| **旁白(zh)** | (静默 2s)"古人问天,今人问己。" |
| **字幕** | 古人问天 · 今人问己 · 启门问卜 |
| **配音语气** | 男中音,沉稳,留白,像念诗的第一句 |
| **变更说明** | **v1.3 HTML 结构由 `main-title + code-comment` 完全切换为 v1 模板的 `kanji-wrap > {kanji, subtitle-main, subtitle-en}`**,CSS 一并同步,字号/字间距/动画时序完全一致 |

### S2 · 00:12–00:21 · 八字排盘 demo (9s)

| 项 | 内容 |
|---|---|
| **视觉** | 米黄底 → 中央出现一张完整的八字四柱排盘卡:年/月/日/时四列,每列含天干 + 地支 + 纳音 + 十二长生 + 神煞;卡片右上角浮一个浅墨色徽标 `powered by tyme4ts + lunisolar`(等宽字体) |
| **动效** | 卡片整体 `translateY(40px) → 0` + `opacity 0→1`;四柱内的数据用 `staggered` 入场,每柱 0.15s 间隔 |
| **屏上文字** | 八字排盘 · 真实历法 · 即时呈现 / `powered by tyme4ts + lunisolar` |
| **旁白(zh) · v1.5** | "一张八字排盘,从公历直接算到神煞,全部在浏览器里实时呈现。**看不懂没关系——接下来,我们交给 AI 解读。**" |
| **字幕 · v1.5** | 八字四柱 · 公历直转干支 · 神煞速算 / 看不懂没关系——接下来交给 AI |
| **配音语气** | 平静中带引导;前半节奏沉稳,后半"看不懂没关系"语气放轻,引出 hook;为整片埋下"AI 是亮点"的种子 |

### S3 · 00:21–00:29 · 古籍考据 (8s)

| 项 | 内容 |
|---|---|
| **视觉** | 转场到深棕宣纸底,**4 张仿古籍页面**从右往左横向滑动展示(每张 1.5s),每张含:**竖排篆字标题** + 配文 + 朱文方印 + 右下"卷之*"页码标 |
| **4 张古籍页面** | ① 《三命通会》·"日主旺衰" / ② 《袁天罡称骨歌》·"四两二钱" / ③ 《周公解梦》·"梦见之卷" / ④ 《观音灵签》·"第一签 上上" |
| **动效** | 每张古籍页面 `translateX(-100vw → 0 → 100vw)` 横向滑过,中间停留 0.6s;朱文印章在停留瞬间盖下(`scale 1.5→1.0` + `opacity`) |
| **屏上文字** | 真实算法 · 古籍可考 / 《三命通会》《袁天罡称骨歌》《周公解梦》《观音灵签》 |
| **旁白(zh)** | "每一个算法、每一首签诗、每一条解梦词条,都能对应到古籍原文——**一切有迹可循,皆可逐字溯源**。" |
| **字幕** | 每一行算法 · 每一首签诗 · 皆有古籍出处 / 一切有迹可循 · 可逐字溯源 |
| **配音语气** | 郑重,有"摆事实"的力量,语速稍慢 |

### S4 · 00:29–00:40 · 8 大模块矩阵 (11s)

| 项 | 内容 |
|---|---|
| **视觉** | 米黄底 + 8 张模块卡 4×2 网格依次飞入(每张 0.35s),每张含模块图标 + 模块名 + 副标 + **新增**:底部一行等宽字体"核心库标签"(蓝灰色,代码风) |
| **动效** | 同上一版,逐张入场 |
| **8 张卡的核心库标签** | 八字 → `tyme4ts + lunisolar` / 紫微 → `iztro` / 小六壬 → `pure logic` / 称骨 → `static rules` / 灵签 → `100 poems json` / 姓名 → `chinese-character-strokes` / 黄历 → `tyme4ts almanac` / 解梦 → `Fuse.js search` |
| **屏上文字** | 八门齐开 · 八种算法 |
| **旁白(zh)** | "8 大模块,8 种算法实现:有的来自经典开源库,有的是规则化的纯逻辑,有的是百签全集 + 模糊搜索——总之,看得见、查得到、跑得通。" |
| **字幕** | 8 大模块 · 8 种算法实现 / 看得见 · 查得到 · 跑得通 |
| **配音语气** | 利落、节奏感强,排比三短句重音递进 |

### S4b · 00:40–00:50 · 真实产品页轮播 (10s)

| 项 | 内容 |
|---|---|
| **视觉** | 米黄底 + 一个模拟浏览器窗口(顶部红黄绿+ URL 栏 `https://shetengteng.github.io/tt-qimen/`)→ 窗口内**真实截取的 5 张产品页 PNG** 依次以 crossfade + 轻微放大方式轮播,每张 2.2 秒;窗口下方一颗朱砂红色 chip 标签,实时显示当前展示的模块名 |
| **5 张幻灯** | ① 首页 · Home → ② 八字命盘 · Bazi → ③ 紫微斗数 · Ziwei → ④ 老黄历择日 · Almanac → ⑤ AI 设置 · Settings |
| **动效** | `opacity 0→1` + `transform: scale(1.04→1.0)`(Ken Burns 风);每次切换 chip 用 reflow 触发"弹一下"效果 |
| **屏上文字 · v1.5** | 八门 · 七法 · 立等可现 / EIGHT MODULES · SEVEN ARTS · INSTANT READING / 首页 / 八字 / 紫微 / 黄历 / AI 设置 |
| **旁白(zh) · v1.5** | "八门、七法,立等可现:首页、八字、紫微、黄历,还有 AI 配置面板——打开网页就能上手。" |
| **字幕 · v1.5** | 八门 · 七法 · 立等可现 / 首页 · 八字 · 紫微 · 黄历 · AI 设置 |
| **配音语气** | 介绍性、自然、像策展,告别"这就是真实"那种 low 的口播感 |
| **依赖资产** | `promo/v2/assets/app-home.png` / `app-bazi.png` / `app-ziwei.png` / `app-huangli.png` / `app-settings.png`(全部 Playwright 实测截自线上 GitHub Pages 部署) |

### S5 · 00:50–01:04 · AI 解读演示(v1.4 改:左半真截图 + 右半真 markdown) (14s)

| 项 | 内容 |
|---|---|
| **视觉** | **左半改造**:不再是 mock 4 柱,而是一张**带浏览器壳**(三色圆点 + URL `github.io/tt-qimen/#/bazi?year=1994&month=4&day=20…`)的**真实排盘页面截图**(`app-bazi-result.png`,Playwright 实测自带 query 自动 hydrate 排盘的页面),右上叠一枚朱砂红角标 `真实排盘 · LIVE`;**右半**保持 8 家 Provider chip + BYOK 行,但 AI 流式输出改为**4 块逐段揭示**的真实 markdown 排版(`## 标题` + 列表 + `> 引用` + 免责声明),完全贴近 `src/composables/ai/systemPrompts.ts` 中 bazi framework 的规范输出 |
| **动效** | 左半:`fadeIn`(0.7s, delay 0.1s);右半:从 1.8s 起按 1.8s / 3.2s / 5.0s / 7.4s / 9.2s 分 5 个时刻依次追加 markdown 块,末尾保留朱砂红光标闪烁直至最后一块入场;chip 区从 51.5s 起按 1.2s 间隔依次 flash 一家厂商 |
| **屏上文字(右半 markdown 块)** | 见下方"AI 解读真实文本" |
| **AI 解读真实文本(对应左半截图中的命例:男 · 1994-04-20 09:00 · 丙火日主)** | **## 命盘总览** 男命,公历 1994-04-20 09:00,丙火日主生于辰月(湿土晦火)。 / **## 日主与格局** 身弱偏印格——日干丙火生季春,辰月戊土食神当令,水势暗旺,丙火失令而又被湿土晦其光,整体偏弱。 / **## 五行喜忌** · 喜:木火(印星生身、比劫助身) · 忌:水土过旺(子辰半合水局,防晦火) · 用神:甲木偏印(年柱透干,清气可用) / **## 神煞速览** > 戌辰相冲 — 主动荡迁徙;癸水正官透时,利文职、研究类岗位。 / *以上仅为传统命理参考,不构成医学/法律/投资建议。* |
| **旁白(zh) · v1.5** | "左边是真实排好的命盘,右边接上 AI。**再复杂的命盘,一键就能读懂**——OpenAI、Claude、Gemini、DeepSeek……你想用哪家,就配哪家的 Key,数据直接发到模型官方,不经过任何中转。" |
| **字幕(3 行) · v1.5** | 左侧真实排盘 · 右侧接上 AI / 复杂命盘 · 一键读懂 / 8 家主流大模型 · 你的 Key · 直连官方 |
| **配音语气** | 自信、克制;"复杂命盘、一键读懂"是全片最重要的核心 hook,需咬字清晰、加重、后停 0.5s 让观众消化 |
| **依赖资产** | `promo/v2/assets/app-bazi-result.png`(Playwright 截自 `https://shetengteng.github.io/tt-qimen/#/bazi?year=1994&month=4&day=20&hour=9&minute=0&calendar=solar&gender=male`,国风主题) |

### S6 · 01:04–01:14 · 双主题(v1.3 改:真截图) (10s)

| 项 | 内容 |
|---|---|
| **视觉** | 屏幕左右对开 clip-path,**左侧国风主题真截图**(`theme-guofeng.png`,Playwright 实测自线上)+ 朱砂红角徽 `国风 · Guofeng`;**右侧简约主题真截图**(`theme-minimal.png`,同一首页 URL,localStorage 切换主题后再截)+ 紫色角徽 `简约 · Minimal`;中央竖向朱砂-紫色渐变分隔线;右上仍保留 CSS Token 代码窗,显示 `--primary: #c23a2a` ⇄ `#3b2f63` 切换 |
| **依赖资产** | `promo/v2/assets/theme-guofeng.png` / `theme-minimal.png`(Playwright + `addInitScript` 注入 `localStorage['tt-qimen:theme']` 后访问 `https://shetengteng.github.io/tt-qimen/`,1280×800 @ 2x dpr 截图) |
| **动效** | 中央渐变线扫过 + 左右两侧同步切换;右上代码窗内 CSS 值用 `crossfade` 切换 |
| **屏上文字 · v1.5** | 国风 ⇄ 简约 / 同一份内容 · 两种气质 |
| **旁白(zh) · v1.5** | "国风、简约两套主题,一键切换。同一份内容,两种气质。" |
| **字幕 · v1.5** | 国风 ⇄ 简约 · 一键切换 / 同一份内容 · 两种气质 |
| **配音语气** | 优雅,带点设计师式的克制;不堆术语,留给观众用眼睛比对左右两张截图 |

### S7 · 01:14–01:24 · 三种形态(v1.4 改:真截图 × 3) (10s)

| 项 | 内容 |
|---|---|
| **视觉** | **顶部主标** "一份代码 · 三种形态"(衬线大字)+ 副标 `WEB · macOS · WINDOWS · 同一份 Vue 3 SPA · Tauri 2 桌面外壳`(等宽小字);下方三个窗口外壳依次排开:① **Web** 窗口(浏览器壳 + URL bar `https://shetengteng.github.io/tt-qimen/`)→ ② **macOS** 窗口(三色 traffic light + `tt-qimen.app` 标题)→ ③ **Windows** 窗口(原生标题栏 + `— ▢ ×` 控件);**每个窗口内嵌入同一张 `app-home.png` 真截图**,演示"一份代码三种壳层";每个窗口底部居中浮一枚平台特征标签:`Web · GitHub Pages` / `macOS · Tauri 2 · .dmg` / `Windows · Tauri 2 · .msi`;最下一行技术 pill:`Same source · Vue 3 SPA` / `Desktop wrapper · Tauri 2` / `Web 立即可用 · 桌面端 完全离线` + 绿色 `✓ OFFLINE READY` 角标 |
| **动效** | 顶部主标 `fadeUp`(0.7s, delay 0);三个窗口依次以 0.35s 间隔 `fadeUp` 入场(0.2 / 0.55 / 0.9 s);最下技术行整体 `fadeUp`(0.7s, delay 1.5s) |
| **屏上文字 · v1.5** | 一份内容 · 三处可用 / Web · macOS · Windows / 三个平台特征标签(Web · 无需安装 / macOS · 桌面端 · 离线可用 / Windows · 桌面端 · 离线可用)/ 三条技术 pill(浏览器打开 · 立等可用 / 桌面端 · 完全离线 / 三处页面 · 体验一致)+ offline 角标 |
| **旁白(zh) · v1.5** | "浏览器打开就能用,无需安装;macOS 和 Windows 也提供桌面端,完全离线可用。三个窗口里,是同一份内容、同一套体验——一份内容,三处可用。" |
| **字幕(2 行) · v1.5** | 浏览器打开就用 · macOS 与 Windows 也有桌面端 / 同一份内容 · 三处可用 · 桌面端完全离线 |
| **配音语气** | 干脆、信息密集型;"无需安装" / "完全离线可用" / "一份内容,三处可用"三处加重 |
| **依赖资产** | `promo/v2/assets/app-home.png`(已存在,三个窗口共用) |

### S8 · 01:24–01:34 · 隐私本地 (10s)

| 项 | 内容 |
|---|---|
| **视觉** | 同上一版隐私镜头(笔记本 + 四角云端服务被划掉),但底部新增三个并排"工程化承诺"卡片:① 零后端(无 server 仓库)② API Key 仅存 localStorage(可在 DevTools 验证)③ 网络面板可见 AI 请求直连官方域名 |
| **动效** | 同上一版 |
| **屏上文字 · v1.5** | 零后端 / 没有任何服务器收集你的数据 / AI 请求直连模型官方域名 |
| **旁白(zh) · v1.5** | "项目没有任何后端——也就没有服务器能收集你的数据。所有信息,始终留在你自己的浏览器里。" |
| **字幕 · v1.5** | 没有后端 · 也就没有数据收集 / 所有数据 · 始终在你自己浏览器里 |
| **配音语气** | 郑重,带点"我们经得起检验"的自信 |

### S9 · 01:34–01:46 · 核心技术栈墙 (12s)

| 项 | 内容 |
|---|---|
| **视觉** | 深棕底 → **13 个技术 logo + 标签**呈"星空"散落布局,每个标签由 logo 文字 +技术名构成,**依次以"打字机 + 高亮"方式逐个点亮**:Vue 3 / Vite 5 / TypeScript 5.5 / Tailwind v4 / shadcn-vue / Pinia 2 / Vue Router 4 / vue-i18n 9 / tyme4ts / iztro / lunisolar / Tauri 2 / 8 家 LLM SDK |
| **动效** | 每个标签 `opacity 0→1` + `scale 0.9→1.0`,逐个点亮(每 0.8s 一个);最后整体微微缩放 + 高光环绕 |
| **屏上文字(13 个技术标签)** | Vue 3 / Vite 5 / TypeScript / Tailwind v4 / shadcn-vue / Pinia / Vue Router / vue-i18n / tyme4ts / iztro / lunisolar / Tauri 2 / 8 家 LLM SDK |
| **旁白(zh) · v1.5** | "历法、紫微、桌面、AI,各自挑选社区里口碑最好的开源方案——该用的,都用了。"(屏上仍展示 13 个 logo 让观众自行 mapping,但解说不再"报菜名") |
| **字幕 · v1.5** | 现代前端技术栈 · 全部开源 / 历法、紫微、桌面、AI 各自挑选社区里的最优解 |
| **配音语气** | 像策展人介绍展品 · 节奏明快;屏上技术 logo 自己说话,旁白不再重复 |

### ~~S10 · GitHub 仓库页~~(v1.3 已挪到首位作 S0,本段删除)

| 项 | 内容 |
|---|---|
| **视觉** | 顶部一条模拟浏览器地址栏(macOS 红黄绿 + URL `github.com/shetengteng/tt-qimen`) → 主区域显示 **真实截取** 的 GitHub 仓库页 PNG → **前 4 秒**:5 个朱砂红圈标注依次浮现,分别圈出:仓库主页 / ⭐ Star · Fork · Watch 按钮 / About 简介 / Topics 技术标签 / README 完整文档 → **后 5 秒**:截图自动向下滚动展示完整 README 内容 → 右上角悬浮"Public · MIT · Open Source"红色 chip |
| **动效** | 截图淡入(0.4s);5 个标注每 0.4s 出现一个(总共 2 秒);scale + opacity 同步;在 4.5 秒处截图开始向下平滑滚动(translateY 0 → -65%,持续 4.5s);右上角 chip 在 2.4 秒处带轻微旋转浮现 |
| **屏上文字** | github.com/shetengteng/tt-qimen / 仓库主页 / ⭐ Star · Fork · Watch / About · 项目简介 / Topics · 技术标签 / README · 完整文档 / Public · MIT · Open Source |
| **旁白(zh)** | "这就是完整项目的 GitHub 仓库:README 详尽、Topics 清晰、Issues 与 Pull Request 通道开放,MIT License,欢迎一切代码贡献。" |
| **字幕** | 完整项目 · 开源在 GitHub / README · Topics · Issues · MIT License · 一应俱全 |
| **配音语气** | 介绍性、清晰、节奏稳,像在引导观众"看,这就是项目的 GitHub 页" |
| **依赖资产** | `promo/v2/assets/github-repo.png`(1440 × 8668,通过 Playwright 截取自真实 GitHub 仓库页) |
| **v1.2 修正** | 5 个朱砂红圈坐标已基于截图实测重新计算(About 卡用 Playwright 取到了真实 boundingBox = `top=190px, left=1056px, w=272px, h=412px`,其余基于该锚点几何法推算),全部使用 `vw` 单位避免响应式失真 |

### S10 · 01:46–01:56 · 项目设计思路(v1.4 新增) (10s)

| 项 | 内容 |
|---|---|
| **视觉** | 米黄底,顶部主标 "项目设计思路"(衬线大字)+ 副标 `ARCHITECTURE · DATA FLOW · DESIGN PRINCIPLES`(等宽小字);**主区**左侧 4 层架构图自上而下逐层入场:① UI Layer(Vue 3 + shadcn-vue + Tailwind v4 + 双主题)→ ② Application Layer(Vue Router + Pinia + 8 大模块 + i18n)→ ③ Domain Core(tyme4ts / lunisolar / iztro / 规则引擎 / 古籍数据集)→ ④ AI Layer · BYOK(OpenAI / Claude / Gemini / DeepSeek / +4 家),层间有朱砂红虚线箭头连接;**主区右侧**一张虚线边框的 aside 卡 `设计原则`,列 4 条:`01 浏览器优先 02 零后端 03 一切可溯源 04 AI 可插拔` |
| **动效** | 主标 `fadeUp`(0.6s);4 层 chip 卡片依次以 1.2s 间隔 `fadeUp` 入场(0.3 / 1.5 / 2.7 / 3.9 s);3 个层间箭头依次以 1.2s 间隔从短虚线长出(1.1 / 2.3 / 3.5 s);右侧 aside 卡在 4.5s 时从右侧 `translateX(20px)` 滑入 |
| **屏上文字** | 项目设计思路 / ARCHITECTURE · DATA FLOW · DESIGN PRINCIPLES / 4 层 chip 名 + 4 条设计原则 |
| **旁白(zh) · v1.5** | "整个项目只做四件事:渲染页面、组织数据、跑算法、接入 AI。然后只守四条原则——浏览器优先、零后端、一切可溯源、AI 可插拔。" |
| **字幕(2 行) · v1.5** | 一个项目 · 四件事:页面 · 数据 · 算法 · AI / 浏览器优先 · 零后端 · 一切可溯源 · AI 可插拔 |
| **配音语气** | 介绍性、节奏稳;说"四件事"时手势感强;4 件事/4 原则各停 0.15s |

### S11 · 01:56–02:00 · CTA (4s)

| 项 | 内容 |
|---|---|
| **视觉** | 黑底中央朱砂"启"Logo 浮现 → 下方依次出现:`git clone` 命令(终端窗 typewriter)/ ⭐ Star 按钮(模拟 GitHub 样式)/ MIT License 角标 |
| **动效** | Logo 浮现 → 命令行 typewriter 效果 → Star 按钮"按一下"动画(`scale 1.05→1.0`)→ 整体 fade-in |
| **屏上文字** | `git clone https://github.com/shetengteng/tt-qimen.git` / ⭐ Star · shetengteng/tt-qimen · 1.2k / github.com/shetengteng/tt-qimen · MIT License |
| **旁白(zh) · v1.5** | "GitHub 搜索 tt-qimen,Star 它、Clone 它、贡献它——也欢迎 fork 一个属于你自己的版本。" |
| **字幕 · v1.5** | git clone · Star · Contribute · 一切尽在 GitHub |
| **配音语气** | 收束,带邀请感,最后一字略拖 |

---

## 与"普通用户版"的差异速查表

| 镜头位置 | 普通版 | 开发者版 |
|---|---|---|
| 开场 | "古人问天,今人问己" | "为占卜,造一台严肃的浏览器" |
| 第 2 镜头 | 12 个 App 散乱抖动(痛点) | **直接展示八字排盘 demo + tyme4ts 角标** |
| 古籍考据 | (无) | **新增 S3 整段:4 本古籍仿古页面** |
| 模块卡 | 模块名 + 副标 | **+ 每张底部核心库标签** |
| AI 镜头 | 命理学硬核解读语 | 改为通俗解读 + BYOK 工程化标签 |
| 双主题 | 视觉对比为主 | **+ 真截图 × 2(国风 / 简约)** |
| 桌面端 | "同一份代码" | **+ 三个窗口 × 真截图 + 离线 ready 角标** |
| 隐私 | "你的命盘 你的设备 你的隐私" | **+ "所有数据始终在你浏览器里"承诺** |
| 技术栈 | (无) | **新增 S9 整段:13 个技术 logo 星空** |
| CTA | 在线访问 URL | **git clone + Star + MIT License** |

---

## 交付清单

| 文件 | 用途 |
|---|---|
| `promo/script-dev.md` | 本文件 |
| `promo/subtitles-dev.srt` | 标准 SRT 字幕 |
| `promo/voiceover-dev.md` | TTS 配音文案 |
| `promo/storyboard-dev.html` | 可在浏览器自播的动画分镜页 |
