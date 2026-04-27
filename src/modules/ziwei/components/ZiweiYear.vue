<script setup lang="ts">
/**
 * 流年卡（M2 §11）
 *
 * 展示当前公历年起 10 年的流年信息：
 *  - 默认折叠仅显示当年
 *  - 可展开看后续 9 年
 *  - 每段：年份 + 干支 + 流年命宫 + 流年四化（按流年天干起）
 *
 * 数据来源：`chart.flowYears`（由 core/ziwei.ts 预先计算）
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { SihuaKey, ZiweiChart } from '../types'

interface Props {
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const flowYears = computed(() => props.chart?.flowYears ?? [])
const expanded = ref(false)

const visibleCells = computed(() => {
  const all = flowYears.value
  if (!all.length) return []
  return expanded.value ? all : [all[0]]
})

const titleText = computed(() =>
  isGuofeng.value
    ? t('ziwei.flowYear.title')
    : t('ziwei.flowYear.titleMn'),
)

const toggleText = computed(() =>
  expanded.value
    ? t('ziwei.flowYear.collapse')
    : t('ziwei.flowYear.expandFmt', { count: Math.max(flowYears.value.length - 1, 0) }),
)

function shortSihua(k: SihuaKey): string {
  return t(`ziwei.sihuaShort.${k}`)
}
</script>

<template>
  <section v-if="flowYears.length" class="ziwei-flowyear-section">
    <div class="ziwei-flowyear-header">
      <h2>{{ titleText }}</h2>
      <button
        v-if="flowYears.length > 1"
        type="button"
        class="ziwei-flowyear-toggle"
        @click="expanded = !expanded"
      >
        {{ toggleText }}
      </button>
    </div>

    <ul class="ziwei-flowyear-list">
      <li
        v-for="cell in visibleCells"
        :key="cell.year"
        :class="['ziwei-flowyear-cell', { current: cell.current }]"
      >
        <div class="ziwei-flowyear-head">
          <span class="ziwei-flowyear-year">{{ cell.year }}</span>
          <span class="ziwei-flowyear-gz">{{ cell.ganzhi }}</span>
          <span class="ziwei-flowyear-palace">
            {{ t(`ziwei.palaceNamesShort.${cell.palaceKey}`) }}
          </span>
        </div>
        <div v-if="cell.mutagens.length" class="ziwei-flowyear-mutagens">
          <span
            v-for="(m, idx) in cell.mutagens"
            :key="idx"
            :class="['ziwei-flowyear-tag', `tag-sihua-${m.sihua}`]"
          >
            {{ m.name }}<span class="sihua-mark">化{{ shortSihua(m.sihua) }}</span>
            <span v-if="m.palaceKey" class="palace-mark">
              · {{ t(`ziwei.palaceNamesShort.${m.palaceKey}`) }}
            </span>
          </span>
        </div>
      </li>
    </ul>
  </section>
</template>
