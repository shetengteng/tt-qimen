/**
 * 通用占卜模块异常类型
 *
 * 设计动机：
 *   - 原本各模块抛 `new Error('[xxx] ...')`，UI 层只能 try/catch 后用消息串判断错因
 *   - 文化娱乐类错误（数据空、输入格式错、超范围）通常要降级到"友好提示文案"
 *     而不是硬生生暴露 stack / message
 *   - 本类型为各模块统一的"业务错因"载体，附带：
 *       · `module`：错误所属模块（bazi / xingming / lingqian / chenggu / …）
 *       · `code`：细分错因枚举（如 'empty-dataset' / 'invalid-input' / 'out-of-range'）
 *       · `cause`：原始 Error（可选，保留调试上下文）
 *       · `userMessage`：可直接面向用户的友好消息（i18n 已在调用方处理过）
 *
 * 使用示例：
 *   ```ts
 *   if (!data.length) {
 *     throw new FortuneError({
 *       module: 'lingqian',
 *       code: 'empty-dataset',
 *       userMessage: '灵签数据为空，暂时无法求签',
 *     })
 *   }
 *   ```
 *
 * UI 层可用 `FortuneError.is(err)` 做类型守卫，以决定是展示 friendly message 还是 fallback。
 */

export type FortuneModule =
  | 'bazi'
  | 'ziwei'
  | 'xingming'
  | 'lingqian'
  | 'chenggu'
  | 'liuren'
  | 'jiemeng'
  | 'huangli'
  | 'common'

export type FortuneErrorCode =
  /** 数据集为空（JSON 加载失败、构建产物缺失等） */
  | 'empty-dataset'
  /** 用户输入格式错（非法字符、空值、不符合 schema） */
  | 'invalid-input'
  /** 输入超出支持范围（年份、笔画数、重量等） */
  | 'out-of-range'
  /** 依赖的子模块加载失败（动态 import、chunk 缺失） */
  | 'dep-load-failed'
  /** 内部不变量被打破（理论不该发生，表示 bug） */
  | 'invariant'
  /** 未分类 */
  | 'unknown'

export interface FortuneErrorOptions {
  module: FortuneModule
  code: FortuneErrorCode
  /** 给开发者看的技术消息（可省略，省略时自动生成 `[module:code]`） */
  message?: string
  /** 给最终用户看的友好消息（UI 降级时直接展示） */
  userMessage?: string
  /** 原始异常（如 JSON.parse 抛出的 SyntaxError） */
  cause?: unknown
  /** 任意附加调试字段（如出错时的输入值） */
  details?: Readonly<Record<string, unknown>>
}

export class FortuneError extends Error {
  readonly module: FortuneModule
  readonly code: FortuneErrorCode
  readonly userMessage?: string
  readonly details?: Readonly<Record<string, unknown>>

  constructor(opts: FortuneErrorOptions) {
    const message = opts.message ?? `[${opts.module}:${opts.code}]`
    super(message, opts.cause !== undefined ? { cause: opts.cause } : undefined)
    this.name = 'FortuneError'
    this.module = opts.module
    this.code = opts.code
    this.userMessage = opts.userMessage
    this.details = opts.details
  }

  /** 类型守卫：用于 UI 层在 try/catch 里区分"业务错"与"未知错" */
  static is(err: unknown): err is FortuneError {
    return err instanceof FortuneError
  }
}
