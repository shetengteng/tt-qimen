<script setup lang="ts">
import { useUrlSync } from '@/composables/useUrlSync'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

useUrlSync()
</script>

<template>
  <AppHeader />
  <RouterView />
  <AppFooter />
</template>
