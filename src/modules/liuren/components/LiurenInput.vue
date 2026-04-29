<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useLiurenStore } from '../stores/liurenStore'
import type { Aspect } from '../types'
import { HOUR_BRANCH_NAMES } from '../core/liuren'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

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

/** v-model 桥接：reka-ui Select 仅接受 string，数字型 hourIndex 需要 string<->number 转换 */
const aspectModel = computed<string>({
  get: () => liurenStore.aspect,
  set: (v) => liurenStore.setAspect(v as Aspect),
})
const hourIndexModel = computed<string>({
  get: () => String(liurenStore.custom.hourIndex),
  set: (v) => liurenStore.setCustom({ hourIndex: Number(v) }),
})

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

    <ToggleGroup
      type="single"
      :model-value="liurenStore.mode"
      class="ds-calendar-switch"
      @update:model-value="(v: any) => v && setMode(v as 'immediate' | 'custom')"
    >
      <ToggleGroupItem value="immediate">{{ t('liuren.input.modeImmediate') }}</ToggleGroupItem>
      <ToggleGroupItem value="custom">{{ t('liuren.input.modeCustom') }}</ToggleGroupItem>
    </ToggleGroup>

    <div class="ds-input-row lr-input-row">
      <div class="ds-input-group lr-question-group">
        <Label>{{ t('liuren.input.questionLabel') }}</Label>
        <input
          :value="liurenStore.question"
          type="text"
          :placeholder="t('liuren.input.questionPlaceholder')"
          @input="liurenStore.setQuestion(($event.target as HTMLInputElement).value)"
        >
      </div>
      <div class="ds-input-group">
        <Label>{{ t('liuren.input.aspectLabel') }}</Label>
        <Select v-model="aspectModel">
          <SelectTrigger>
            <SelectValue :placeholder="t('liuren.input.aspectLabel')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="a in ASPECTS" :key="a" :value="a">
              {{ t(`liuren.aspect.${a}`) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('liuren.input.hourLabel') }}</Label>
        <Select
          v-if="liurenStore.mode === 'immediate'"
          :model-value="'now'"
          disabled
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="now">
              {{ t('liuren.input.hourNowFmt', { name: currentHourLabel }) }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-else v-model="hourIndexModel">
          <SelectTrigger>
            <SelectValue :placeholder="t('liuren.input.hourLabel')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="h in HOUR_OPTIONS" :key="h.value" :value="String(h.value)">
              {{ h.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div v-if="liurenStore.mode === 'custom'" class="ds-input-row lr-input-row">
      <div class="ds-input-group">
        <Label>{{ t('liuren.input.monthLabel') }}</Label>
        <input
          :value="liurenStore.custom.month"
          type="number"
          min="1"
          max="12"
          @input="liurenStore.setCustom({ month: Number(($event.target as HTMLInputElement).value) })"
        >
      </div>
      <div class="ds-input-group">
        <Label>{{ t('liuren.input.dayLabel') }}</Label>
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
      <Button type="button" variant="default" size="lg" @click="emit('paipan')">
        {{ t('liuren.btn.paipanIcon') }} {{ t('liuren.btn.paipan') }}
      </Button>
      <Button type="button" variant="outline" @click="emit('reset')">
        {{ t('liuren.btn.resetIcon') }} {{ t('liuren.btn.reset') }}
      </Button>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="mn-card ds-input-card lr-input-card">
    <h3 class="ds-card-title">
      <span class="ds-ornament">◆</span>
      {{ t('liuren.input.title') }}
    </h3>

    <ToggleGroup
      type="single"
      :model-value="liurenStore.mode"
      class="ds-calendar-switch"
      @update:model-value="(v: any) => v && setMode(v as 'immediate' | 'custom')"
    >
      <ToggleGroupItem value="immediate">{{ t('liuren.input.modeImmediate') }}</ToggleGroupItem>
      <ToggleGroupItem value="custom">{{ t('liuren.input.modeCustom') }}</ToggleGroupItem>
    </ToggleGroup>

    <div class="ds-input-row lr-input-row">
      <div class="ds-input-group lr-question-group">
        <Label>{{ t('liuren.input.questionLabel') }}</Label>
        <input
          :value="liurenStore.question"
          type="text"
          :placeholder="t('liuren.input.questionPlaceholder')"
          @input="liurenStore.setQuestion(($event.target as HTMLInputElement).value)"
        >
      </div>
      <div class="ds-input-group">
        <Label>{{ t('liuren.input.aspectLabel') }}</Label>
        <Select v-model="aspectModel">
          <SelectTrigger>
            <SelectValue :placeholder="t('liuren.input.aspectLabel')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="a in ASPECTS" :key="a" :value="a">
              {{ t(`liuren.aspect.${a}`) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('liuren.input.hourLabel') }}</Label>
        <Select
          v-if="liurenStore.mode === 'immediate'"
          :model-value="'now'"
          disabled
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="now">
              {{ t('liuren.input.hourNowFmt', { name: currentHourLabel }) }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-else v-model="hourIndexModel">
          <SelectTrigger>
            <SelectValue :placeholder="t('liuren.input.hourLabel')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="h in HOUR_OPTIONS" :key="h.value" :value="String(h.value)">
              {{ h.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div v-if="liurenStore.mode === 'custom'" class="ds-input-row lr-input-row">
      <div class="ds-input-group">
        <Label>{{ t('liuren.input.monthLabel') }}</Label>
        <input
          :value="liurenStore.custom.month"
          type="number"
          min="1"
          max="12"
          @input="liurenStore.setCustom({ month: Number(($event.target as HTMLInputElement).value) })"
        >
      </div>
      <div class="ds-input-group">
        <Label>{{ t('liuren.input.dayLabel') }}</Label>
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
      <Button type="button" variant="default" size="lg" @click="emit('paipan')">
        {{ t('liuren.btn.paipan') }}
      </Button>
      <Button type="button" variant="outline" @click="emit('reset')">
        {{ t('liuren.btn.reset') }}
      </Button>
    </div>
  </div>
</template>
