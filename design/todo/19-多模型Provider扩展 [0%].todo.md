# 19 · 多模型 Provider 扩展 · TODO（功能视角）· 0%

> 对应设计文档：本 TODO 暂作为唯一规划文档（待实施前如需 RFC 再补充设计文档 `design/2026-04-30-01-多模型 Provider 扩展.md`）
> 状态约定：`[x]` 已完成 · `[~]` 部分实现 · `[ ]` 待办
> **创建**：2026-04-30 · 起因：当前 AI 解读模块仅支持 DeepSeek，扩展为主流多 LLM Provider，让用户按偏好与额度自选
> **基线**：`design/todo/18-AI解读模块 [98%].todo.md` 已交付的 Provider 抽象层（`LlmProvider` 接口 + `useAiChat` 不感知 SDK），本 TODO 在此之上做扩展，**不破坏现有契约**

---

## 0. 模块定位

`tt-qimen` 的 AI 解读侧栏当前只接入 DeepSeek 一家；本扩展把"主流多 Provider"接入设置页，让用户：

- 可选 8+ 家主流模型（OpenAI / Anthropic / Google / DeepSeek / 通义 / Kimi / 智谱 / xAI），按价格与能力按需切换
- 切换 Provider 时**不丢失**已配置的其它 Provider 的 API Key（每家独立存）
- AI 解读侧栏运行时透明使用当前选中的 Provider，**不需要改 contextBuilders / systemPrompts / sidebar UI**

**非目标**：

- ❌ 不做"模型路由"（按问题类型自动选模型）— 用户手动选定即可
- ❌ 不做"Provider 聚合代理"（OpenRouter / Together 等）— 用户可在 baseUrl 里自填
- ❌ 不做"密钥服务端中转"— 项目纯静态，BYOK 直发原则不变
- ❌ 不在本 TODO 中做多模态（图像/语音）— 仍仅文本流式
- ❌ 不做账单/用量统计 UI— 用户在各家官方控制台自查

---

## 1. 主流 Provider 矩阵（2026-04-30 调研结果）

> 来自 2026-04-30 WebSearch（OpenAI / Anthropic / Google 官方 docs + Qwen / Kimi / GLM 中文官方资料）。

| Provider | id | 默认 baseURL | 协议 | 推荐模型 | 备选模型 | 备注 |
|---|---|---|---|---|---|---|
| **OpenAI** | `openai` | `https://api.openai.com/v1` | OpenAI 原生 | `gpt-5.4-mini` | `gpt-5.5` / `gpt-5.4` / `gpt-5.4-nano` | GPT-4o/4.1/5.1 已退役 |
| **Anthropic** | `anthropic` | `https://api.anthropic.com` | 原生 SDK（**非** OpenAI 兼容） | `claude-sonnet-4-6` | `claude-opus-4-7` / `claude-haiku-4-5` | Claude Opus 4 / Sonnet 4 旧版 2026-06-15 退役 |
| **Google Gemini** | `gemini` | `https://generativelanguage.googleapis.com/v1beta` | 原生 SDK（也提供 OpenAI 兼容 endpoint） | `gemini-3-flash` | `gemini-3.1-pro` / `gemini-3.1-flash-lite` / `gemini-2.5-pro` | Gemini 3 Pro 2026-03-09 弃用，迁移到 3.1 Pro |
| **DeepSeek** | `deepseek` | `https://api.deepseek.com` | OpenAI 兼容 | `deepseek-v4-flash`（保留现状） | `deepseek-v4-pro` | 已上线，本扩展仅做接口归一化 |
| **通义千问 Qwen** | `qwen` | `https://dashscope.aliyuncs.com/compatible-mode/v1` | OpenAI 兼容 | `qwen-plus` | `qwen3-max` / `qwen3.6-plus-preview` / `qwen3-coder-next` | 中文场景首选，性价比强 |
| **月之暗面 Kimi** | `moonshot` | `https://api.moonshot.cn/v1` | OpenAI 兼容 | `kimi-k2.6` | `kimi-k2.5` / `kimi-k2` | 长上下文 / 国产 |
| **智谱 GLM** | `zhipu` | `https://open.bigmodel.cn/api/paas/v4` | OpenAI 兼容 | `glm-4.6` | `glm-4.7` / `glm-4.5` | 中文 + 推理 |
| **xAI Grok** | `xai` | `https://api.x.ai/v1` | OpenAI 兼容 | `grok-4` | `grok-3` | OpenAI 协议 100% 兼容 |

**关键技术洞察（影响架构决策）**：

> 除 **Anthropic Claude** 与 **Google Gemini** 是原生协议外，其余 6 家全部 OpenAI 协议兼容。
> 这意味着新增 6 个 Provider 实现可**共享一份 `openai-compatible` 流式核心**（已有 `deepseek.ts` 即此模板），仅需要传入不同的 `defaultBaseUrl + models + ID`，**不需要为每家单独装 SDK**。

---

## 2. 功能边界与完成度（核心）

| # | 功能维度 | MVP 范围 | 状态 | 实现位置（计划） | 依赖 |
|---|---|---|---|---|---|
| 1 | **Provider 注册表** | 全部 8 个 Provider 的 `ProviderDescriptor` 列表（id / displayName i18n / homepage / docsUrl / defaultBaseUrl / models / defaultModel） | `[ ]` ⏳ | `src/composables/ai/providers/registry.ts` | — |
| 2 | **OpenAI 兼容通用 provider** | 抽出 `createOpenAiCompatibleProvider(opts)` 工厂函数，`deepseek.ts` 改为它的实例化；6 个 OpenAI 兼容 Provider 共用 | `[ ]` ⏳ | `src/composables/ai/providers/openaiCompatible.ts` | `openai` SDK（已装） |
| 3 | **Anthropic Provider** | 走 `@anthropic-ai/sdk`，独立 `streamChat` + `ping`；处理 messages 系统消息从 `messages[0]` 提取到顶层 `system` 字段 | `[ ]` ⏳ | `src/composables/ai/providers/anthropic.ts` | 新增 npm `@anthropic-ai/sdk@^0.x` |
| 4 | **Gemini Provider** | 走 `@google/genai`，独立 `streamChat` + `ping`；把 `messages` 转 Gemini `contents` 格式 | `[ ]` ⏳ | `src/composables/ai/providers/gemini.ts` | 新增 npm `@google/genai@^0.x` |
| 5 | **AiConfig 重构（多 provider 配置）** | `AiConfig` 拆为 `activeProviderId + perProvider: Record<ProviderId, ProviderConfig>`；切 Provider 不丢其它家 Key | `[ ]` ⏳ | `src/composables/ai/types.ts` + `src/stores/aiConfig.ts` | — |
| 6 | **Settings UI · Provider 切换器** | 当前 hardcode "deepseek" chip 改为 8 个 Provider 选项卡 / Combobox；切换后下方 apiKey + model 区域同步刷新 | `[ ]` ⏳ | `src/modules/settings/SettingsPage.vue` AI 段 | — |
| 7 | **Settings UI · 每 Provider 独立 apiKey** | apiKey 输入框跟随当前选中 Provider；切回某 Provider 自动回显历史 apiKey；展示该 Provider 的 docsUrl 链接 | `[ ]` ⏳ | `SettingsPage.vue` | — |
| 8 | **Settings UI · 模型选择器（按 Provider）** | 当前选中 Provider 的 models 列表展示为 Button grid，每条 model 有 i18n 描述（速度 / 推理 / 长上下文 / 价格档位） | `[ ]` ⏳ | `SettingsPage.vue` | — |
| 9 | **Settings UI · baseUrl 自定义** | 用户可改 baseUrl 走代理 / 自部署（仅 OpenAI 兼容族 Provider 暴露此字段；Anthropic / Gemini 隐藏，避免误用） | `[ ]` ⏳ | `SettingsPage.vue` | — |
| 10 | **测试连接按钮（多 provider）** | 当前 hardcode 调 `deepseekProvider.ping`，改为 `getProvider(activeProviderId).ping(currentProviderConfig)` | `[ ]` ⏳ | `SettingsPage.vue` | #1, #2, #3, #4 |
| 11 | **AiSidebarPanel 切 Provider 自适应** | `useAiChat` 的 `provider` ref 改为 `computed(() => getProvider(aiConfig.activeProviderId))`，切换 Provider 时 sidebar 自动用新 Provider | `[ ]` ⏳ | `src/components/ai/AiSidebarPanel.vue` | #1 |
| 12 | **DEEPSEEK_MODELS 重命名 + 扩展** | `DEEPSEEK_MODELS` 改名为 `DEEPSEEK_MODELS_DESCRIPTOR`，新增 `OPENAI_MODELS / ANTHROPIC_MODELS / GEMINI_MODELS / QWEN_MODELS / MOONSHOT_MODELS / ZHIPU_MODELS / XAI_MODELS` | `[ ]` ⏳ | `src/composables/ai/types.ts` | — |
| 13 | **错误码扩展** | `errors.ts` `LlmError` 已映射 401/429/500/network/aborted；扩展为兼容 Anthropic & Gemini 错误体（不同 status code 与 body 结构） | `[ ]` ⏳ | `src/composables/ai/errors.ts` | #3, #4 |
| 14 | **i18n · Provider 名称三语** | 8 个 Provider × 3 语言 displayName + apiKey docs link 标签 + baseUrl placeholder | `[ ]` ⏳ | `src/locales/{zh-CN,zh-TW,en}.ts` `settings.section.ai.providerOption.*` 扩展 | — |
| 15 | **i18n · Model 描述三语** | 跨 Provider ~28 条主流 model id × 3 语言简短描述（用 type-tag：`{thinking, fast, cheap, longContext, multimodal}`） | `[ ]` ⏳ | `src/locales/{zh-CN,zh-TW,en}.ts` `settings.section.ai.modelDesc.*` | — |
| 16 | **隐私页 Provider 列表更新** | `/privacy` 段把"DeepSeek"改为"用户选定的 Provider 直发"；列出 8 家可选 Provider | `[ ]` ⏳ | `src/locales/{zh-CN,zh-TW,en}.ts` `privacyPage.sections[7]` | — |
| 17 | **README 更新** | `README.md` + `README.en.md` "AI 解读"段把 DeepSeek 改为"BYOK 任一主流 Provider"，附支持矩阵 | `[ ]` ⏳ | `README.md` / `README.en.md` | 全部完成后做 |

---

## 3. 实施阶段（按依赖顺序，建议 4 个 Phase）

### Phase 1 — 类型与配置层重构 · ~0.5 天

> 目标：先把 `AiConfig` 多 provider 化，store 升级，**保持当前 DeepSeek 单一 provider 行为不变**。
> **决策（2026-04-30 用户）**：项目尚未公开使用，**不做旧版 storage migration**；老用户（即开发者本人）重新填写 Key 即可。`localStorage` 旧格式直接被新结构覆盖。

- [ ] ⏳ P1-01 写 `src/composables/ai/providers/registry.ts`：导出 `ProviderId` union + `ProviderDescriptor` interface + 占位 `PROVIDERS: Record<ProviderId, ProviderDescriptor>`（先填 8 家 metadata，不填 instance）
- [ ] ⏳ P1-02 重写 `src/composables/ai/types.ts`：
    - `AiConfig` 拆为 `{ activeProviderId, temperature, perProvider }`
    - `ProviderConfig = { apiKey: string; baseUrl: string; model: string }`
    - 旧 `DEEPSEEK_MODELS` / `DEPRECATED_DEEPSEEK_MODEL_IDS` 保留作 deprecated alias（仅给 sanitize 兜底用），新增 `DEEPSEEK_MODELS_DESCRIPTOR`
- [ ] ⏳ P1-03 重写 `src/stores/aiConfig.ts`：
    - `useStorage` 默认值改为新结构 `DEFAULT_AI_CONFIG`；旧格式被 mergeDefaults 覆盖（无迁移逻辑）
    - 新增 `setActiveProvider(id)` / `setProviderApiKey(id, key)` / `setProviderModel(id, model)` / `setProviderBaseUrl(id, url)`
    - `currentProviderConfig` computed = `perProvider[activeProviderId]`
    - `hasKey` / `isConfigured` 改为读 `currentProviderConfig.apiKey`
- [ ] ⏳ P1-04 单元测试 `aiConfig.spec.ts`：切 Provider 不丢 Key / per-provider 默认 baseUrl 兜底 / sanitize 旧 deepseek model id 仍生效

### Phase 2 — Provider 实现 · ~1 天

> 目标：8 个 Provider 全部接入，`registry.ts` 真正可用；现有 `deepseek.ts` 改造为 OpenAI 兼容工厂的实例。

- [ ] ⏳ P2-01 写 `src/composables/ai/providers/openaiCompatible.ts`：
    - `createOpenAiCompatibleProvider({ id, supportsThinking?: (model: string) => boolean })` 工厂函数
    - 复用现有 `deepseek.ts` 的 thinking 处理逻辑（仅对支持 thinking 的 provider+model 启用）
- [ ] ⏳ P2-02 重构 `src/composables/ai/providers/deepseek.ts`：调 `createOpenAiCompatibleProvider({ id: 'deepseek', supportsThinking: m => /pro/i.test(m) })`，行为零变化
- [ ] ⏳ P2-03 创建 `openai.ts` / `qwen.ts` / `moonshot.ts` / `zhipu.ts` / `xai.ts`：均为 `createOpenAiCompatibleProvider` 实例（每个 ~5 行）
- [ ] ⏳ P2-04 安装 `@anthropic-ai/sdk` 并写 `anthropic.ts`：
    - 把 `messages` 数组里第一条 system role 提取到顶层 `system` 字段（Anthropic API 要求）
    - 用 `client.messages.stream()` 拿到 stream，`for await` 解析 `content_block_delta` 事件 → yield `delta.text`
    - `dangerouslyAllowBrowser: true`
- [ ] ⏳ P2-05 安装 `@google/genai` 并写 `gemini.ts`：
    - `GoogleGenAI({ apiKey })` 客户端
    - 把 OpenAI 风格 `messages: [{role, content}]` 转 Gemini `contents: [{role, parts: [{text}]}]`，system role 转 `systemInstruction`
    - `model.generateContentStream(...)` 流式 yield
- [ ] ⏳ P2-06 完成 `registry.ts`：填充 `PROVIDERS` instance map + 8 家完整 metadata（displayName / homepage / docsUrl / defaultBaseUrl / models / defaultModel）
- [ ] ⏳ P2-07 写 `getProvider(id)` 辅助函数 + 类型安全保护
- [ ] ⏳ P2-08 单元测试每个 Provider 的 streamChat 关键逻辑（mock SDK，验证 messages 转换）

### Phase 3 — UI 与上下游接入 · ~0.5 天

> 目标：Settings 页可视化切换 + AiSidebarPanel 透明切换 Provider。

- [ ] ⏳ P3-01 重构 `SettingsPage.vue` AI 段：
    - 顶部 Provider 选择 grid（8 个 Button，aria-pressed 反映 activeProviderId）
    - 切 Provider 不重置已存的其它 Provider Key
    - apiKey / model / baseUrl 三块跟随 activeProvider 重新渲染
    - 每个 Provider 显示一行 "获取 API Key →" 链接（点击新窗口打开 `apiKeyDocsUrl`）
- [ ] ⏳ P3-02 重构 model 选择 grid：
    - 不再 hardcode `DEEPSEEK_MODELS`，改读 `PROVIDERS[activeId].models`
    - 每个 model 描述读 `settings.section.ai.modelDesc.<provider>.<modelId>`，缺失时回退到 type-tag 通用描述（如 "thinking-mode / fast / long-context"）
- [ ] ⏳ P3-03 重构 baseUrl 区：仅 `isOpenAiCompatible` 的 Provider 显示 baseUrl 输入；Anthropic / Gemini 隐藏
- [ ] ⏳ P3-04 重构 testConnection：用 `getProvider(activeId).ping(currentProviderConfig)` 替换 hardcode
- [ ] ⏳ P3-05 改造 `AiSidebarPanel.vue`：
    - `providerRef` 从 `shallowRef(deepseekProvider)` 改为 `computed(() => getProvider(aiConfig.activeProviderId))`
    - `configRef` 从 `aiConfig.config` 改为 `aiConfig.currentProviderConfig`（含 apiKey / baseUrl / model）+ 顶层 `temperature` 合并
- [ ] ⏳ P3-06 真实端到端 smoke：8 个 Provider 各跑一次"首次解读 → 1 轮提问 → 切到另一个 Provider 重复"

### Phase 4 — i18n 与文档收尾 · ~0.5 天

- [ ] ⏳ P4-01 三语 `settings.section.ai.providerOption.*` 扩展：8 个 Provider displayName + 简短 lead（"中文场景首选" / "全球开发者首选" / "顶级编码与推理" / ...）
- [ ] ⏳ P4-02 三语 `settings.section.ai.providerCategory.*`：分组 label（`international` / `domestic`）便于 UI 用 separator 分组
- [ ] ⏳ P4-03 三语 `settings.section.ai.modelDesc.<provider>.<modelId>`：~28 条 model 描述
- [ ] ⏳ P4-04 三语 `settings.section.ai.providerDocsCta`：通用"获取 API Key →" 链接 label
- [ ] ⏳ P4-05 隐私页 `/privacy` 第 8 段三语更新：列出 8 家 Provider，强调"BYOK + 直发对应官方 endpoint"
- [ ] ⏳ P4-06 `/privacy` & 设置页内联补"切换 Provider 不会清空其它已配 Key"的小字说明
- [ ] ⏳ P4-07 `README.md` AI 段更新："支持 OpenAI / Claude / Gemini / DeepSeek / Qwen / Kimi / GLM / Grok 等主流 Provider，BYOK"
- [ ] ⏳ P4-08 `README.en.md` 同步
- [ ] ⏳ P4-09 `i18n-completeness.spec.ts` 守门：把 8 Provider × 3 语 + ~28 model × 3 语全部纳入 ROOT_AI_PATHS 检查

---

## 4. 关键决策与权衡

### 4.1 配置存储结构：`perProvider` map vs 单一 active

**决策**：每 Provider 独立持久化 `apiKey / baseUrl / model`；切换 Provider 不丢其它家的 Key。

**理由**：
- 用户实际使用场景：可能同时配置 OpenAI（主用）+ DeepSeek（中文性价比）+ Gemini（多模态备用），频繁切换
- 如果切换 Provider 清空 apiKey，用户每次切都得重新粘贴 → 反人性
- 多家 apiKey 都明文存 localStorage 的隐私风险**没有变化**——本来就明文存（已在隐私页明示）

**反方意见**（已否决）：
- "更安全"：实际上单家 vs 多家，明文存的本质风险一样
- "存储空间"：8 家 × ~80 char = 640B，可忽略

### 4.2 OpenAI 兼容族：工厂函数 vs 每家独立文件

**决策**：抽出 `createOpenAiCompatibleProvider(opts)` 工厂，6 家共用；Anthropic / Gemini 单独写。

**理由**：
- DeepSeek / Qwen / Kimi / GLM / xAI / OpenAI 协议 100% 同构，仅 `baseURL + 默认 model 列表 + thinking 字段策略`不同
- 工厂模式让"加新 OpenAI 兼容 Provider"成本 = 改一个 registry 条目 + 5 行 instance（vs 整文件复制粘贴）
- Claude / Gemini 协议显著不同，强行抽象只会增加复杂度

### 4.3 SDK 选择

| Provider | SDK | 大小 | 选择理由 |
|---|---|---|---|
| OpenAI 兼容族 | `openai`（已装）| 100KB+ gz ~30KB | 已装；6 家共用零成本 |
| Anthropic | `@anthropic-ai/sdk` | ~25KB gz ~10KB | 官方维护；浏览器端原生支持 |
| Gemini | `@google/genai` | ~40KB gz ~15KB | 官方维护；统一 streaming API |

**否决方案**：
- ❌ 全部走 `fetch + 手写 SSE 解析`：已在 deepseek.ts 决策中否决（重复造轮子）
- ❌ 用 OpenRouter 之类聚合代理：违背"BYOK 直发"隐私承诺，且增加单点
- ❌ Gemini 走它的 OpenAI 兼容 endpoint（`/v1beta/openai`）：endpoint 仍 beta、限流不一样、有 quirks，不如官方 SDK 稳

### 4.4 Provider 分组与默认推荐

设置页 Provider 选择按"国际 / 国内"分组展示，默认推荐 `deepseek`（保留现状）。

**默认 model 选择策略**（按"性价比 + 速度"，避免默认开 thinking 引发"长时间空气泡"问题）：

| Provider | 默认 model | 理由 |
|---|---|---|
| OpenAI | `gpt-5.4-mini` | 中端定价 + 快 |
| Anthropic | `claude-sonnet-4-6` | 官方推荐生产默认 |
| Gemini | `gemini-3-flash` | 性价比代表 |
| DeepSeek | `deepseek-v4-flash` | 已有默认，不变 |
| Qwen | `qwen-plus` | 1M 上下文 + 最便宜 |
| Moonshot | `kimi-k2.6` | 当前最新 |
| 智谱 | `glm-4.6` | 推理 + 长上下文升级版 |
| xAI | `grok-3` | 比 grok-4 更便宜，且足够 |

### 4.5 Bundle 体积影响

新增依赖估算：
- `@anthropic-ai/sdk`: ~10KB gz
- `@google/genai`: ~15KB gz
- 合计 +25KB gz

**已有的 bundle 优化生效**：
- `vite.config.ts` `manualChunks` 已把 `vendor-openai` 和 `feat-ai` 拆出 + 排除出 `modulePreload`
- 新 SDK 也走 `feat-ai` chunk → 用户**不**点开 AI 侧栏永不下载
- 首屏 bundle **零增量**

### 4.6 模型列表更新策略

模型版本演进很快（每 1-3 个月一次），决策**不**自动同步官方 catalog：

- 静态硬编码 model id 列表 + 三语描述（已用 i18n 锁定）
- 用户 storage 残留旧 id 时 `sanitizeModel` 兜底回退到该 Provider 的默认 model
- 由开发者在新 model 发布后手动更新 `registry.ts` + `model.<id>` i18n 条目，走 PR 审核

### 4.7 错误码统一

不同 Provider 的错误体结构不一样：

| Provider | 401 | 429 | 500 |
|---|---|---|---|
| OpenAI 兼容 | `error.type === 'invalid_api_key'` | `error.type === 'rate_limit_exceeded'` | `error.type === 'server_error'` |
| Anthropic | `error.type === 'authentication_error'` | `error.type === 'rate_limit_error'` | `error.type === 'api_error'` |
| Gemini | HTTP 401 / `RESOURCE_EXHAUSTED` / `INTERNAL` | 同左 | 同左 |

**策略**：在每个 Provider 的 `streamChat` / `ping` catch 里把原生 error 映射为统一的 `LlmError` code（`unauthorized` / `rate-limited` / `server-error`）；i18n key `ai.error.<code>` 已存在，**零文案改动**。

---

## 5. 风险与回滚

### 5.1 主要风险

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| Anthropic / Gemini SDK 浏览器端兼容性 | 中 | 阻塞 Phase 2 P2-04/05 | 提前在浏览器 console 跑 minimal demo 验证；不行则改走 OpenAI 兼容 endpoint（Gemini 有，Anthropic 无 → fallback 移除该 Provider） |
| 跨 Provider streaming chunk 格式不一致 | 中 | sidebar 渲染异常 | 每 Provider streamChat 测试用例覆盖；统一 yield 纯字符串 |
| Anthropic system 消息处理（不在 messages 数组里） | 高 | system prompt 失效 | Provider 实现里强制提取 `messages[0]` 若 role==='system'；contextBuilders 不变 |
| 老开发者本机 storage 失效 | 已接受 | 需重填 DeepSeek Key | 用户决策 2026-04-30：项目未公开，老 storage 直接被覆盖；开发者重填即可 |
| i18n 三语缺失导致 sidebar 报警 | 低 | 控制台 warning | `i18n-completeness.spec.ts` 提前 fail-fast |

### 5.2 回滚路径

每个 Phase 都是独立 commit，可单独回滚：

- **Phase 1 回滚**：`AiConfig` 改回 flat 结构；用户已存的新结构 storage 在回滚后会被覆盖回旧 DeepSeek 单 provider 形态（同样需要重填 Key 一次）
- **Phase 2 回滚**：保留 `deepseek.ts` 不动，删除新加的 5 个 Provider 文件 + registry 中的 entry
- **Phase 3 回滚**：Settings UI Provider 切换器回到 chip-only，`AiSidebarPanel` provider 改回 hardcode
- **Phase 4 回滚**：i18n 文案删除即可

---

## 6. 完成度跟踪

| Phase | 状态 | 完成日期 | 备注 |
|---|---|---|---|
| Phase 1 — 类型与配置层重构 | `[ ]` ⏳ | — | — |
| Phase 2 — Provider 实现 | `[ ]` ⏳ | — | — |
| Phase 3 — UI 与上下游接入 | `[ ]` ⏳ | — | — |
| Phase 4 — i18n 与文档收尾 | `[ ]` ⏳ | — | — |

---

## 附录 A · 用户工作流变化对照

| 行为 | 当前（仅 DeepSeek） | 扩展后（8 Provider） |
|---|---|---|
| 第一次进入 settings | 看到 "DeepSeek" chip 与 apiKey 输入 | 看到 8 个 Provider 选项（默认选 DeepSeek 保持向后兼容），下方跟随渲染 |
| 输入 apiKey | 一个 input | 跟随当前 Provider 切换；切 Provider 不丢已存 Key |
| 选 model | 2 个 DeepSeek 模型 | 3-5 个当前 Provider 模型 |
| baseUrl | 有自定义入口 | OpenAI 兼容族保留；Anthropic / Gemini 隐藏 |
| 测试连接 | 调 deepseek.ping | 调当前 Provider.ping |
| AI 解读侧栏 | 永远走 deepseek | 走当前 activeProviderId 对应的 Provider |
| 切 Provider | 不可能 | 一键切，正在进行的对话被 abort，新对话走新 Provider |

## 附录 B · 8 家 API Key 申请链接（写入 i18n 用）

| Provider | 申请页 |
|---|---|
| OpenAI | <https://platform.openai.com/api-keys> |
| Anthropic | <https://console.anthropic.com/settings/keys> |
| Google Gemini | <https://aistudio.google.com/apikey> |
| DeepSeek | <https://platform.deepseek.com/api_keys> |
| 通义 Qwen | <https://bailian.console.aliyun.com/?apiKey=1> |
| Moonshot Kimi | <https://platform.moonshot.cn/console/api-keys> |
| 智谱 GLM | <https://open.bigmodel.cn/usercenter/apikeys> |
| xAI Grok | <https://console.x.ai/> |
