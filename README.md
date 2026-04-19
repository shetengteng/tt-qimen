# tt-qimen

静态问卜站（Static Divination Web）—— 八个核心占卜模块的轻量化实现。
所有计算只在浏览器内完成，**零上传隐私**。

---

## 项目状态

- **设计阶段** ✅ 已完成 8 个模块 × 2 套风格的 HTML 原型 + 完整技术架构方案
- **Sprint 1（骨架）** 🚧 本次交付：Vue 3 + Vite SPA 主框架、主题系统、i18n、路由、状态管理
- **Sprint 2/3（业务模块）** ⏳ 待启动

---

## 核心模块

| # | 模块 | 副标题 |
|---|---|---|
| 01 | 八字 | 四柱推命 · 五行相生 |
| 02 | 紫微斗数 | 十二宫垣 · 三方四正 |
| 03 | 小六壬 | 掐指一算 · 应事即时 |
| 04 | 称骨论命 | 袁天罡之诀 · 一斤一两 |
| 05 | 灵签问卜 | 虔诚一念 · 神明指引 |
| 06 | 姓名学 | 五格剖象 · 三才配置 |
| 07 | 老黄历 | 宜忌吉时 · 节气物候 |
| 08 | 周公解梦 | 梦境寻踪 · 心象索解 |

---

## 技术栈

| 类别 | 选型 |
|---|---|
| 框架 | Vue 3 + `<script setup>` + Composition API |
| 构建 | Vite 5 + unplugin-auto-import + unplugin-vue-components |
| 状态 | Pinia |
| 路由 | Vue Router 4（hash 模式，纯静态托管友好） |
| i18n | vue-i18n 9（按需懒加载语言包） |
| 工具库 | `@vueuse/core` + `@vueuse/router` |
| 类型 | TypeScript 严格模式 |
| 农历 | lunar-typescript |

---

## 目录结构

```
tt-qimen/
├── design/                       设计文档与原型
│   ├── 2026-04-18-01-可行性分析.md
│   ├── 2026-04-18-02-方案设计.md
│   ├── 2026-04-18-03-原型图.md
│   ├── 2026-04-18-04-技术架构.md  <-- 完整架构方案
│   └── prototypes/{guofeng,minimal}/*.html
├── src/
│   ├── main.ts                   入口
│   ├── App.vue                   根组件
│   ├── router/index.ts
│   ├── stores/                   Pinia
│   ├── themes/
│   │   ├── _shared/{contracts,base}.css
│   │   ├── guofeng/{tokens,components,decorations,meta}
│   │   └── minimal/{tokens,components,decorations,meta}
│   ├── locales/
│   │   ├── index.ts              setupI18n + loadLocale
│   │   ├── {zh-CN,zh-TW,en}.ts
│   │   └── divination-terms.{zh-CN,zh-TW,en}.ts
│   ├── composables/{useTheme,useLocale,useUrlSync}.ts
│   ├── components/
│   │   └── layout/{AppHeader,ThemeSwitch,LangSwitch}.vue
│   └── modules/                  8 模块（当前为占位页）
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 多主题 + 多语言

- 主题：`国风 / 简约`（可扩展），URL 参数 `?theme=guofeng|minimal`
- 语言：`简体 / 繁体 / 英文`（中文默认编译进主包，其余懒加载），URL 参数 `?lang=zh-CN|zh-TW|en`
- 优先级：URL > localStorage > `navigator.language` > zh-CN 兜底
- 切换均无刷新；语义变量契约见 [`src/themes/_shared/contracts.css`](src/themes/_shared/contracts.css)
- 完整设计：[`design/2026-04-18-04-技术架构.md`](design/2026-04-18-04-技术架构.md)

---

## 启动

```bash
pnpm install
pnpm dev          # http://localhost:5180
pnpm build        # 产出 dist/
pnpm preview
```

## 测试链接（本地启动后）

| 主题 × 语言 | URL |
|---|---|
| 国风 / 简体 | http://localhost:5180/#/?theme=guofeng&lang=zh-CN |
| 国风 / 繁体 | http://localhost:5180/#/?theme=guofeng&lang=zh-TW |
| 简约 / 英文 | http://localhost:5180/#/?theme=minimal&lang=en |

---

## 原型仓库（保留）

`design/prototypes/{guofeng,minimal}/*.html` 仍为视觉与文案的真理源（设计 review 用），与 Vue 端共存直至 Sprint 2/3 全部迁移完成。
