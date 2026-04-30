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
 * 抽成独立组件：App.vue 在桌面 / 桌面+AI / 移动端三种布局里都需要 `<RouterView>`，
 * 把 Suspense 模板封装一次避免三处重复。
 */
import PageLoading from './PageLoading.vue'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Suspense :timeout="0">
      <component :is="Component" />
      <template #fallback>
        <PageLoading />
      </template>
    </Suspense>
  </RouterView>
</template>
