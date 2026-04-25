/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

declare module '*.css'

declare module 'chinese-character-strokes' {
  const mod: {
    取笔顺?: (char: string) => string | null
    [key: string]: unknown
  }
  export default mod
  export const 取笔顺: (char: string) => string | null
}

declare module 'chinese-conv' {
  /** 简体 → 繁体 */
  export function tify(input: string): string
  /** 繁体 → 简体 */
  export function sify(input: string): string
  /** 繁体 JSON 转换（结构内文本字段同步处理） */
  export function tifyJson<T>(input: T): T
  const _default: { tify: typeof tify; sify: typeof sify; tifyJson: typeof tifyJson }
  export default _default
}
