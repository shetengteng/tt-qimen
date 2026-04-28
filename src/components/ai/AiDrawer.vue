<script setup lang="ts">
/**
 * AI 解读 Drawer · 右侧抽屉骨架（P3.A 阶段）
 *
 * 当前阶段功能：
 *   - 右侧 Sheet 容器（双主题样式由 shadcn-vue [data-theme] 接管）
 *   - 渲染 Header（标题 + 关闭由 SheetContent 自带 X icon 提供）
 *   - hasKey === false → EmptyKeyState：跳设置 CTA + 隐私提示
 *   - hasKey === true  → "Coming soon" 占位（P3.B 接入完整聊天 UI 时替换）
 *
 * 后续 P3.B 接入：
 *   - useAiChat（流式 + abort）
 *   - ChatMessageList（vue-virtual-scroller + markstream-vue + Pretext.js）
 *   - ChatInput（textarea + send/stop）
 *   - 预设 prompt chips
 *   - sticky-bottom 滚动行为
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Lock, Sparkles, ArrowRight } from 'lucide-vue-next'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useAiConfigStore } from '@/stores/aiConfig'
import type { ModuleId } from '@/router'

const props = defineProps<{
  open: boolean
  moduleId: ModuleId
  /** 命盘对象（每模块结构不同；P3.A 仅作 future props 占位，未消费） */
  chart?: unknown
  /** 用户上下文（姓名 / 性别等） */
  userContext?: {
    name?: string
    gender?: 'male' | 'female'
  }
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { t } = useI18n()
const router = useRouter()
const aiConfig = useAiConfigStore()

const openModel = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

function goSettings() {
  emit('update:open', false)
  router.push({ name: 'settings' })
}
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent
      side="right"
      class="flex w-full flex-col gap-0 sm:max-w-md md:max-w-lg"
    >
      <SheetHeader class="border-b border-border px-6 py-4">
        <SheetTitle class="flex items-center gap-2 text-base">
          <Sparkles class="size-4 text-primary" aria-hidden="true" />
          {{ t('ai.drawer.title') }}
        </SheetTitle>
        <SheetDescription class="sr-only">
          {{ t('ai.askButtonAria') }}
        </SheetDescription>
      </SheetHeader>

      <div class="flex flex-1 flex-col overflow-y-auto">
        <!-- Empty Key State -->
        <div
          v-if="!aiConfig.hasKey"
          class="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center"
        >
          <div class="rounded-full bg-muted p-4">
            <Lock class="size-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <div class="space-y-2">
            <h3 class="text-base font-semibold text-foreground">
              {{ t('ai.drawer.emptyKey.title') }}
            </h3>
            <p class="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {{ t('ai.drawer.emptyKey.body') }}
            </p>
          </div>
          <Button variant="default" class="mt-2" @click="goSettings">
            {{ t('ai.drawer.emptyKey.cta') }}
            <ArrowRight class="size-4" aria-hidden="true" />
          </Button>
          <p class="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
            {{ t('ai.drawer.emptyKey.privacyNote') }}
          </p>
        </div>

        <!-- Has Key — P3.A 占位（P3.B 替换为完整聊天 UI） -->
        <div
          v-else
          class="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center"
        >
          <div class="rounded-full bg-primary/10 p-4">
            <Sparkles class="size-6 text-primary" aria-hidden="true" />
          </div>
          <div class="space-y-2">
            <h3 class="text-base font-semibold text-foreground">
              {{ t('ai.drawer.title') }}
            </h3>
            <p class="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Coming soon · {{ props.moduleId }}
            </p>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
