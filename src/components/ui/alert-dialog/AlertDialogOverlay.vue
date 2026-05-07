<script setup lang="ts">
import type { AlertDialogOverlayProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { AlertDialogOverlay } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<AlertDialogOverlayProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <AlertDialogOverlay
    data-slot="alert-dialog-overlay"
    v-bind="delegatedProps"
    :class="cn('data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50', props.class)"
  >
    <slot />
  </AlertDialogOverlay>
</template>
