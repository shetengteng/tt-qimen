# tt-qimen 页面原型 · 模块级线框图索引

> 拆分自 [`../2026-04-18-03-原型图.md`](../2026-04-18-03-原型图.md) 第 4 章
> 拆分日期：2026-04-18
> 目的：按模块组织的线框图，便于单模块联调与 UI 实现对照

## 索引

| # | 文档 | 对应模块 | HTML 原型 |
|---|---|---|---|
| 01 | [`01-home.md`](./01-home.md) | 首页 `HomeView` | `prototypes/{guofeng,minimal}/index.html` |
| 02 | [`02-bazi.md`](./02-bazi.md) | 八字命盘 `BaziView`（大运 + 流年） | `prototypes/{guofeng,minimal}/bazi.html` |
| 03 | [`03-liuren.md`](./03-liuren.md) | 小六壬 `LiurenView` | `prototypes/{guofeng,minimal}/liuren.html` |
| 04 | [`04-chenggu.md`](./04-chenggu.md) | 称骨算命 `ChengguView` | `prototypes/{guofeng,minimal}/chenggu.html` |
| 05 | [`05-lingqian.md`](./05-lingqian.md) | 观音灵签 `LingqianView` | `prototypes/{guofeng,minimal}/lingqian.html` |
| 06 | [`06-xingming.md`](./06-xingming.md) | 姓名学 `XingmingView` | `prototypes/{guofeng,minimal}/xingming.html` |
| 07 | [`07-zeri.md`](./07-zeri.md) | 黄历择日 `ZeriView` | `prototypes/{guofeng,minimal}/huangli.html` |
| 08 | [`08-jiemeng.md`](./08-jiemeng.md) | 周公解梦 `JiemengView` | `prototypes/{guofeng,minimal}/jiemeng.html` |
| 09 | [`09-ziwei.md`](./09-ziwei.md) | 紫微斗数 `ZiweiView`（命理双擎之二） | `prototypes/{guofeng,minimal}/ziwei.html` |

## 阅读顺序建议

1. 先阅读主文档 [`../2026-04-18-03-原型图.md`](../2026-04-18-03-原型图.md) 的第 1~3 章（断点、全局元素、复用组件）
2. 再根据实现任务跳转到对应模块的子文档
3. 对照 `prototypes/` 下同名 HTML，UI 实现即可做到 1:1 还原

## 维护原则

- **子文档只承载线框图和模块级说明**：不重复基础约定、组件库、交互细节
- **共性约束**（响应式折叠、关键交互）仍在主文档第 5~6 章
- 新增模块请：新增 `wireframes/XX-xxx.md` + 同步主文档 §4.X + 在本 README 登记
