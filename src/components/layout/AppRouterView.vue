<script setup lang="ts">
/**
 * `<RouterView>` 包装：用 `<Suspense>` 接管 lazy 路由组件的异步加载，
 * 让用户点击 tab 后立即看到 active 切换，加载期间显示 PageLoading fallback。
 *
 * 配套要求（`router/index.ts`）：
 *   - 路由 component 必须是 `defineAsyncComponent({ loader, ... })` 形式，
 *     而不是 `() => import(...)`。后者会让 vue-router 自己 await 组件解析后才
 *     finalize navigation；前者让 router 看到组件是同步存在的，立即 finalize，
 *     由 Suspense 接管异步渲染 fallback。
 *
 * KeepAlive：用户在 A 模块测算后切到 B 模块再切回 A，原本会因为 vue-router
 * 卸载/重挂载导致 page 实例被销毁、起卦/抽签结果丢失，需要重新点击"测算"。
 * KeepAlive 缓存已挂载的 page 实例，切回来 state 完整保留（result / skeleton /
 * 当前选中的 tab 等都在）。Suspense 在外层确保异步组件首次加载有 fallback；
 * 加载完成的实例由内层 KeepAlive 接管缓存。
 *
 * page 内部如有 setInterval / 异步定时器 / 网络订阅等副作用，请用 onActivated /
 * onDeactivated 启停 —— KeepAlive 下 onMounted/onBeforeUnmount 只在首次挂载和
 * 最终销毁时触发，跨切换不会触发。
 */
import PageLoading from './PageLoading.vue'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Suspense :timeout="0">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
      <template #fallback>
        <PageLoading />
      </template>
    </Suspense>
  </RouterView>
</template>
