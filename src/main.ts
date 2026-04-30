import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'
import { i18n } from './locales'
import { applyUrlBootstrap } from './composables/useUrlBootstrap'
import { FortuneError } from './lib/errors'
import { installChunkReloadGuard } from './lib/chunkReload'
import { installAnalytics } from './lib/analytics'

import './themes/_shared/tailwind.css'
import './themes/_shared/contracts.css'
import './themes/_shared/base.css'

applyUrlBootstrap()
installChunkReloadGuard()
installAnalytics()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

/**
 * 全局错误处理器（兜底）
 *
 * `<AppErrorBoundary>` 会通过 onErrorCaptured 拦截渲染期错误并展示友好页；
 * 这里只用于 Vue 自身没法 forward 给 boundary 的边角场景：
 *  - app 顶层（boundary 之外）的初始化错误
 *  - 被 boundary 处理后仍向上传的（return false 已抑制）
 *  - 一些 watcher / event handler 内异步错误
 *
 * 这里只 console，不再做 UI 二次降级，避免与 boundary 重复。
 */
app.config.errorHandler = (err, _instance, info) => {
  if (FortuneError.is(err)) {
    console.error(`[FortuneError@${err.module}:${err.code}] ${info}`, err)
  } else {
    console.error(`[VueGlobalError] ${info}`, err)
  }
}

app.mount('#app')
