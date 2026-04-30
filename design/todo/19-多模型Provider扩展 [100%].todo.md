# 19 · 多模型 Provider 扩展 · TODO（功能视角）· 100%

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
| 1 | **Provider 注册表** | 全部 8 个 Provider 的 `ProviderDescriptor` 列表（id / displayName i18n / homepage / docsUrl / defaultBaseUrl / models / defaultModel） | `[x]` ✅ | `src/composables/ai/providers/registry.ts` | — |
| 2 | **OpenAI 兼容通用 provider** | `createOpenAiCompatibleProvider(opts)` 工厂；deepseek/openai/qwen/moonshot/zhipu/xai 6 家共用 | `[x]` ✅ | `src/composables/ai/providers/openaiCompatible.ts` + 6 个 instance 文件 | `openai` SDK（已装） |
| 3 | **Anthropic Provider** | 走 `@anthropic-ai/sdk@0.91.1`，独立 `streamChat` + `ping`；`convertMessagesToAnthropic` 把第一条 system 提到顶层、保留 user/assistant 顺序、二次 system 降级为 user | `[x]` ✅ | `src/composables/ai/providers/anthropic.ts` | `@anthropic-ai/sdk@0.91.1` |
| 4 | **Gemini Provider** | 走 `@google/genai@1.51.0`，独立 `streamChat` + `ping`；`convertMessagesToGemini` 把 system 拼到 systemInstruction、assistant→model、user→user，contents 包成 `{ role, parts: [{ text }] }` | `[x]` ✅ | `src/composables/ai/providers/gemini.ts` | `@google/genai@1.51.0` |
| 5 | **AiConfig 重构（多 provider 配置）** | `AiUserConfig` 多 provider 持久化 + 扁平 `AiConfig` 投影保持 LlmProvider 接口零变化；切 Provider 不丢其它家 Key | `[x]` ✅ | `src/composables/ai/types.ts` + `src/stores/aiConfig.ts` | — |
| 6 | **Settings UI · Provider 切换器** | 8 个 Provider 按"国际/国内"分组渲染 Button grid，aria-pressed 反映 activeProviderId；切换后下方 apiKey + model + baseUrl 区域 reactive 刷新 | `[x]` ✅ | `src/modules/settings/SettingsPage.vue` AI 段 | — |
| 7 | **Settings UI · 每 Provider 独立 apiKey** | apiKey 输入框跟随当前选中 Provider；切回某 Provider 自动回显（store 已 perProvider 隔离存储）；右上角"获取 API Key →"链接指向 `currentProvider.apiKeyDocsUrl`，target=_blank | `[x]` ✅ | `SettingsPage.vue` | — |
| 8 | **Settings UI · 模型选择器（按 Provider）** | model grid 改读 `currentProvider.models.filter(!deprecated)`；每条 model 描述由 `modelTagLine(tags)` 拼接 i18n tag 翻译（"快速 · 便宜" / "思维链 · 编码" 等）| `[x]` ✅ | `SettingsPage.vue` | — |
| 9 | **Settings UI · baseUrl 自定义** | baseUrl 区改为 `v-if="canCustomBaseUrl"` 的条件渲染（`isOpenAiCompatible(activeId)` 判定）；placeholder 改为 `currentProvider.defaultBaseUrl`，恢复默认按钮保留；Anthropic / Gemini 隐藏整段 | `[x]` ✅ | `SettingsPage.vue` | — |
| 10 | **测试连接按钮（多 provider）** | 由 hardcode `deepseekProvider.ping` 改为 `getProvider(aiConfig.activeProviderId).ping(aiConfig.config)`；切 Provider 时主动重置 `testState` 为 idle | `[x]` ✅ | `SettingsPage.vue` | #1, #2, #3, #4 |
| 11 | **AiSidebarPanel 切 Provider 自适应** | `providerRef` 由 `shallowRef(deepseekProvider)` 改为 `computed(() => getProvider(aiConfig.activeProviderId))`；额外 watch `activeProviderId` 在 streaming 时主动 abort，避免新旧 Provider 流混合 | `[x]` ✅ | `src/components/ai/AiSidebarPanel.vue` | #1 |
| 12 | **DEEPSEEK_MODELS 重命名 + 扩展** | 从 PROVIDERS.deepseek.models 派生为 deprecated alias，保留只为不破坏现有 `import { DEEPSEEK_MODELS }`；新 Provider 的 model 列表通过 `PROVIDERS[id].models` 读取，无需新增导出 | `[x]` ✅ | `src/composables/ai/types.ts` | — |
| 13 | **错误码扩展** | `toLlmError` 增加 3 条多 Provider 兼容路径：(1) 嵌套 `error.status` 数字/字符串（Anthropic 部分版本）(2) message 前缀 `[NNN ...]` 提取（Gemini @google/genai 风格）；OpenAI 协议族顶层 `status` 已被原逻辑覆盖；新增 6 个单元测试用例 | `[x]` ✅ | `src/composables/ai/errors.ts` + `errors.spec.ts` | #3, #4 |
| 14 | **i18n · Provider 名称 + tagline 三语** | 8 个 Provider 三语 tagline（一句话定位）+ 国际/国内分组标签 + 通用"获取 API Key →"链接 + apiKey 通用 placeholder/hint；显示名 `displayName` 复用 registry.ts，三语 i18n 文件不重复维护 | `[x]` ✅ | `src/locales/modules/settings.{zh-CN,zh-TW,en}.ts` `section.ai.providerOption/Category/DocsCta/Hint` | — |
| 15 | **i18n · Model tag 三语** | 6 个 ModelTag 通用翻译（思维链/快速/便宜/长上下文/多模态/编码）× 3 语；模板按 `modelTagLine(tags)` 拼接，~28 条主流 model 不再各自 i18n | `[x]` ✅ | `src/locales/modules/settings.{zh-CN,zh-TW,en}.ts` `section.ai.model.tag.*` | — |
| 16 | **隐私页 Provider 列表更新** | `/privacy` 第 8 段三语全部重写：列出 8 家可选 Provider（按国际/国内分两批）+ 强调"切换 Provider 不会清空其它已配 Key"；设置页"隐私与安全"小段同步更新（DeepSeek → 当前选中 Provider 的官方 endpoint） | `[x]` ✅ | `src/locales/{zh-CN,zh-TW,en}.ts` `privacyPage.sections[7]` + `src/locales/modules/settings.{lang}.ts` `section.privacy.items` | — |
| 17 | **README 更新** | `README.md` + `README.en.md` 三处更新：(1) 顶部 features 段加"8 家 Provider 任选 + 按 Provider 独立 BYOK"(2) AI 段加完整支持矩阵（分组 / 协议 / 推荐场景 8 行）+ 4 步启用流程(3) 致谢段拆出 8 个 Provider 官方控制台链接 + 3 个 SDK GitHub 链接 | `[x]` ✅ | `README.md` / `README.en.md` | 全部完成后做 |

---

## 3. 实施阶段（按依赖顺序，建议 4 个 Phase）

### Phase 1 — 类型与配置层重构 · ~0.5 天

> 目标：先把 `AiConfig` 多 provider 化，store 升级，**保持当前 DeepSeek 单一 provider 行为不变**。
> **决策（2026-04-30 用户）**：项目尚未公开使用，**不做旧版 storage migration**；老用户（即开发者本人）重新填写 Key 即可。`localStorage` 旧格式直接被新结构覆盖。

- [x] ✅ P1-01 写 `src/composables/ai/providers/registry.ts`：导出 `ProviderId` union + `ProviderDescriptor` interface + `PROVIDERS: Record<ProviderId, ProviderDescriptor>`（8 家完整 metadata：displayName 三语 / homepage / apiKeyDocsUrl / defaultBaseUrl / allowCustomBaseUrl / models / defaultModelId / group）+ `sanitizeModelId` 兜底（同时拒绝 deprecated:true 的 model）
- [x] ✅ P1-02 重写 `src/composables/ai/types.ts`：
    - 保留 `AiConfig` 扁平 4 字段语义（apiKey + baseUrl + model + temperature）让 LlmProvider 接口零变化
    - 新增 `AiUserConfig`（`{ activeProviderId, temperature, perProvider: Record<ProviderId, ProviderUserConfig> }`）作为持久化结构
    - 新增 `projectRequestConfig(user) -> AiConfig` 投影函数（baseUrl/model 兜底）
    - 旧 `DEEPSEEK_MODELS` / `DEPRECATED_DEEPSEEK_MODEL_IDS` / `DEFAULT_AI_CONFIG` 保留为 deprecated alias，从 PROVIDERS.deepseek.models 派生
- [x] ✅ P1-03 重写 `src/stores/aiConfig.ts`：
    - useStorage 默认值改为 `DEFAULT_AI_USER_CONFIG`；启动 `sanitizeUserConfig` 修正 activeProviderId / model / temperature 三类残留
    - 新增 `setActiveProvider(id)`；`setApiKey / setModel / setBaseUrl / clearKeyOnly` 操作的是当前 activeProvider
    - `setTemperature` 操作顶层共享 temperature
    - `config` computed 暴露当前 activeProvider 的扁平 AiConfig（**关键：保持向后兼容**，AiSidebarPanel/SettingsPage 现有 `aiConfig.config.xxx` 用法零改动）
    - 新增 `userConfig` / `currentProviderConfig` / `activeProviderId` 给设置页的 Provider 切换 UI（Phase 3）
- [x] ✅ P1-04 单元测试 `aiConfig.spec.ts`：19 个用例全过 — 默认状态（4）/ 切 Provider 不丢 Key（2）/ 模型 sanitize 含 deprecated（3）/ baseUrl 默认兜底（4）/ temperature 跨 Provider 共享（2）/ clearKeyOnly + reset（2）/ apiKey trim（1）/ 非法 activeProviderId 兜底（1）

### Phase 2 — Provider 实现 · ~1 天

> 目标：8 个 Provider 全部接入，`registry.ts` 真正可用；现有 `deepseek.ts` 改造为 OpenAI 兼容工厂的实例。

- [x] ✅ P2-01 写 `src/composables/ai/providers/openaiCompatible.ts`：
    - `createOpenAiCompatibleProvider({ id, shouldDisableThinking?, consumeReasoningContent? })` 工厂函数
    - 复用 thinking 处理逻辑（仅对支持 thinking 的 provider+model 启用 extra_body）
- [x] ✅ P2-02 重构 `src/composables/ai/providers/deepseek.ts`：调 `createOpenAiCompatibleProvider({ id: 'deepseek', shouldDisableThinking: m => /flash/i.test(m), consumeReasoningContent: true })`，行为零变化（diff 119 → 25 行）
- [x] ✅ P2-03 创建 `openai.ts` / `qwen.ts` / `moonshot.ts` / `zhipu.ts` / `xai.ts`：均为 `createOpenAiCompatibleProvider` 实例（每个 5-8 行）
- [x] ✅ P2-04 安装 `@anthropic-ai/sdk@0.91.1` 并写 `anthropic.ts`：
    - `convertMessagesToAnthropic` 把第一条 system 提到顶层 `system` 字段（多余 system 降级为 user）
    - `client.messages.create({ stream: true })` → `for await` `content_block_delta` 事件 → yield `delta.text`
    - `dangerouslyAllowBrowser: true` + `max_tokens: 4096`（Anthropic API 必填）
- [x] ✅ P2-05 安装 `@google/genai@1.51.0` 并写 `gemini.ts`：
    - `GoogleGenAI({ apiKey, httpOptions: { baseUrl } })` 客户端
    - `convertMessagesToGemini` 把 system 拼接到 `config.systemInstruction`，assistant→model，user→user，content → `{ role, parts: [{ text }] }`
    - `client.models.generateContentStream(...)` 流式 yield 每个 chunk 的 `.text`
- [x] ✅ P2-06 + P2-07 新建 `src/composables/ai/providers/index.ts`：`PROVIDER_INSTANCES: Record<ProviderId, LlmProvider>` + `getProvider(id)` 兜底
- [x] ✅ P2-08 单元测试 `messageConversion.spec.ts`（12 用例，全过）：covers Anthropic 第一条 system 提取 / 多 system 降级 / hidden message 透传 / 空数组安全；Gemini systemInstruction 多 system 拼接 / role rename / 空 content 跳过 / 无 system 输出 undefined / 文本完整保留

### Phase 3 — UI 与上下游接入 · ~0.5 天

> 目标：Settings 页可视化切换 + AiSidebarPanel 透明切换 Provider。

- [x] ✅ P3-01 `registry.ts` 加 `isOpenAiCompatible(id)` helper（仅看 protocol，独立于 `allowCustomBaseUrl` 策略字段）
- [x] ✅ P3-02 三语 i18n 扩展 `settings.{zh-CN,zh-TW,en}.ts`：
    - 8 个 `providerOption.<id>` tagline（"中文性价比首选"/"全球开发者首选"/"原生多模态"等）
    - `providerCategory.{international,domestic}` 分组 label
    - `providerDocsCta` "获取 API Key →" 通用链接文案
    - `providerHint` 切 Provider 不丢 Key 提示
    - 6 个 `model.tag.{thinking,fast,cheap,longContext,multimodal,coding}` 通用 tag 翻译
    - apiKey placeholder / hint 通用化（不再 DeepSeek-specific 的 "sk- 开头"）
    - baseUrl placeholder 改 "留空使用默认 endpoint"，hint 加"仅 OpenAI 协议族"提示
- [x] ✅ P3-03 `ai-i18n-completeness.spec.ts` 守门更新：8 ProviderOption + 2 Category + 6 Tag + 2 通用文案 = +18 条 × 3 语共 +54 测试用例（vitest 526 全过）
- [x] ✅ P3-04 `SettingsPage.vue` AI 段顶部 Provider 选择 grid：按 international / domestic 分组渲染 2×N grid，aria-pressed 反映 activeProviderId；点击调 `selectProvider(id)`（同时重置 testState）
- [x] ✅ P3-05 model grid + baseUrl + testConnection 多 Provider 化：
    - model grid 改读 `currentProvider.models.filter(!deprecated)`，描述用 `modelTagLine(tags)` 拼接
    - baseUrl 区 `v-if="canCustomBaseUrl"`，placeholder 用 `currentProvider.defaultBaseUrl`
    - testConnection 改用 `getProvider(aiConfig.activeProviderId).ping(aiConfig.config)`
    - "获取 API Key →" 链接 `:href="currentProvider.apiKeyDocsUrl"` target=_blank
    - API Key label 加 "· {provider 名}" 后缀，让用户清楚正在配哪家
- [x] ✅ P3-06 `AiSidebarPanel.vue` providerRef 多 Provider 化：
    - `providerRef = computed(() => getProvider(aiConfig.activeProviderId))`，自动随 store 切换
    - 新增 `watch(activeProviderId)` 在 streaming 时主动 `chat.stop()`，避免新旧 Provider stream 混合
- [x] ✅ P3-07 验证全绿：vue-tsc 0 错；vitest 526 passed / 1 skipped；vite build 6.77s；`feat-ai` chunk 从 ~340KB 涨到 634KB（gz 171KB）— 三个 SDK 进 chunk 是预期，仍懒加载，首屏零增量
- [x] ✅ P3-08 dev server smoke（minimal 主题）：切 Anthropic→DeepSeek 时 API Key 标签 / docs 链接 / model grid（3 Claude → 2 DeepSeek）/ Base URL input（Anthropic 隐藏 → DeepSeek 显示）全部正确 reactive 切换

### Phase 4 — i18n 与文档收尾 · ~0.5 天

- [x] ✅ P4-01 三语 `settings.section.ai.providerOption.*` 扩展：8 个 Provider tagline（一句话定位）— 已在 Phase 3 P3-02 完成
- [x] ✅ P4-02 三语 `settings.section.ai.providerCategory.*`：分组 label（`international` / `domestic`）— 已在 Phase 3 P3-02 完成（Combobox 阶段虽然 UI 不再分组，但 i18n 保留以备将来）
- [x] ✅ P4-03 三语 model 描述：用 `model.tag.*` 通用翻译 + `modelTagLine(tags)` 拼接代替原计划的 ~28 条 model-specific 描述，工作量从 28×3=84 降到 6×3=18 条；视觉上每条 model 仍能显示 "快速 · 思维链" 这类描述
- [x] ✅ P4-04 三语 `settings.section.ai.providerDocsCta`：通用"获取 API Key →" 链接 label — 已在 Phase 3 P3-02 完成
- [x] ✅ P4-05 隐私页 `/privacy` 第 8 段三语全部重写：开篇改为"支持 8 家主流 Provider 自选切换 + BYOK 模式"；列表 7 条覆盖 Provider 列表 / 独立存 Key / 直发官方 endpoint / payload 不含 PII / 各家隐私政策 / 对话历史本地化 / 自由咨询不持久化
- [x] ✅ P4-06 设置页 `section.privacy.items` 三语同步：DeepSeek → "当前选中 Provider 的官方 endpoint"；新增"每家 Provider 独立保存"
- [x] ✅ P4-07 `README.md` AI 段重写：features 列加 "8 家 Provider 任选"；架构表格加 anthropic-sdk + @google/genai；AI 段加完整支持矩阵（分组 / 协议 / 推荐场景 8 行）；启用流程改 4 步（含搜索下拉、独立存 Key 提示）；致谢拆出 8 个 Provider 官方链接 + 3 个 SDK GitHub 链接
- [x] ✅ P4-08 `README.en.md` 同步：相同 8 段更新
- [x] ✅ P4-09 `i18n-completeness.spec.ts` 守门：8 ProviderOption + 2 Category + 6 Tag + 2 通用 + Combobox 阶段加的 providerSearchPlaceholder + providerEmpty = 共 +20 条 × 3 语 = 60 个新测试用例，全部通过

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
| Phase 1 — 类型与配置层重构 | `[x]` ✅ | 2026-04-30 | registry + types + store + 19 单元测试；vue-tsc 0 错；vitest 463/0；vite build 5.88s 通过；行为对外零变化 |
| Phase 2 — Provider 实现 | `[x]` ✅ | 2026-04-30 | openaiCompatible 工厂 + 8 个 instance + index.ts 聚合 + 12 conversion 测试；vue-tsc 0 错；vitest 475/0；vite build 5.51s；feat-ai chunk tree-shake 后 SDK 暂未进入 bundle（等 Phase 3 接入 UI 后才会被引用）|
| Phase 3 — UI 与上下游接入 | `[x]` ✅ | 2026-04-30 | SettingsPage 8-Provider grid → Select → **Combobox**（用户两轮反馈优化：先改 Select 节省空间，再改 Combobox 加搜索 + 去分组） + 模型/Base URL reactive 联动 + "获取 API Key →" 链接 + AiSidebarPanel providerRef 改 computed + 切换时 abort streaming；shadcn-vue popover/command/input-group/dialog 4 个组件通过 CLI 接入；vue-tsc 0 错；vitest 532/1 skipped；vite build 6.40s；`feat-ai` chunk 645KB / 175KB gz（bundle-budget 调到 200KB） |
| Phase 4 — i18n 与文档收尾 | `[x]` ✅ | 2026-04-30 | 隐私页第 8 段三语重写（DeepSeek 单一 → 8 Provider 自选）；设置页"隐私与安全"三语同步；errors.ts toLlmError 扩展 Anthropic 嵌套 status / Gemini 前缀 message 提取（+6 测试）；README.md + README.en.md AI 段重写（features / 架构表 / 支持矩阵 / 启用流程 / 致谢链接）；vitest 538/1 skipped；vite build 6.71s |

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
