# tt-qimen · 启门问卜

[简体中文](./README.md) · [English](./README.en.md)

> 一个**纯静态、零后端**的中国传统占卜 Web 应用，覆盖八字 / 紫微斗数 / 小六壬 / 称骨 / 灵签 / 姓名 / 黄历 / 解梦 8 个核心模块，外加可选的 AI 解读侧栏。所有计算在浏览器内完成，**任何隐私数据都不会上传**。

[![Vue](https://img.shields.io/badge/Vue-3.4-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

🌐 **在线访问**：<https://shetengteng.github.io/tt-qimen/>

---

## ✨ 特性

- **8 大占卜模块** —— 全部基于真实民间术数算法（八字四柱 / 紫微 12 宫 + 四化 / 小六壬六宫 / 袁天罡称骨 / 观音灵签 100 签 / 姓名学五格三才 / 老黄历宜忌吉时 / 周公解梦词条搜索），结果可视化呈现
- **AI 智能解读** —— 任意模块结果 / 全局自由咨询；**8 家主流 LLM Provider 任选**（OpenAI / Anthropic / Gemini / xAI / DeepSeek / Qwen / Moonshot / Zhipu）；流式响应；BYOK（自带 API Key，按 Provider 独立保存）；本地持久化对话历史；按命盘指纹隔离会话
- **双主题** —— `国风` / `简约` 两套完整设计语言，URL 参数 `?theme=` 切换
- **三语 i18n** —— 简体中文 / 繁體中文 / English，URL 参数 `?lang=` 切换；零运行时回退警告
- **零后端** —— 所有数据在浏览器本地计算与存储；GitHub Pages 静态托管；用户的 API Key 仅存在 `localStorage`，对话直发当前选中 Provider 的官方 endpoint，本站不收任何数据
- **响应式 + 无障碍** —— shadcn-vue + reka-ui 组件层，键盘可达、ARIA 完整、移动端布局适配
- **可验证可分享** —— 排盘结果支持 `html2canvas` 截图分享；URL hash 携带主题/语言便于发链接

---

## 🧭 模块矩阵

| # | 模块 | 副标题 | 关键计算 |
|---|---|---|---|
| 01 | **八字** | 四柱推命 · 五行相生 | tyme4ts + lunisolar 排盘；十神 / 藏干 / 纳音 / 大运 / 流年 / 神煞 / 格局 |
| 02 | **紫微斗数** | 十二宫垣 · 三方四正 | iztro 引擎；命主 / 身主 / 12 宫主星亮度 / 四化飞星 / 大限 / 流年 |
| 03 | **小六壬** | 掐指一算 · 应事即时 | 大安/留连/速喜/赤口/小吉/空亡 六宫；按月日时三步累加 |
| 04 | **称骨论命** | 袁天罡之诀 · 一斤一两 | 年/月/日/时四骨重 + 总骨重对应评诗 |
| 05 | **灵签问卜** | 虔诚一念 · 神明指引 | 观音 100 签全集 · 签诗 / 解曰 / 仙机 / 6 大事项 |
| 06 | **姓名学** | 五格剖象 · 三才配置 | 康熙笔画 + 五格数理 + 三才相生相克 + 综合评分 |
| 07 | **老黄历** | 宜忌吉时 · 节气物候 | 宜/忌 + 黄道吉时 + 神煞方位 + 12 建星 + 彭祖百忌 |
| 08 | **周公解梦** | 梦境寻踪 · 心象索解 | Fuse.js 模糊搜索 + 古籍原文 + 现代心理学解读 |
| ✨ | **AI 解读侧栏** | 跨 8 模块 · 自由咨询 | 8 家主流 LLM Provider 任选 · 流式 · 8 套模块解读骨架 · 多轮对话 |

---

## 🛠 技术栈

| 类别 | 选型 |
|---|---|
| 框架 | Vue 3.4 + `<script setup>` + Composition API |
| 构建 | Vite 5 + unplugin-auto-import + unplugin-vue-components + vite-plugin-compression（gzip + brotli） |
| 类型 | TypeScript 5.5 严格模式 + vue-tsc |
| 状态 | Pinia 2 |
| 路由 | Vue Router 4（hash 模式，纯静态托管） |
| i18n | vue-i18n 9（按需懒加载语言包） |
| UI 基件 | **shadcn-vue** + Tailwind CSS v4 + reka-ui |
| 主题适配 | 通过覆盖 CSS token（`--background` / `--primary` / `--border` / `--ring` …）实现"一套组件、双套风格" |
| 历法 / 农历 | `tyme4ts` + `lunisolar` + `@lunisolar/plugin-char8ex` |
| 紫微引擎 | `iztro` |
| 工具 | `@vueuse/core` + `@vueuse/router` + `fuse.js` + `chinese-conv` |
| 截图分享 | `html2canvas` + `qrcode` |
| AI | 8 家 Provider · `openai`（OpenAI 协议族：OpenAI / DeepSeek / Qwen / Moonshot / Zhipu / xAI）+ `@anthropic-ai/sdk` + `@google/genai` + `markstream-vue` 增量 markdown 渲染 |
| 测试 | Vitest 4 + happy-dom + 覆盖率 v8 |
| 部署 | GitHub Pages（GitHub Actions） |

---

## 🚀 启动

```bash
# 安装
npm install

# 开发（http://localhost:5180）
npm run dev

# 类型检查
npm run type-check

# 单元测试
npm test

# 测试覆盖率
npm run test:coverage

# 生产构建（输出到 dist/）
npm run build

# 本地预览构建产物
npm run preview
```

### 一键试链接（本地启动后）

| 主题 × 语言 | URL |
|---|---|
| 国风 / 简体 | <http://localhost:5180/#/?theme=guofeng&lang=zh-CN> |
| 国风 / 繁體 | <http://localhost:5180/#/?theme=guofeng&lang=zh-TW> |
| 简约 / English | <http://localhost:5180/#/?theme=minimal&lang=en> |

---

## 🤖 AI 解读功能

支持 8 家主流大模型 Provider（按设置页分组顺序）：

| 分组 | Provider | 协议 | 推荐场景 |
|---|---|---|---|
| 国际 | **OpenAI** | OpenAI SDK | 全球开发者首选，生态最完整 |
| 国际 | **Anthropic Claude** | `@anthropic-ai/sdk` | 顶级推理与编码（Claude 4.6/4.7） |
| 国际 | **Google Gemini** | `@google/genai` | 原生多模态，超长上下文 |
| 国际 | **xAI Grok** | OpenAI 兼容 | 100% OpenAI 协议兼容 |
| 国内 | **DeepSeek 深度求索** | OpenAI 兼容 | 中文性价比首选，思维链可选 |
| 国内 | **通义千问 Qwen** | OpenAI 兼容 | 中文场景，超大上下文窗口 |
| 国内 | **月之暗面 Kimi** | OpenAI 兼容 | 长文档场景代表 |
| 国内 | **智谱 GLM** | OpenAI 兼容 | 推理与长文档，国内自研 |

启用步骤：

1. 进入设置页 `/settings`，在「服务方」下拉中选择任一 Provider（支持搜索）
2. 点击右上角「获取 API Key →」打开对应 Provider 官方控制台获取 Key
3. 粘贴 Key（每家 Provider 独立保存，切换不会互相覆盖）
4. 在任意模块完成排盘 → 点击「询问 AI」按钮，右侧侧栏开始流式解读
4. 可继续多轮提问；点预设 chip 一键发问；按命盘指纹隔离会话

**隐私保证**：

- API Key 仅存在浏览器 `localStorage`（**按 Provider 独立保存**），从不发往本站任何后端（本站没有后端）
- 对话请求由你的浏览器**直接**发往当前选中 Provider 的官方 endpoint（`api.openai.com` / `api.anthropic.com` / `api.deepseek.com` 等）
- 对话历史只存在你本机的 `localStorage`，可随时清除

未配 Key 也能使用全部 8 个排盘模块——AI 解读纯属可选增强。

---

## 🎨 主题与多语言

| 维度 | 取值 | URL 参数 | 持久化 |
|---|---|---|---|
| 主题 | `guofeng` / `minimal` | `?theme=` | `localStorage` |
| 语言 | `zh-CN` / `zh-TW` / `en` | `?lang=` | `localStorage` |

优先级：URL > localStorage > `navigator.language` > `zh-CN` 兜底。

切换均无刷新；语义变量契约见 [`src/themes/_shared/contracts.css`](src/themes/_shared/contracts.css)；完整设计参考 [`design/2026-04-18-04-技术架构.md`](design/2026-04-18-04-技术架构.md)。

---

## 📁 项目结构

```
tt-qimen/
├── design/                       # 设计文档与原型（HTML 真理源）
├── public/                       # 静态资源
├── src/
│   ├── main.ts
│   ├── App.vue                   # ResizablePanelGroup（主区 + AI 侧栏）
│   ├── router/index.ts           # 8 模块 + legal + settings + 404
│   ├── stores/                   # Pinia: aiConfig / aiHistory / aiSidebar / theme / locale
│   ├── locales/                  # zh-CN / zh-TW / en + 模块懒加载语言包
│   ├── themes/
│   │   ├── _shared/              # contracts / base / tailwind
│   │   ├── guofeng/              # 国风 tokens / components / decorations / shadcn
│   │   └── minimal/              # 简约 tokens / components / decorations / shadcn
│   ├── components/
│   │   ├── ui/                   # shadcn-vue (button / select / input / radio-group ...)
│   │   ├── layout/               # AppHeader / AppFooter / ThemeSwitch / LangSwitch
│   │   ├── ai/                   # AiSidebarPanel / AskAiButton / AiMessageBubble ...
│   │   └── common/               # BirthForm 等跨模块复用
│   ├── composables/
│   │   ├── ai/                   # useAiChat / providers / contextBuilders / systemPrompts
│   │   └── ...
│   └── modules/
│       ├── home/                 # 首页（双主题完整还原）
│       ├── bazi/                 # 八字（4 柱 + 大运 + 流年 + 神煞 + 格局）
│       ├── ziwei/                # 紫微（12 宫 + 四化 + 大限 + 流年）
│       ├── liuren/               # 小六壬
│       ├── chenggu/              # 称骨
│       ├── lingqian/             # 灵签
│       ├── xingming/             # 姓名
│       ├── huangli/              # 老黄历
│       ├── jiemeng/              # 解梦
│       ├── settings/             # AI / 主题 / 语言 / 数据管理
│       └── legal/                # 关于 / 免责 / 数据来源 / 隐私
├── index.html
├── vite.config.ts                # GitHub Pages base + manualChunks + 按需 modulePreload
├── package.json
└── tsconfig.json
```

---

## 🧪 测试

- **单元测试**：Vitest 4，覆盖排盘引擎 / AI provider / contextBuilders / stores / i18n 完整性等
- **运行**：`npm test`（单次） / `npm run test:watch`（监听模式）
- **覆盖率**：`npm run test:coverage`，重点覆盖 `composables/ai/**` 与 `stores/aiHistory.ts`

---

## 🚢 部署

`main` 分支推送后由 [`.github/workflows/main.yml`](.github/workflows/main.yml) 自动构建并部署到 GitHub Pages：

```yaml
# 关键步骤
- run: npm ci
- run: npm run build
  env:
    GITHUB_PAGES: 'true'   # vite.config.ts 据此设置 base: '/tt-qimen/'
- uses: actions/upload-pages-artifact@v3
- uses: actions/deploy-pages@v4
```

部署 URL：<https://shetengteng.github.io/tt-qimen/>

---

## 🔒 隐私声明

- 排盘的所有输入（生辰、姓名、问题）**仅在你的浏览器内计算**；本站没有任何后端服务器
- 排盘结果不上传，仅在你需要分享时才生成本地图片
- AI 解读的 API Key 与对话历史**仅存于本机浏览器 `localStorage`**；对话请求由你的浏览器直发当前选中 Provider 的官方 endpoint
- 详见站内 `/privacy` 页面

---

## 📜 License

MIT © shetengteng

---

## 🙏 致谢

- 历法引擎：[`tyme4ts`](https://github.com/6tail/tyme4ts) · [`lunisolar`](https://github.com/waterbeside/lunisolar)
- 紫微引擎：[`iztro`](https://github.com/SylarLong/iztro)
- UI：[`shadcn-vue`](https://www.shadcn-vue.com/) · [`reka-ui`](https://reka-ui.com/) · [`Tailwind CSS`](https://tailwindcss.com/)
- AI Provider：[`OpenAI`](https://platform.openai.com/) · [`Anthropic`](https://console.anthropic.com/) · [`Google AI Studio`](https://aistudio.google.com/) · [`xAI`](https://console.x.ai/) · [`DeepSeek`](https://platform.deepseek.com/) · [`通义千问`](https://bailian.console.aliyun.com/) · [`Moonshot`](https://platform.moonshot.cn/) · [`智谱 BigModel`](https://bigmodel.cn/)
- AI SDK：[`openai`](https://github.com/openai/openai-node) · [`@anthropic-ai/sdk`](https://github.com/anthropics/anthropic-sdk-typescript) · [`@google/genai`](https://github.com/googleapis/js-genai)
- 流式 markdown：[`markstream-vue`](https://github.com/markstream-vue)
- 民间术数文献整理：所有为传统文化数字化贡献心力的前辈
