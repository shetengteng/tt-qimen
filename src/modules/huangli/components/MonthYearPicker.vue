<script setup lang="ts">
/**
 * 黄历月历的「年月选择器」popover。
 *
 * 设计：
 *   - 触发器：父级在 default slot 之外通过 trigger-text 直接传，渲染为 .hl-cal-title-btn
 *   - 面板：年 + 月 两个 shadcn-vue Select 并排 + "返回今日" 快捷按钮
 *   - 任一 Select 变化 → 立即 emit('pick', year, month) 并 v-model:open=false
 *   - 颜色 / 字体由两套主题各自的 .hl-mp-* 类承载，shadcn Select 自带键盘可达性
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
} from 'reka-ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

/** 年份范围：当前年 ± 10 */
const YEAR_RANGE = 10

const yearOptions = computed<number[]>(() => {
  const list: number[] = []
  for (let i = -YEAR_RANGE; i <= YEAR_RANGE; i++) list.push(props.year + i)
  return list
})

const monthOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

/** 在面板里临时维护"草稿"，以便用户可以连续改两个 select */
const draftYear = ref(String(props.year))
const draftMonth = ref(String(props.month))

watch(
  () => [props.open, props.year, props.month],
  ([isOpen, y, m]) => {
    if (isOpen) {
      draftYear.value = String(y)
      draftMonth.value = String(m)
    }
  },
  { immediate: true },
)

function setOpen(v: boolean) { emit('update:open', v) }

function commit() {
  emit('pick', Number(draftYear.value), Number(draftMonth.value))
}

function onJumpToday() {
  const now = new Date()
  emit('pick', now.getFullYear(), now.getMonth() + 1)
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
        <div class="hl-mp-row">
          <div class="hl-mp-field">
            <label class="hl-mp-label" :for="`hl-mp-year-${triggerText}`">
              {{ t('huangli.calendar.pickerYearLabel') }}
            </label>
            <Select v-model="draftYear">
              <SelectTrigger :id="`hl-mp-year-${triggerText}`" class="hl-mp-select-trigger w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent class="hl-mp-select-content max-h-72">
                <SelectItem
                  v-for="y in yearOptions"
                  :key="`y-${y}`"
                  :value="String(y)"
                >
                  {{ t('huangli.calendar.pickerYearFmt', { year: y }) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="hl-mp-field">
            <label class="hl-mp-label" :for="`hl-mp-month-${triggerText}`">
              {{ t('huangli.calendar.pickerMonthLabel') }}
            </label>
            <Select v-model="draftMonth">
              <SelectTrigger :id="`hl-mp-month-${triggerText}`" class="hl-mp-select-trigger w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent class="hl-mp-select-content">
                <SelectItem
                  v-for="m in monthOptions"
                  :key="`m-${m}`"
                  :value="String(m)"
                >
                  {{ t('huangli.calendar.pickerMonthFmt', { month: m }) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="hl-mp-actions">
          <button
            type="button"
            class="hl-mp-action hl-mp-action--ghost"
            @click="onJumpToday"
          >
            {{ t('huangli.calendar.pickerToday') }}
          </button>
          <button
            type="button"
            class="hl-mp-action hl-mp-action--primary"
            @click="commit"
          >
            {{ t('huangli.calendar.pickerConfirm') }}
          </button>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
