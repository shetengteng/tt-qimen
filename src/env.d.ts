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
