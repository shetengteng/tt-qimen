<script setup lang="ts">
import { ConfigProvider } from 'reka-ui'
import { useUrlSync } from '@/composables/useUrlSync'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

useUrlSync()
</script>

<template>
  <!--
    scrollBody=false：关闭 reka-ui 默认的"打开 popper 时给 body 追加 padding-right"行为。
    我们已通过 html { scrollbar-gutter: stable } 永久预留滚动条通道，reka-ui 的补偿会叠加
    成负向偏移导致整页抖动，这里显式关闭。
  -->
  <ConfigProvider :scroll-body="false">
    <AppHeader />
    <RouterView />
    <AppFooter />
  </ConfigProvider>
</template>
