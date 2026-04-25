<script setup lang="ts">
/**
 * 黄历月历的「年月选择器」popover。
 *
 * 设计：
 *   - 触发器由父级通过 default slot 提供（通常就是月份标题按钮 .hl-cal-title-btn）
 *   - 面板：上排为「年」滚动选择（当前年 ± 10，共 21 个），下方 4×3 月份网格
 *   - 选中后 emit('pick', year, month)，并 v-model:open=false
 *   - 颜色 / 字体由两套主题各自的 .hl-mp-* 类承载，骨架放在共享 css 里
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
} from 'reka-ui'

const props = defineProps<{
  open: boolean
  year: number
  month: number
  isGuofeng: boolean
  /** trigger 按钮显示的文字（一般是 "{year} 年 {month} 月"） */
  triggerText: string
  /** trigger 按钮的 aria-label */
  triggerAriaLabel: string
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'pick', year: number, month: number): void
}>()

const { t } = useI18n()

const YEAR_RANGE = 10

const draftYear = ref(props.year)

watch(
  () => [props.open, props.year],
  ([isOpen, y]) => {
    if (isOpen) draftYear.value = y as number
  },
  { immediate: true },
)

const years = computed<number[]>(() => {
  const list: number[] = []
  for (let i = -YEAR_RANGE; i <= YEAR_RANGE; i++) {
    list.push(props.year + i)
  }
  return list
})

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function setOpen(v: boolean) { emit('update:open', v) }
function shiftYear(delta: number) {
  draftYear.value = draftYear.value + delta
}
function pickMonth(m: number) {
  emit('pick', draftYear.value, m)
}
</script>

<template>
  <PopoverRoot :open="open" @update:open="setOpen">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="hl-cal-title hl-cal-title-btn"
        :aria-label="triggerAriaLabel"
      >
        {{ triggerText }}
        <span class="hl-cal-title-caret" aria-hidden="true">▾</span>
      </button>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :class="['hl-mp-content', isGuofeng ? 'hl-mp-content--gf' : 'hl-mp-content--mn']"
        :side-offset="8"
        align="center"
        :avoid-collisions="true"
        :collision-padding="12"
      >
        <header class="hl-mp-head">
          <button
            type="button"
            class="hl-mp-year-btn"
            :aria-label="t('huangli.calendar.pickerPrevYearAria', { year: draftYear - 1 })"
            @click="shiftYear(-1)"
          >‹</button>
          <span class="hl-mp-year-text" aria-live="polite">{{ t('huangli.calendar.pickerYearFmt', { year: draftYear }) }}</span>
          <button
            type="button"
            class="hl-mp-year-btn"
            :aria-label="t('huangli.calendar.pickerNextYearAria', { year: draftYear + 1 })"
            @click="shiftYear(1)"
          >›</button>
        </header>

        <ul class="hl-mp-year-list" :aria-label="t('huangli.calendar.pickerYearListAria')">
          <li v-for="y in years" :key="`y-${y}`">
            <button
              type="button"
              :class="['hl-mp-year-cell', { 'is-active': y === draftYear }]"
              @click="draftYear = y"
            >{{ y }}</button>
          </li>
        </ul>

        <ul class="hl-mp-month-grid" :aria-label="t('huangli.calendar.pickerMonthGridAria')">
          <li v-for="m in months" :key="`m-${m}`">
            <button
              type="button"
              :class="['hl-mp-month-cell', {
                'is-current': m === month && draftYear === year,
                'is-this-month': m === month,
              }]"
              :aria-current="m === month && draftYear === year ? 'true' : undefined"
              @click="pickMonth(m)"
            >{{ t('huangli.calendar.pickerMonthFmt', { month: m }) }}</button>
          </li>
        </ul>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
