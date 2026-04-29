<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useLingqianStore } from '../stores/lingqianStore'
import type { LingqianTopicKey } from '../types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

/**
 * 起签输入卡：心中所问 + 占问领域 + 启签 / 再摇 按钮。
 * 下拉组件对齐 BirthForm（shadcn-vue Select），保持全站统一视觉。
 */
const emit = defineEmits<{
  (e: 'paipan'): void
  (e: 'reset'): void
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const lingqianStore = useLingqianStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const TOPIC_OPTIONS: readonly LingqianTopicKey[] = [
  'overall',
  'career',
  'marriage',
  'wealth',
  'health',
  'travel',
  'family',
]

/**
 * 限流温和提示：每 10 次抽签提醒一次"心诚则灵，勿频繁"。
 * 阈值设计：drawCount 大于 0 且能被 10 整除 → 显示；下一次 draw 后 %10=1，提示即自动隐藏。
 * 这样既不阻塞用户、也不打扰，在"刚过整数次"时温和出现 1 条。
 */
const rateLimitHint = computed(() => {
  const n = lingqianStore.drawCount
  if (n > 0 && n % 10 === 0) return n
  return 0
})

/** v-model 桥接：reka-ui Select 仅接受 string；此处与 store 直接双向同步 */
const topicModel = computed<LingqianTopicKey>({
  get: () => lingqianStore.preferredTopic,
  set: (v) => lingqianStore.setPreferredTopic(v as LingqianTopicKey),
})
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="gf-card ds-input-card lq-input-card">
    <h3 class="ds-card-title">
      <span class="ds-ornament">◈</span>
      {{ t('lingqian.input.title') }}
      <span class="ds-ornament">◈</span>
    </h3>

    <div class="ds-input-row" style="grid-template-columns: 2fr 1fr;">
      <div class="ds-input-group">
        <Label>{{ t('lingqian.input.questionLabel') }}</Label>
        <input
          :value="lingqianStore.question"
          type="text"
          :placeholder="t('lingqian.input.questionPlaceholder')"
          @input="lingqianStore.setQuestion(($event.target as HTMLInputElement).value)"
        >
      </div>
      <div class="ds-input-group">
        <Label>{{ t('lingqian.input.topicLabel') }}</Label>
        <Select v-model="topicModel">
          <SelectTrigger>
            <SelectValue :placeholder="t('lingqian.input.topicLabel')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="topic in TOPIC_OPTIONS" :key="topic" :value="topic">
              {{ t(`lingqian.topic.${topic}`) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <p class="lq-input-hint">
      {{ t('lingqian.input.hintBefore') }}
      <strong>{{ t('lingqian.input.hintEmphasis') }}</strong>
      {{ t('lingqian.input.hintAfter') }}
    </p>

    <p v-if="rateLimitHint > 0" class="lq-rate-limit-hint" role="note">
      {{ t('lingqian.input.rateLimit', { count: rateLimitHint }) }}
    </p>

    <div class="ds-input-actions">
      <Button type="button" variant="default" size="lg" @click="emit('paipan')">
        {{ t('lingqian.btn.paipanIcon') }} {{ t('lingqian.btn.paipan') }}
      </Button>
      <Button type="button" variant="outline" @click="emit('reset')">
        {{ t('lingqian.btn.resetIcon') }} {{ t('lingqian.btn.reset') }}
      </Button>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="mn-card ds-input-card lq-input-card">
    <h3 class="ds-card-title">
      <span class="ds-ornament">◆</span>
      {{ t('lingqian.input.title') }}
    </h3>

    <div class="ds-input-row" style="grid-template-columns: 2fr 1fr;">
      <div class="ds-input-group">
        <Label>{{ t('lingqian.input.questionLabel') }}</Label>
        <input
          :value="lingqianStore.question"
          type="text"
          :placeholder="t('lingqian.input.questionPlaceholder')"
          @input="lingqianStore.setQuestion(($event.target as HTMLInputElement).value)"
        >
      </div>
      <div class="ds-input-group">
        <Label>{{ t('lingqian.input.topicLabel') }}</Label>
        <Select v-model="topicModel">
          <SelectTrigger>
            <SelectValue :placeholder="t('lingqian.input.topicLabel')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="topic in TOPIC_OPTIONS" :key="topic" :value="topic">
              {{ t(`lingqian.topic.${topic}`) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <p class="lq-input-hint">
      {{ t('lingqian.input.hintBefore') }}
      <strong>{{ t('lingqian.input.hintEmphasis') }}</strong>
      {{ t('lingqian.input.hintAfter') }}
    </p>

    <p v-if="rateLimitHint > 0" class="lq-rate-limit-hint" role="note">
      {{ t('lingqian.input.rateLimit', { count: rateLimitHint }) }}
    </p>

    <div class="ds-input-actions">
      <Button type="button" variant="default" size="lg" @click="emit('paipan')">
        {{ t('lingqian.btn.paipan') }}
      </Button>
      <Button type="button" variant="outline" @click="emit('reset')">
        {{ t('lingqian.btn.reset') }}
      </Button>
    </div>
  </div>
</template>
