<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useLingqianStore } from '../stores/lingqianStore'
import type { LingqianTopicKey } from '../types'

/**
 * 起签输入卡：心中所问 + 占问领域 + 启签 / 再摇 按钮。
 * 沿用 ds-input-card 公共规范，两套主题。
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
        <label>{{ t('lingqian.input.questionLabel') }}</label>
        <input
          :value="lingqianStore.question"
          type="text"
          :placeholder="t('lingqian.input.questionPlaceholder')"
          @input="lingqianStore.setQuestion(($event.target as HTMLInputElement).value)"
        >
      </div>
      <div class="ds-input-group">
        <label>{{ t('lingqian.input.topicLabel') }}</label>
        <select
          :value="lingqianStore.preferredTopic"
          @change="lingqianStore.setPreferredTopic(($event.target as HTMLSelectElement).value as LingqianTopicKey)"
        >
          <option v-for="topic in TOPIC_OPTIONS" :key="topic" :value="topic">
            {{ t(`lingqian.topic.${topic}`) }}
          </option>
        </select>
      </div>
    </div>

    <p class="lq-input-hint">
      {{ t('lingqian.input.hintBefore') }}
      <strong>{{ t('lingqian.input.hintEmphasis') }}</strong>
      {{ t('lingqian.input.hintAfter') }}
    </p>

    <div class="ds-input-actions">
      <button type="button" class="gf-btn" @click="emit('paipan')">
        {{ t('lingqian.btn.paipanIcon') }} {{ t('lingqian.btn.paipan') }}
      </button>
      <button type="button" class="gf-btn gf-btn-outline" @click="emit('reset')">
        {{ t('lingqian.btn.resetIcon') }} {{ t('lingqian.btn.reset') }}
      </button>
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
        <label>{{ t('lingqian.input.questionLabel') }}</label>
        <input
          :value="lingqianStore.question"
          type="text"
          :placeholder="t('lingqian.input.questionPlaceholder')"
          @input="lingqianStore.setQuestion(($event.target as HTMLInputElement).value)"
        >
      </div>
      <div class="ds-input-group">
        <label>{{ t('lingqian.input.topicLabel') }}</label>
        <select
          :value="lingqianStore.preferredTopic"
          @change="lingqianStore.setPreferredTopic(($event.target as HTMLSelectElement).value as LingqianTopicKey)"
        >
          <option v-for="topic in TOPIC_OPTIONS" :key="topic" :value="topic">
            {{ t(`lingqian.topic.${topic}`) }}
          </option>
        </select>
      </div>
    </div>

    <p class="lq-input-hint">
      {{ t('lingqian.input.hintBefore') }}
      <strong>{{ t('lingqian.input.hintEmphasis') }}</strong>
      {{ t('lingqian.input.hintAfter') }}
    </p>

    <div class="ds-input-actions">
      <button type="button" class="mn-btn mn-btn-lg" @click="emit('paipan')">
        {{ t('lingqian.btn.paipan') }}
      </button>
      <button type="button" class="mn-btn mn-btn-outline" @click="emit('reset')">
        {{ t('lingqian.btn.reset') }}
      </button>
    </div>
  </div>
</template>
