# Jiemeng · Extracted Sources

> 本目录存放从公版古籍 Web 源直接提取并保留原貌的原文，区别于人工结构化的 `design/jiemeng/raw/`。
> Extracted 是**只读原料库**，raw 是已结构化的"待入产线"原料，drafts 是给词条配套的现代解读草稿。
>
> 提取时间：2026-04-24
>
> 原则：
> 1. 不改写原文一字（仅做最小空白规整）
> 2. 来源 URL + 提取时间 + 原文版权状态 必填
> 3. 当前所有来源均为公版（Public Domain）

## 资产清单

| 文件 | 来源 | 状态 | 备注 |
|------|------|------|------|
| `zhougong-wikisource.md` | https://zh.wikisource.org/wiki/周公解夢 | ✅ 完整 | 27 类约 1016 短句断语，繁体 |
| `menglinxuanjie-wikisource.md` | https://zh.wikisource.org/zh-hans/夢林玄解 | ⏸ 缺 | 维基文库录入未完成（仅"叙"+"卷之首"），无可量化词条；如后续补全可加 |

## 衍生关系

```text
extracted/zhougong-wikisource.md  (公版原文 1016 短句)
        │
        ├── 主题聚合 (LLM + 人工)
        │
        ▼
raw/{01-08}-*.md  (130 → 500 条结构化古文 classical)
        │
        ├── 撰写现代解读 (LLM + Codex 审校)
        │
        ▼
drafts/{01-08}-*.md  (130 → 500 条 summary/modern/advice)
        │
        ├── build-dreams.mjs --emit
        │
        ▼
src/modules/jiemeng/data/dreams.generated.ts  (运行时数据)
```

## License

所有 extracted 内容均为 Public Domain 古籍录入。
本目录的整理与文件结构遵循项目 MIT License。
