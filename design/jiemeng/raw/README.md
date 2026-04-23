# 周公解梦 · 原始语料池（raw corpus）

> 本目录（`design/jiemeng/raw/`）存放**公版古籍原文**（《周公解梦》、《梦林玄解》等），
> 作为后续结构化 `DreamEntry[]` 的原料。当前 `src/modules/jiemeng/data/dreams.ts`
> 中的 38 条为人工精选手写样本，会保留到数据规模化完成后再统一替换。
>
> 目录约定（与 `design/bazi/` 同构）：
> - `design/jiemeng/raw/`       — 人类编辑的原始语料（本目录）
> - `design/jiemeng/extracted/` — 留作未来提取产物（暂未使用）
> - `src/modules/jiemeng/data/` — 运行时代码（`dreams.ts` 手写 + `dreams.generated.ts` 产出）

## 目录结构

```
raw/
├── README.md              # 本文件（用法 & license 注记）
├── 01-animal.md           # 动物篇原文
├── 02-people.md           # 人物篇原文
├── 03-nature.md           # 自然篇原文
├── 04-body.md             # 身体篇原文
├── 05-life.md             # 生活篇原文
├── 06-ghost.md            # 神怪篇原文
├── 07-building.md         # 建筑篇原文
└── 08-other.md            # 其他篇原文
```

## 文件格式约定

每个 `*.md` 文件内部，每条词条用一个 `### ` 标题块标识，后跟正文 & 元数据：

```markdown
### 梦见蛇

**keywords**: 蛇, 梦见蛇, 蛇咬, 大蛇
**source**: 《周公解梦》公版古籍
**tags**: ambiguous, auspicious, cautious

蛇咬人，主得财。蛇入怀，生贵子。蛇绕腰，主有孕。
```

字段说明：
- `### {title}` — 词条标题（后续 `DreamEntry.title`）
- `**keywords**:` — 逗号分隔的搜索关键词，至少 2 个（含同义词 / 衍生词）
- `**source**:` — 古籍出处（默认"《周公解梦》公版古籍"）
- `**tags**:` — 语气标签，逗号分隔，取值范围：`auspicious` / `cautious` / `ambiguous` / `neutral`
- 正文 — 古籍原文（保留古汉语，不翻译），对应 `DreamEntry.classical`

**说明**：现代解读 `modern[]` 与现代建议 `advice` 不在本目录维护，留给后续
LLM 批次（见 `../../../../../design/todo/16-周公解梦模块.todo.md` T-16.3）。

## 构建流程

1. 编辑本目录下 `NN-{category}.md`，按上述格式追加词条
2. 运行 `node scripts/jiemeng/build-dreams.mjs --dry` 校验格式
3. 人工审校通过后，运行 `node scripts/jiemeng/build-dreams.mjs` 产出
   `src/modules/jiemeng/data/dreams.generated.ts`（当前尚未启用，占位骨架）
4. 最终由 `core/jiemeng.ts` 的 import 入口切换到 generated 文件

## 版权与数据源（License / Sources）

| 资产 | 来源 | 协议 | 备注 |
|------|------|------|------|
| 古籍原文 | 《周公解梦》（传为周公所著，民间托名古籍）| **公有领域** (Public Domain) | 至少自清代以来流传，无现代版权问题 |
| 古籍原文 | 《梦林玄解》（明代 · 何栋如辑）| **公有领域** | 明代文献 |
| 关键词标注 | 本项目编辑团队手工整理 | `MIT`（同项目） | |
| 分类打标 | 对齐传统《周公解梦》分类体系（本项目使用 8 大类）| `MIT`（同项目） | 见 `../categories.ts` |

**不使用**（经 2026-04-23 评估被排除的来源）：

- Hugging Face `hwl985/fortune-telling`：实际为通用命理 QA，**非解梦词典**
- GitHub `ducenand/JieMeng`：仅为爬虫脚本，抓取源 `tools.2345.com` 存在版权风险
- GitHub `leochan2017/zgjm`：主仓库数据被作者移除（仅剩彩蛋 2 条）
- 免费在线 API：项目为纯静态 SPA，运行时禁止联网

决策详见 `design/todo/16-周公解梦模块.todo.md` 附录 A。
