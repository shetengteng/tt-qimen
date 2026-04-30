# tt-qimen · TT Divination

[简体中文](./README.md) · [English](./README.en.md)

> A **fully-static, zero-backend** Chinese traditional divination web app covering 8 core modules — BaZi (Four Pillars) / Zi Wei Dou Shu / Xiao Liu Ren / Cheng Gu (Bone Weighing) / Guan Yin Ling Qian / Chinese Name Analysis / Huang Li (Almanac) / Dream Interpretation — plus an optional AI interpretation sidebar. **Everything is computed in the browser**, no private data ever leaves your device.

[![Vue](https://img.shields.io/badge/Vue-3.4-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

🌐 **Live demo**: <https://shetengteng.github.io/tt-qimen/>

---

## ✨ Highlights

- **Eight divination modules** — all powered by genuine traditional algorithms (BaZi Four Pillars / Zi Wei 12 palaces + Four Transformations / Xiao Liu Ren six palaces / Yuan Tian-Gang bone weighing / Guan Yin 100-slip oracle / Five-Grid + Three-Talents name analysis / Huang Li auspicious-hours almanac / Duke of Zhou dream search), with rich visualisations
- **AI interpretation** — works on every module's chart, plus a free-form consultation mode; DeepSeek streaming; **BYOK** (bring your own key); local conversation history persisted per chart fingerprint
- **Two themes** — `guofeng` (Chinese-classical) and `minimal` (modern-clean), switchable via `?theme=`
- **Three languages** — Simplified Chinese / Traditional Chinese / English, switchable via `?lang=`, with zero runtime fallback warnings
- **Zero backend** — all computation and storage stay in your browser; hosted on GitHub Pages; your DeepSeek API key lives only in `localStorage`, requests go directly to DeepSeek, this site collects nothing
- **Responsive & accessible** — shadcn-vue + reka-ui component layer; full keyboard navigation; ARIA-complete; mobile-friendly layouts
- **Verifiable & shareable** — chart results can be exported as images via `html2canvas`; URL hash carries theme/language so links travel intact

---

## 🧭 Module Matrix

| # | Module | Subtitle | Core Algorithm |
|---|---|---|---|
| 01 | **BaZi** | Four Pillars · Five-Element interplay | tyme4ts + lunisolar; ten-gods, hidden stems, nayin, decadal cycles, annual cycles, spirits/clashes, named patterns |
| 02 | **Zi Wei Dou Shu** | Twelve palaces · Triad & opposite | iztro engine; soul/body master, main-star brightness across 12 palaces, four mutagens, decadal & annual flow |
| 03 | **Xiao Liu Ren** | Finger-counting · Instant answer | Da-An / Liu-Lian / Su-Xi / Chi-Kou / Xiao-Ji / Kong-Wang six palaces; month-day-hour three-step accumulation |
| 04 | **Cheng Gu (Bone Weighing)** | Yuan Tian-Gang's mnemonic · One jin one liang | Year/month/day/hour bone weights summing to a verse |
| 05 | **Guan Yin Ling Qian** | Sincere prayer · Divine guidance | Full 100-slip oracle: verse / oracle / divine mechanism / six topical readings |
| 06 | **Chinese Name Analysis** | Five Grids · Three Talents | Kangxi strokes + five-grid numerology + Three-Talents generation/restraint + composite score |
| 07 | **Huang Li (Almanac)** | Suitable / Avoid · Auspicious hours | Daily suitability + auspicious hours + spirits & directions + 12 Duties + Pengzu taboos |
| 08 | **Dream Interpretation** | Trace your dream · Decode your psyche | Fuse.js fuzzy search + classical Duke-of-Zhou source + modern psychological reading |
| ✨ | **AI Sidebar** | Cross-module · Free consultation | DeepSeek V4 Flash / Pro · streaming · 8 module-specific reading frameworks · multi-turn dialogue |

---

## 🛠 Tech Stack

| Category | Choice |
|---|---|
| Framework | Vue 3.4 + `<script setup>` + Composition API |
| Build | Vite 5 + unplugin-auto-import + unplugin-vue-components + vite-plugin-compression (gzip + brotli) |
| Type system | TypeScript 5.5 strict + vue-tsc |
| State | Pinia 2 |
| Routing | Vue Router 4 (hash mode, static-host friendly) |
| i18n | vue-i18n 9 (per-module lazy-loaded packs) |
| UI primitives | **shadcn-vue** + Tailwind CSS v4 + reka-ui |
| Theming | One component set, two visual languages — driven by overriding CSS tokens (`--background` / `--primary` / `--border` / `--ring` …) |
| Calendar / lunar | `tyme4ts` + `lunisolar` + `@lunisolar/plugin-char8ex` |
| Zi Wei engine | `iztro` |
| Utilities | `@vueuse/core` + `@vueuse/router` + `fuse.js` + `chinese-conv` |
| Sharing | `html2canvas` + `qrcode` |
| AI | `openai` SDK (OpenAI-compatible protocol) → DeepSeek streaming + `markstream-vue` for incremental markdown rendering |
| Testing | Vitest 4 + happy-dom + v8 coverage |
| Deployment | GitHub Pages (GitHub Actions) |

---

## 🚀 Getting Started

```bash
# Install
npm install

# Dev (http://localhost:5180)
npm run dev

# Type-check
npm run type-check

# Unit tests
npm test

# Coverage
npm run test:coverage

# Production build (output to dist/)
npm run build

# Preview the build locally
npm run preview
```

### Quick links (after `npm run dev`)

| Theme × Language | URL |
|---|---|
| guofeng / Simplified Chinese | <http://localhost:5180/#/?theme=guofeng&lang=zh-CN> |
| guofeng / Traditional Chinese | <http://localhost:5180/#/?theme=guofeng&lang=zh-TW> |
| minimal / English | <http://localhost:5180/#/?theme=minimal&lang=en> |

---

## 🤖 AI Interpretation

How to enable:

1. Open the settings page at `/settings` and paste your [DeepSeek API key](https://platform.deepseek.com/)
2. In any of the 8 modules, generate a chart and click the **Ask AI** button
3. The right-hand sidebar opens and starts streaming an interpretation grounded in your chart
4. Continue with multi-turn questions; click a preset chip for one-tap prompts; conversations are isolated per chart fingerprint

**Privacy guarantees**:

- The API key is stored **only** in your browser's `localStorage`; it is never sent to any server of this site (this site has no server)
- AI requests go **directly** from your browser to `api.deepseek.com`
- All conversation history lives **only** in your local `localStorage` and can be cleared at any time

You can use all 8 divination modules **without** an AI key — the AI sidebar is purely an optional enhancement.

---

## 🎨 Theming & i18n

| Dimension | Values | URL param | Persistence |
|---|---|---|---|
| Theme | `guofeng` / `minimal` | `?theme=` | `localStorage` |
| Language | `zh-CN` / `zh-TW` / `en` | `?lang=` | `localStorage` |

Resolution order: URL > localStorage > `navigator.language` > `zh-CN` fallback.

Switching is instant, no reload. Semantic CSS contracts live in [`src/themes/_shared/contracts.css`](src/themes/_shared/contracts.css); see [`design/2026-04-18-04-技术架构.md`](design/2026-04-18-04-技术架构.md) (in Chinese) for the full architecture.

---

## 📁 Project Layout

```
tt-qimen/
├── design/                       # Design docs & HTML prototypes (source of truth)
├── public/                       # Static assets
├── src/
│   ├── main.ts
│   ├── App.vue                   # ResizablePanelGroup (main + AI sidebar)
│   ├── router/index.ts           # 8 modules + legal + settings + 404
│   ├── stores/                   # Pinia: aiConfig / aiHistory / aiSidebar / theme / locale
│   ├── locales/                  # zh-CN / zh-TW / en + per-module lazy packs
│   ├── themes/
│   │   ├── _shared/              # contracts / base / tailwind
│   │   ├── guofeng/              # tokens / components / decorations / shadcn
│   │   └── minimal/              # tokens / components / decorations / shadcn
│   ├── components/
│   │   ├── ui/                   # shadcn-vue (button / select / input / radio-group ...)
│   │   ├── layout/               # AppHeader / AppFooter / ThemeSwitch / LangSwitch
│   │   ├── ai/                   # AiSidebarPanel / AskAiButton / AiMessageBubble ...
│   │   └── common/               # cross-module reusables (e.g. BirthForm)
│   ├── composables/
│   │   ├── ai/                   # useAiChat / providers / contextBuilders / systemPrompts
│   │   └── ...
│   └── modules/
│       ├── home/                 # Landing page (both themes)
│       ├── bazi/                 # BaZi (4 pillars + decadals + annual + spirits + pattern)
│       ├── ziwei/                # Zi Wei (12 palaces + mutagens + decadals + annual)
│       ├── liuren/               # Xiao Liu Ren
│       ├── chenggu/              # Bone Weighing
│       ├── lingqian/             # Guan Yin Ling Qian
│       ├── xingming/             # Name Analysis
│       ├── huangli/              # Almanac
│       ├── jiemeng/              # Dream Interpretation
│       ├── settings/             # AI / theme / language / data management
│       └── legal/                # About / Disclaimer / Data Source / Privacy
├── index.html
├── vite.config.ts                # GitHub Pages base + manualChunks + selective modulePreload
├── package.json
└── tsconfig.json
```

---

## 🧪 Testing

- **Unit tests**: Vitest 4, covering divination engines / AI provider / contextBuilders / stores / i18n completeness
- **Run**: `npm test` (single run) / `npm run test:watch` (watch mode)
- **Coverage**: `npm run test:coverage`, focused on `composables/ai/**` and `stores/aiHistory.ts`

---

## 🚢 Deployment

Pushing to `main` triggers [`.github/workflows/main.yml`](.github/workflows/main.yml), which builds and deploys to GitHub Pages:

```yaml
# Key steps
- run: npm ci
- run: npm run build
  env:
    GITHUB_PAGES: 'true'   # vite.config.ts uses this to set base: '/tt-qimen/'
- uses: actions/upload-pages-artifact@v3
- uses: actions/deploy-pages@v4
```

Live URL: <https://shetengteng.github.io/tt-qimen/>

---

## 🔒 Privacy

- All chart inputs (birth time, name, question) are computed **only inside your browser**; this site has no backend server
- Chart results are not uploaded; image sharing is generated locally on demand
- The DeepSeek API key and AI conversation history live **only** in your browser's `localStorage`; AI requests go directly from your browser to DeepSeek
- See `/privacy` inside the app for the full statement

---

## 📜 License

MIT © shetengteng

---

## 🙏 Acknowledgements

- Calendar engines: [`tyme4ts`](https://github.com/6tail/tyme4ts) · [`lunisolar`](https://github.com/waterbeside/lunisolar)
- Zi Wei engine: [`iztro`](https://github.com/SylarLong/iztro)
- UI: [`shadcn-vue`](https://www.shadcn-vue.com/) · [`reka-ui`](https://reka-ui.com/) · [`Tailwind CSS`](https://tailwindcss.com/)
- AI: [`DeepSeek`](https://platform.deepseek.com/)
- Streaming markdown: [`markstream-vue`](https://github.com/markstream-vue)
- All the scholars who have worked to digitise traditional Chinese divination knowledge
