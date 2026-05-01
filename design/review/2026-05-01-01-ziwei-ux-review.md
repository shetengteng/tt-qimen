# 紫微页面 UI/UX 审查报告

| 项 | 值 |
|---|---|
| 评估日期 | 2026-05-01 |
| 评审对象 | `/ziwei` 路由(国风 guofeng + 简约 minimal 双主题) |
| 测试视口 | 1440×900(桌面) / 390×844(iPhone 14) |
| 测试用例 | 1990-06-15 已时 男(中等数据量,有借宫、四化、三方四正连线) |
| 截图存档 | `.cursor/ux-review-2026-05-01/ziwei-*.png` |
| 评审工具 | Playwright(真实截图) + ui-ux-pro-max(设计基准) + 静态代码分析 |
| 综合评价 | **B+ / 7.5 分(满分 10)** |

> 视觉设计水准高,信息架构完整,主题对偶用心。但**首屏视觉权重失衡**、**信息密度过载**、**断点不一致**等几个高价值问题影响第一印象与扫描效率。

---

## 一、最高优先级问题(P0 — 强烈建议修)

### P0-1 · 1440 桌面端「结果区」首屏完全被 BirthForm 占据,紫微盘看不到

**问题**:用户用 deeplink 打开排盘结果页,首屏 1440×900 视口里只看到「录入生辰」表单,要往下滚才能看到主结果(紫微盘)。

**证据**:`ziwei-guofeng-1440.png` 全页截图,前 1 屏全是表单。

**根因**:`ZiweiPage.vue` 把 BirthForm 放在 `.gf-container` 的第一个位置,即使有 `chart` 数据,form 仍占据视口顶端。

**影响**:用户重访 / 分享链接打开时,**第一眼看不到结果**,需要主动滚动,违反「重要内容置于首屏」的原则。

**修复建议**(选一,强度递增):
- A. 排盘成功后,自动 scroll 到 ResultBanner(已有 `resultBannerEl` ref,只需 `nextTick` + `scrollIntoView({behavior:'smooth'})`)
- B. 出结果后把 BirthForm 折叠成一行 chip,点开才展开(节省首屏空间)
- C. 结果页布局:left=BirthForm sticky 边栏(280px)+ right=结果区(主视图)。仅 ≥1024px 启用,移动端保留单列

### P0-2 · 移动端 390 紫微盘字号小到极限,部分宫位星名几乎不可读

**证据**:`ziwei-minimal-390-chart.png`、`ziwei-guofeng-390.png`(切到下半段)

**根因**:`ziwei.css:384, 410` `.star { font-size: 10px }`,在密度高的宫位(如「事业宫:天梁/文昌」「迁移宫:天钺/陀罗」)星名加亮度标记 + 四化标记后,信息密度极高

**影响**:核心数据可读性差,用户必须放大才能看清

**修复建议**(选一):
- A. 默认让单宫**点击放大**进入详情卡(已有 `palace-grid` 结构,新增 `tap-to-zoom`)
- B. 移动端引入「单宫聚焦模式」开关,选中一个宫后只显示该宫的大字版
- C. **最简**:`@media max-width: 480px` 把 `.palace` 改为可水平 swipe 的 carousel(每屏 2-3 宫位)

### P0-3 · 响应式断点不一致(720 / 768 混用)

**证据**:`guofeng/ziwei.css` 用了 `720px`(11 处)和 `768px`(2 处);`minimal/ziwei.css` 同样混用。

**根因**:不同子模块独立写 media query,无统一断点 token。

**影响**:在 720-768px 之间的 iPad mini 竖屏 / 折叠屏会出现「中宫已经叠上去但解读卡还是双栏」之类的视觉断层。

**修复建议**:把所有 `720px / 768px` 统一成 **`768px`**(行业标准 tablet 断点),并提取为 CSS 变量 `--bp-md: 768px`。预计影响 13 处规则,改动安全(只是合并断点)。

---

## 二、高优先级问题(P1 — 建议修)

### P1-1 · CollapsibleSection 默认全展开,信息过载

**证据**:1440 全页图垂直滚动 **5+ 屏**,7 个区段同时展开。用户面对未读完的命宫主星 + 十二宫 + 六吉六煞 + 四化 + 命主身主 + 大限 + 流年,**认知负担极高**。

**修复建议**:
- 默认仅展开「命宫主星论命」+「十二宫盘」两段(二者是核心)
- 其余 5 段默认折叠,标签上显示「展开」提示
- 加「全部展开 / 全部收起」总控

### P1-2 · 1440 桌面端 max-width: 1200px 太窄,大量留白浪费

**证据**:`ziwei-guofeng-1440-chart.png` 紫微盘左右各有约 ~140px 空白。

**根因**:几乎所有子组件都写死 `max-width: 1200px`(`ziwei.css:99, 446, 570, 747, 953, 1030, 1470, 1635...` 共 12+ 处)

**影响**:在 1440 / 1920 显示器上视觉权重不够,紫微盘星名仍偏小

**修复建议**:`max-width` 改成**流式 + 上限**:`width: min(96vw, 1400px)` 或者用 `clamp(960px, 90vw, 1400px)`。1200px 是 2014 年标准,2026 年应至少 1400-1440px。

### P1-3 · 「关闭连线」/「显示 / 隐藏未来流年」按钮 touch target 不够 44×44

**证据**:`ziwei-minimal-1440.png` 顶部右上角的「关闭连线」按钮约 90×30,高度 30px <44px(WCAG / Apple HIG 推荐 44px 触摸目标)

**修复建议**:`.sanfang-toggle / .ziwei-flowyear-toggle { min-height: 44px; padding: 10px 16px; }`

### P1-4 · 解读卡 `text-align: justify` + `text-indent: 2em` 在窄屏出现「字距夸张」

**证据**:`ziwei-soul-palace__text` 等样式(`ziwei.css:495-503`)

**问题**:中文 justify 在 360-400px 窄屏下,每行 8-10 字,justify 会拉出极大的字间距;`text-indent: 2em` ≈ 28px,占用 1/3 行宽

**修复建议**:移动端关掉 justify 改用 `text-align: left`,首行缩进改用 `text-indent: 1em`

### P1-5 · 用 Unicode 装饰符 `◈ ◆ ◉` 充当 icon

**证据**:`ZiweiPage.vue:263, 324`:`◈ {{ t('ziwei.computeError.title') }}`,`◆ {{ t('ziwei.daxian.title') }} ◆`

**问题**:这些字符在不同字体下渲染差异大、不可缩放、不能换色

**修复建议**:换成 SVG icon(`lucide-vue-next` 已在依赖里),或纯 CSS 装饰(`::before` 加细线)

---

## 三、中优先级问题(P2)

| ID | 问题 | 文件:行 | 建议 |
|---|---|---|---|
| P2-1 | `transition: all 0.3s` 性能差 | `ziwei.css:1082` | 改 `transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s` |
| P2-2 | 移动端 `.star` 用 `text-overflow: ellipsis` 截断信息 | `ziwei.css:388-392` | 改 `white-space: normal` + 略增 `min-height`,允许 2 行 |
| P2-3 | 多色并用,移动端小字下对比度未验证 | `tokens.css` | 跑 axe-core 验证 4.5:1 |
| P2-4 | ZiweiMeta 在 1440 横向 wrap 容易出现「左大右挤」 | `ziwei.css:7-19` | 改 grid `grid-template-columns: auto auto`,锁定列宽 |
| P2-5 | 命盘中宫文案密集 | `ZiweiMeta` | 拆 chip 化展示,或用 `<dl>` + `dt/dd` |
| P2-6 | `.ziwei-daxian-cell` 有 `:hover transform: translateY(-2px)` 暗示可点,实际**不可点** | `DaxianGrid.vue` | 要么去掉 hover transform,要么真的实现点击展开详情 |

---

## 四、低优先级 / 增强建议(P3)

1. **暗黑模式**:两个主题都没看到 `prefers-color-scheme: dark` 的对应。如未来要做,建议 minimal 优先,guofeng 暗色定制更复杂
2. **`prefers-reduced-motion`**:`useSkeletonReveal` 动画、三方四正 `transition: opacity 0.3s` 都没考虑此 media query
3. **打印样式**:命盘是用户会想打印或截图保存的内容,值得加 `@media print` 隐藏 nav/footer/AI 按钮
4. **i18n bug**:截图里看到「设置」按钮的 aria-label 是 `settings.title`(裸 key),不是「设置」,说明 settings 模块的 i18n 在某些情况下没有按预期加载
5. **信息架构**:9 个 section,建议引入 **tab/anchor 导航**(右侧浮动 TOC,点击跳转)

---

## 五、做得好的地方(强烈保留)

| 维度 | 表现 |
|---|---|
| **双主题对偶** | guofeng(朱红/米黄/Kaiti)与 minimal(深紫/灰白/Sans)两套设计语言完整、一致 |
| **颜色系统** | 用 CSS 变量集中管理,易扩展 |
| **三方四正可视化** | SVG 连线 + 宫位高亮 + 中宫提示是亮点,优于市面同类产品 |
| **响应式紫微盘** | 4×4 grid + 移动端字号收缩,保留命理学专业读法 |
| **Loading / Skeleton** | `useSkeletonReveal` 1.5s 延迟揭示 + 滚动到结果 banner,体验细腻 |
| **Share / 截图** | `useShareCard` + 二维码 + 预览对话框,完成度高 |

---

## 六、具体优先修复清单(按 ROI 排序)

| 顺位 | 问题 | 投入 | 收益 |
|---|---|---|---|
| 1 | **P0-1** 排盘后自动 scroll 到结果 banner | 5 行代码 | 解决「重访看不到结果」的 #1 体验问题 |
| 2 | **P1-1** CollapsibleSection 默认折叠 5/7 段 | 改 props | 首屏认知负担直降 60% |
| 3 | **P0-3** 断点统一 720→768 | 全局 replace | 中端屏幕响应一致 |
| 4 | **P1-2** `max-width: 1200 → clamp(960, 90vw, 1400)` | 全文件 replace | 1440+ 屏视觉权重提升 |
| 5 | **P1-3** Touch target ≥44px | min-height 设置 | 移动端 a11y 合规 |
