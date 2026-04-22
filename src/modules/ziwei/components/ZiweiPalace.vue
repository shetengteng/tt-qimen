<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Palace } from '../types'

interface Props {
  palace: Palace
  /** 是否在 grid 内启用 slot 定位（仅桌面 4×4） */
  useSlot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  useSlot: false,
})

const { t } = useI18n()

const slotStyle = computed(() => {
  if (!props.useSlot) return undefined
  const slot = props.palace.slot
  const row = Math.floor((slot - 1) / 4) + 1
  const col = ((slot - 1) % 4) + 1
  return { gridArea: `${row} / ${col} / ${row + 1} / ${col + 1}` }
})

const palaceLabel = computed(() => {
  const name = t(`ziwei.palaceNames.${props.palace.key}`)
  return props.palace.isShen ? `${name} ${t('ziwei.shenSuffix')}` : name
})
</script>

<template>
  <div
    :class="['palace', {
      'ming-gong': palace.isMing,
      'shen-gong': palace.isShen,
    }]"
    :data-palace="palace.key"
    :style="slotStyle"
  >
    <div class="palace-head">
      <span :class="['palace-name', { ming: palace.isMing, shen: palace.isShen }]">
        {{ palaceLabel }}
      </span>
      <span class="palace-gz">{{ palace.ganzhi }}</span>
    </div>

    <div class="palace-stars">
      <div
        v-for="(s, idx) in palace.stars"
        :key="idx"
        class="star"
      >
        <span :class="[
          's-name',
          s.kind === 'main' ? 'star-main'
            : s.kind === 'malefic' ? 'star-malefic'
            : 'star-aux',
        ]">
          {{ s.name }}
        </span>
        <span v-if="s.brightness" class="star-bright">{{ s.brightness }}</span>
        <span v-if="s.sihua" :class="['star-sihua', `sihua-${s.sihua}`]">
          {{ t(`ziwei.sihuaShort.${s.sihua}`) }}
        </span>
      </div>
    </div>

    <div class="palace-foot">
      <span class="cs12">{{ palace.changsheng12 }}</span>
      <span class="liu">
        <template v-if="palace.daxianRange === '—'">—</template>
        <template v-else>{{ t('ziwei.daxianPrefix') }} {{ palace.daxianRange }}</template>
      </span>
    </div>
  </div>
</template>
