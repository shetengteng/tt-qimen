---
title: 神煞文案 · 摘录
fetched_at: 2026-04-20
status: 原文已定位；已有 @lunisolar/plugin-char8ex 提供名称，长说明需自写
target_field: src/modules/bazi/data/shenshaMeaning.ts（未来扩展）
source_primary: 《五行精纪·论神煞》《星学大成·神煞赋》
source_backup: 《三命通会·卷二~卷五·神煞系列》
---

# 神煞文案 · 摘录

## 使用说明

本文件对应**调研文档 § 2.5 神煞说明**（见 `2026-04-20-02-八字神煞现成框架调研.md`）。

## 技术现状

- **名称**：`@lunisolar/plugin-char8ex` 已提供 200+ 神煞的名字 + key，**开箱即用**
- **长说明**：没有 — 需要项目自写

## 原文定位

### 《五行精纪》神煞系列

`raw/wuxing-jingji/full.md`（552 KB，含大量神煞专篇）

该书是宋代廖中编著，以五行与纳音为主，其中**卷二十~卷二十九**集中讨论神煞：
- 卷二十：十二宫神煞
- 卷二十一：三元神煞
- 卷二十二：八字中各类神煞（文昌、华盖、将星、驿马等）
- 卷二十三~二十九：继续细化各神煞的应用

### 《星学大成》神煞专篇

`raw/xingxue-dacheng/full.md`（1.0 MB，共 30 卷）

该书明代万民英编，以星曜神煞为主，覆盖最广：
- 神煞吉凶详论
- 每个神煞的出现方法、应用场合、判词

### 《三命通会》神煞部分

`raw/sanming-tonghui/volume-02.md`（卷二含神煞论述）
`raw/sanming-tonghui/volume-03.md`（卷三神煞论）
`raw/sanming-tonghui/volume-04.md`、`volume-05.md`（神煞逐一论述）

已整理 100+ 神煞名称与位置线索。

## 主要神煞（建议覆盖的 30 种）

按使用频率高到低：

### 吉神（15 种）
1. 天乙贵人
2. 太极贵人
3. 天德贵人
4. 月德贵人
5. 文昌贵人
6. 将星
7. 金舆
8. 天医
9. 禄神
10. 羊刃（中性偏凶）
11. 驿马
12. 华盖
13. 福星贵人
14. 国印
15. 天官

### 凶神（15 种）
1. 桃花（咸池）
2. 亡神
3. 劫煞
4. 孤辰
5. 寡宿
6. 披麻
7. 天狗
8. 白虎
9. 丧门
10. 吊客
11. 元辰
12. 灾煞
13. 勾绞
14. 病符
15. 绞煞

## 字段建议

```typescript
interface ShenshaDef {
  name: string;          // '天乙贵人'
  key: string;           // 'tianYiGuiRen'
  kind: 'ji' | 'xiong' | 'zhong';  // 吉凶中
  position: string[];    // ['日支', '时支']
  brief: string;         // 20 字内，表格徽章用
  long: string;          // 80-120 字，tooltip 用
  origin: string;        // 原文出处，如'三命通会·卷二'
}
```

## 后期步骤（调研文档 § 2.5 所列）

1. 用 `@lunisolar/plugin-char8ex` 的 key 列出 30 个主流神煞
2. 逐一到 `raw/xingxue-dacheng/full.md` 检索对应章节
3. 每个神煞抽取 3-5 句古文精华
4. 白话改写 + 审校

## 状态

**未开工**。
调研文档建议神煞模块列入"中优先级"（排在纳音之后、流年之前）。

- 优先级：纳音 > 格局长解读 > 神煞说明 > 大运扩展 > 流年扩展
