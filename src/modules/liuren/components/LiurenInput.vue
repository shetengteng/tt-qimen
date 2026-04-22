<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useLiurenStore } from '../stores/liurenStore'
import type { Aspect } from '../types'
import { HOUR_BRANCH_NAMES } from '../core/liuren'

interface Props {
  /** 即时起卦模式下展示的"当前时辰"汉字 */
  currentHourLabel: string
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'paipan'): void
  (e: 'reset'): void
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const liurenStore = useLiurenStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const ASPECTS: readonly Aspect[] = ['overall', 'career', 'love', 'wealth', 'health', 'travel']

/** 时辰下拉的完整列表 —— 简约主题展示 12 条 */
const HOUR_OPTIONS = HOUR_BRANCH_NAMES.map((name, idx) => ({
  value: idx + 1,
  label: `${name}${t('liuren.input.hourSuffix')}`,
}))

function setMode(m: 'immediate' | 'custom') {
  liurenStore.setMode(m)
}
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="gf-card ds-input-card lr-input-card">
    <h3 class="ds-card-title">
      <span class="ds-ornament">◉</span>
      {{ t('liuren.input.title') }}
      <span class="ds-ornament">◉</span>
    </h3>

    <div class="ds-calendar-switch">
      <button
        type="button"
        class="ds-switch-btn"
        :class="{ active: liurenStore.mode === 'immediate' }"
        @click="setMode('immediate')"
      >{{ t('liuren.input.modeImmediate') }}</button>
      <button
        type="button"
        class="ds-switch-btn"
        :class="{ active: liurenStore.mode === 'custom' }"
        @click="setMode('custom')"
      >{{ t('liuren.input.modeCustom') }}</button>
    </div>

    <div class="ds-input-row lr-input-row">
      <div class="ds-input-group lr-question-group">
        <label>{{ t('liuren.input.questionLabel') }}</label>
        <input
          :value="liurenStore.question"
          type="text"
          :placeholder="t('liuren.input.questionPlaceholder')"
          @input="liurenStore.setQuestion(($event.target as HTMLInputElement).value)"
        >
      </div>
      <div class="ds-input-group">
        <label>{{ t('liuren.input.aspectLabel') }}</label>
        <select
          :value="liurenStore.aspect"
          @change="liurenStore.setAspect(($event.target as HTMLSelectElement).value as Aspect)"
        >
          <option v-for="a in ASPECTS" :key="a" :value="a">{{ t(`liuren.aspect.${a}`) }}</option>
        </select>
      </div>
      <div class="ds-input-group">
        <label>{{ t('liuren.input.hourLabel') }}</label>
        <select
          v-if="liurenStore.mode === 'immediate'"
          :value="0"
          disabled
        >
          <option :value="0">{{ t('liuren.input.hourNowFmt', { name: currentHourLabel }) }}</option>
        </select>
        <select
          v-else
          :value="liurenStore.custom.hourIndex"
          @change="liurenStore.setCustom({ hourIndex: Number(($event.target as HTMLSelectElement).value) })"
        >
          <option v-for="h in HOUR_OPTIONS" :key="h.value" :value="h.value">{{ h.label }}</option>
        </select>
      </div>
    </div>

    <div v-if="liurenStore.mode === 'custom'" class="ds-input-row lr-input-row">
      <div class="ds-input-group">
        <label>{{ t('liuren.input.monthLabel') }}</label>
        <input
          :value="liurenStore.custom.month"
          type="number"
          min="1"
          max="12"
          @input="liurenStore.setCustom({ month: Number(($event.target as HTMLInputElement).value) })"
        >
      </div>
      <div class="ds-input-group">
        <label>{{ t('liuren.input.dayLabel') }}</label>
        <input
          :value="liurenStore.custom.day"
          type="number"
          min="1"
          max="30"
          @input="liurenStore.setCustom({ day: Number(($event.target as HTMLInputElement).value) })"
        >
      </div>
    </div>

    <div class="ds-input-actions">
      <button type="button" class="gf-btn" @click="emit('paipan')">
        {{ t('liuren.btn.paipanIcon') }} {{ t('liuren.btn.paipan') }}
      </button>
      <button type="button" class="gf-btn gf-btn-outline" @click="emit('reset')">
        {{ t('liuren.btn.resetIcon') }} {{ t('liuren.btn.reset') }}
      </button>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="mn-card ds-input-card lr-input-card">
    <h3 class="ds-card-title">
      <span class="ds-ornament">◆</span>
      {{ t('liuren.input.title') }}
    </h3>

    <div class="ds-calendar-switch">
      <button
        type="button"
        class="ds-switch-btn"
        :class="{ active: liurenStore.mode === 'immediate' }"
        @click="setMode('immediate')"
      >{{ t('liuren.input.modeImmediate') }}</button>
      <button
        type="button"
        class="ds-switch-btn"
        :class="{ active: liurenStore.mode === 'custom' }"
        @click="setMode('custom')"
      >{{ t('liuren.input.modeCustom') }}</button>
    </div>

    <div class="ds-input-row lr-input-row">
      <div class="ds-input-group lr-question-group">
        <label>{{ t('liuren.input.questionLabel') }}</label>
        <input
          :value="liurenStore.question"
          type="text"
          :placeholder="t('liuren.input.questionPlaceholder')"
          @input="liurenStore.setQuestion(($event.target as HTMLInputElement).value)"
        >
      </div>
      <div class="ds-input-group">
        <label>{{ t('liuren.input.aspectLabel') }}</label>
        <select
          :value="liurenStore.aspect"
          @change="liurenStore.setAspect(($event.target as HTMLSelectElement).value as Aspect)"
        >
          <option v-for="a in ASPECTS" :key="a" :value="a">{{ t(`liuren.aspect.${a}`) }}</option>
        </select>
      </div>
      <div class="ds-input-group">
        <label>{{ t('liuren.input.hourLabel') }}</label>
        <select
          v-if="liurenStore.mode === 'immediate'"
          :value="0"
          disabled
        >
          <option :value="0">{{ t('liuren.input.hourNowFmt', { name: currentHourLabel }) }}</option>
        </select>
        <select
          v-else
          :value="liurenStore.custom.hourIndex"
          @change="liurenStore.setCustom({ hourIndex: Number(($event.target as HTMLSelectElement).value) })"
        >
          <option v-for="h in HOUR_OPTIONS" :key="h.value" :value="h.value">{{ h.label }}</option>
        </select>
      </div>
    </div>

    <div v-if="liurenStore.mode === 'custom'" class="ds-input-row lr-input-row">
      <div class="ds-input-group">
        <label>{{ t('liuren.input.monthLabel') }}</label>
        <input
          :value="liurenStore.custom.month"
          type="number"
          min="1"
          max="12"
          @input="liurenStore.setCustom({ month: Number(($event.target as HTMLInputElement).value) })"
        >
      </div>
      <div class="ds-input-group">
        <label>{{ t('liuren.input.dayLabel') }}</label>
        <input
          :value="liurenStore.custom.day"
          type="number"
          min="1"
          max="30"
          @input="liurenStore.setCustom({ day: Number(($event.target as HTMLInputElement).value) })"
        >
      </div>
    </div>

    <div class="ds-input-actions">
      <button type="button" class="mn-btn mn-btn-lg" @click="emit('paipan')">
        {{ t('liuren.btn.paipan') }}
      </button>
      <button type="button" class="mn-btn mn-btn-outline" @click="emit('reset')">
        {{ t('liuren.btn.reset') }}
      </button>
    </div>
  </div>
</template>
