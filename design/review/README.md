# UI/UX 全模块审查总览(2026-05-01)

| 项 | 值 |
|---|---|
| 评审日期 | 2026-05-01 |
| 评审范围 | 全部 7 个核心模块(紫微 / 八字 / 称骨 / 灵签 / 姓名 / 黄历 / 解梦) |
| 评审方法 | Playwright 真实截图(4 张/模块 × 7 模块 = 28 张)+ 静态代码分析 + ui-ux-pro-max 设计基准 |
| 测试视口 | 1440×900(桌面)+ 390×844(iPhone 14 移动) |
| 测试主题 | 国风(guofeng)+ 简约(minimal) |

---

## 一、模块评分总览

| # | 模块 | 评分 | 报告 |
|---|---|---|---|
| 01 | 紫微斗数 | B+ / 7.5 | [01-ziwei-ux-review.md](./2026-05-01-01-ziwei-ux-review.md) |
| 02 | 八字命盘 | B+ / 7.5 | [02-bazi-ux-review.md](./2026-05-01-02-bazi-ux-review.md) |
| 03 | 称骨算命 | A- / 8.5 | [03-chenggu-ux-review.md](./2026-05-01-03-chenggu-ux-review.md) |
| 04 | 观音灵签 | A- / 8.0 | [04-lingqian-ux-review.md](./2026-05-01-04-lingqian-ux-review.md) |
| 05 | 姓名学(五格) | A- / 8.0 | [05-xingming-ux-review.md](./2026-05-01-05-xingming-ux-review.md) |
| 06 | 老黄历(择日) | A / 8.5 | [06-huangli-ux-review.md](./2026-05-01-06-huangli-ux-review.md) |
| 07 | 周公解梦 | A / 8.5 | [07-jiemeng-ux-review.md](./2026-05-01-07-jiemeng-ux-review.md) |

**整体平均**:**8.07 / 10(B+ 区间偏高)**

> 设计完成度高,主题对偶用心,响应式可用,信息架构合理。提升空间集中在「桌面端宽度利用」「移动端骨架屏交互」「新手友好性」三大方向。

---

## 二、跨模块共性问题(优先级最高 ROI)

下面 5 个问题影响 ≥3 个模块,**优先修这些可获得最大整体收益**:

### 共性 P0-A · 1440 桌面端整体宽度利用低(影响:全部 7 模块)

**现象**:几乎所有页面在 1440 视口下,内容只占约 **42-55%** 屏宽,左右各有 200-320px 留白。

**根因**:
- 全局 `max-width: 1080px` / `1200px` 类约束写在多个 `themes/*/components/*.css`
- 子组件再次 `max-width: 720-960px`,叠加后内容更窄

**统一修复方案**:
```css
.gf-container, .min-container {
  width: min(94vw, 1280px);
  margin: 0 auto;
}
```
+ 各子组件 `max-width` 改为 `width: 100%`,只在最外层一处控制。

**预计影响**:每个模块可见信息密度提升 ~40-100%。

### 共性 P0-B · 移动端骨架屏 modal 锁屏(影响:紫微 / 八字 / 称骨)

**现象**:`useSkeletonReveal` 触发的「推演中」/「称骨中」/「排盘中」**绝对居中 modal** 完全遮挡屏幕。

**根因**:`composables/useSkeletonReveal.ts` 默认行为是显示一个 1500ms 的 modal,作为"装饰性等待"。

**统一修复方案**:
- 改 inline skeleton(就地灰色 placeholder card)
- 或减短延迟到 ≤500ms
- 或添加「跳过」按钮 + 减弱遮罩 opacity

**预计影响**:三个模块的移动等待感同时改善。

### 共性 P0-C · 桌面端首屏被 BirthForm 占据,结果在第二屏(影响:紫微 / 八字 / 称骨 / 姓名)

**现象**:用户从 deeplink / 刷新 / 历史回访进入,首屏只看到「录入生辰」表单,需要主动滚动才能看到结果。

**统一修复方案**:
```ts
onMounted(async () => {
  await runCalculate(true)
  await nextTick()
  resultBannerEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})
```

**预计影响**:重访 / 分享场景体验质变。

### 共性 P1-A · 默认全展开 CollapsibleSection 信息过载(影响:紫微 / 八字)

**现象**:多个 CollapsibleSection 默认 open,导致 1440 屏纵向滚 5+ 屏,认知负担极高。

**修复方案**:
- 默认仅展开「核心结果」(命盘 + 主星论命 / 四柱表 + 五行解读)
- 其余段落默认折叠,标签上加「展开 / 收起」hint
- 加「全部展开 / 收起」总控

### 共性 P1-B · `◆ ◈ ◉ ✦ ◎` 等 Unicode 装饰符滥用(影响:全部 7 模块)

**现象**:guofeng 主题大量使用 `◆ ◈ ◉ ✦ ◎` 充当 icon,minimal 主题部分继承。

**问题**:
- 不同字体下渲染差异大
- 不可缩放、不能换色
- a11y 不友好(屏幕阅读器读出 "黑色钻石" 等无意义)

**统一修复方案**:
- 改用 `lucide-vue-next` SVG 图标(已在依赖里)
- 装饰性符号用 CSS `::before` 加细线 / 圆点

---

## 三、跨模块共性「亮点」(必须保留)

| 维度 | 亮点 | 涉及模块 |
|---|---|---|
| **双主题系统** | guofeng / minimal 完整对偶,CSS 变量集中管理 | 全部 7 模块 |
| **deeplink 分享** | URL query 参数化,支持二维码 / 复制链接 | 全部 7 模块 |
| **i18n 完整** | zh-CN / zh-TW / en 三语支持 | 全部 7 模块 |
| **share card 截图** | useShareCard composable 支持下载 / 预览 / 分享 | 紫微 / 八字 / 称骨 / 灵签 / 姓名 / 黄历 |
| **错误回退态** | 八字的 showComputeError 设计避免 fallback 误导 | 八字(可推广到其他) |
| **响应式表现** | 移动端基本可用,无横向滚动,无被裁内容 | 全部 7 模块 |
| **AI 集成入口** | `AskAiButton` + `useAiSidebarStore` 统一接入 | 全部 7 模块 |

---

## 四、优先修复路线图(按 ROI)

### Phase 1(1-2 周,大幅改善整体观感)

1. **共性 P0-A**:全局 `max-width` 释放(影响 7 模块)— 工作量:1 天
2. **共性 P0-B**:`useSkeletonReveal` 改 inline(影响 3 模块)— 工作量:0.5-1 天
3. **共性 P0-C**:排盘后自动 scroll 到结果(影响 4 模块)— 工作量:0.5 天
4. **共性 P1-A**:CollapsibleSection 默认折叠 5/7 段(紫微 + 八字)— 工作量:0.5 天

**Phase 1 完成后预期总分**:**8.07 → 8.6+**

### Phase 2(2-4 周,模块特定优化)

5. 各模块 P0 / P1(详见各报告)
6. 共性 P1-B:Unicode 装饰符替换为 SVG 图标(全模块)— 工作量:2-3 天
7. 断点统一 720→768(影响紫微 + 八字)— 工作量:0.5 天

### Phase 3(增强 / 长期)

8. 暗黑模式(prefers-color-scheme)
9. prefers-reduced-motion
10. 打印样式 @media print(对命盘 / 黄历 等可截图保存的内容)
11. axe-core a11y 全量检查(WCAG 4.5:1 对比度)
12. 社交化功能(收藏 / 历史 / 分享话题)

---

## 五、截图清单

所有截图存档:`.cursor/ux-review-2026-05-01/`

| 模块 | guofeng-1440 | guofeng-390 | minimal-1440 | minimal-390 |
|---|---|---|---|---|
| 紫微 | ziwei-guofeng-1440.png | ziwei-guofeng-390.png | ziwei-minimal-1440.png | ziwei-minimal-390.png |
| 八字 | bazi-guofeng-1440.png | bazi-guofeng-390.png | bazi-minimal-1440.png | bazi-minimal-390.png |
| 称骨 | chenggu-guofeng-1440.png | chenggu-guofeng-390.png | chenggu-minimal-1440.png | chenggu-minimal-390.png |
| 灵签 | lingqian-guofeng-1440.png | lingqian-guofeng-390.png | lingqian-minimal-1440.png | lingqian-minimal-390.png |
| 姓名 | xingming-guofeng-1440.png | xingming-guofeng-390.png | xingming-minimal-1440.png | xingming-minimal-390.png |
| 黄历 | huangli-guofeng-1440.png | huangli-guofeng-390.png | huangli-minimal-1440.png | huangli-minimal-390.png |
| 解梦 | jiemeng-guofeng-1440.png | jiemeng-guofeng-390.png | jiemeng-minimal-1440.png | jiemeng-minimal-390.png |

---

## 六、评审方法说明

每个模块都按以下流程评估:

1. **Deeplink 直达**:用 query 参数构造结果页 URL,模拟用户从分享链接进入(最严苛场景)
2. **真实截图**:Playwright 在 4 个组合(2 主题 × 2 视口)下截全页 PNG
3. **静态代码分析**:读 `themes/{guofeng,minimal}/components/*.css` + `modules/*/Page.vue` + 关键子组件
4. **设计基准对照**:WCAG / Apple HIG / Material Design 触摸目标 / 字号 / 对比度规范
5. **主观评分**:综合考虑首屏价值、信息密度、视觉层次、响应式可用性、a11y、性能、错误处理 7 个维度

每个报告结构统一:
- 综合评价 + 截图位置(metadata 表)
- P0(必修)/ P1(强烈建议)/ P2(建议) 三级问题
- 「做得好的地方」必须列出,避免一味挑刺
- 「优先修复清单(ROI 排序)」给可执行落地建议
