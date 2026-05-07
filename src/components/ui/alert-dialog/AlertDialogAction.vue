<script setup lang="ts">
import type { AlertDialogActionProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { AlertDialogAction } from 'reka-ui'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = defineProps<AlertDialogActionProps & {
  class?: HTMLAttributes['class']
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}>()

const delegatedProps = reactiveOmit(props, 'class', 'variant')
</script>

<template>
  <AlertDialogAction
    data-slot="alert-dialog-action"
    v-bind="delegatedProps"
    :class="cn(buttonVariants({ variant: props.variant ?? 'default' }), props.class)"
  >
    <slot />
  </AlertDialogAction>
</template>
