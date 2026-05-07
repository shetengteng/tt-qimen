<script setup lang="ts">
import type { AlertDialogTitleProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { AlertDialogTitle, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<AlertDialogTitleProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <AlertDialogTitle
    data-slot="alert-dialog-title"
    v-bind="forwardedProps"
    :class="cn('text-base leading-none font-medium cn-font-heading', props.class)"
  >
    <slot />
  </AlertDialogTitle>
</template>
