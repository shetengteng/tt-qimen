<script setup lang="ts">
import { useUrlSync } from '@/composables/useUrlSync'
import AppHeader from '@/components/layout/AppHeader.vue'

useUrlSync()
</script>

<template>
  <AppHeader />
  <RouterView />
</template>
