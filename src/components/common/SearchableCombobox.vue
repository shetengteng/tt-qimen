<script setup lang="ts" generic="T extends string">
/**
 * SearchableCombobox — 通用可搜索下拉组件
 *
 * 物理位置：`@/components/common/SearchableCombobox.vue`
 *
 * ## 设计来源
 *
 * 直接参考 `CityCombobox.vue` 的交互模式（input + 平铺 listbox + onClickOutside）：
 *   - 不使用 reka-ui 的 Popover/Command/Listbox（避免 portal 抖动 / SelectItemText
 *     富文本传染 trigger / 滚动模式切换的副作用）
 *   - 所有 DOM 都在组件内部，z-index 层级简单可控
 *   - 完全自定义键盘导航（ArrowDown/Up/Enter/Escape）
 *
 * ## 与 CityCombobox 的差异
 *
 *   - 城市组件深度耦合 city key（label 右侧总展示原 key，匹配兼顾拼音 key + label）；
 *     本组件改为通用：默认只按 label 匹配，hint 字段可选展示在 item 右侧
 *   - 样式从 CSS 变量改为 Tailwind v4 + shadcn token，让设置页风格统一
 *   - 泛型 T extends string 让 modelValue / 选项 id 类型在调用方自带类型守卫
 *
 * ## 受控接口
 *
 *   - props.modelValue: 当前选中的 option id（由调用方提供 string / union）
 *   - props.options: 候选 id 列表（顺序 = 渲染顺序）
 *   - props.labelOf: (id) => 显示给用户看的 label
 *   - props.hintOf: (id) => 可选第二行说明（item 内右侧 / 下方）
 *   - props.placeholder: 输入框占位文案
 *   - props.searchPlaceholder: 搜索时的占位文案（聚焦后切换）
 *   - props.noResultText: 无匹配时的空态文案
 *   - props.disabled: 禁用整个组件
 */

import { computed, nextTick, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { ChevronsUpDown, X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props<U extends string> {
  modelValue: U
  options: readonly U[]
  labelOf: (id: U) => string
  hintOf?: (id: U) => string
  placeholder?: string
  searchPlaceholder?: string
  noResultText?: string
  disabled?: boolean
  /** 输入框 id（便于外部 Label 关联） */
  id?: string
  /** 是否允许清空（=> 触发 emit('') 由调用方决定如何处理；默认 false） */
  clearable?: boolean
  /**
   * 自定义匹配函数；默认按 labelOf(id).toLowerCase().includes(query.toLowerCase())。
   * 若调用方需要在 hintOf 等额外维度匹配，传入此 prop。
   */
  matchFn?: (id: U, query: string, label: string) => boolean
  /** trigger 高度对齐，可选 sm（h-8）/ default（h-9）；默认 default 与 Input 对齐 */
  size?: 'default' | 'sm'
}

const props = withDefaults(defineProps<Props<T>>(), {
  hintOf: undefined,
  placeholder: '',
  searchPlaceholder: '',
  noResultText: 'No matches',
  disabled: false,
  id: undefined,
  clearable: false,
  matchFn: undefined,
  size: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const rootEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const open = ref(false)
const queryText = ref('')
const activeIdx = ref(0)

/** 当前已选 id 的可读 label（input 失焦时回显） */
const selectedLabel = computed(() => (props.modelValue ? props.labelOf(props.modelValue) : ''))

/**
 * input 显示值：未聚焦显示 selectedLabel；聚焦后切到 queryText（让用户直接覆盖打字搜索）。
 */
const inputDisplayValue = ref('')

watch([open, selectedLabel], ([isOpen, label]) => {
  if (!isOpen) inputDisplayValue.value = label
})

/**
 * 过滤后的 options 列表
 */
const filtered = computed<readonly T[]>(() => {
  const q = queryText.value.trim().toLowerCase()
  if (!q) return props.options
  if (props.matchFn) {
    return props.options.filter((id) => props.matchFn!(id, q, props.labelOf(id)))
  }
  return props.options.filter((id) => props.labelOf(id).toLowerCase().includes(q))
})

watch(filtered, () => {
  activeIdx.value = 0
})

function toggleOpen() {
  if (props.disabled) return
  if (open.value) {
    open.value = false
    return
  }
  inputEl.value?.focus()
}

function onFocus() {
  if (props.disabled) return
  open.value = true
  queryText.value = ''
  inputDisplayValue.value = ''
  activeIdx.value = Math.max(
    0,
    props.options.findIndex((id) => id === props.modelValue),
  )
}

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  queryText.value = v
  inputDisplayValue.value = v
  open.value = true
}

function selectId(id: T) {
  emit('update:modelValue', id)
  open.value = false
  queryText.value = ''
  nextTick(() => inputEl.value?.blur())
}

function clearSelection() {
  emit('update:modelValue', '' as T)
  queryText.value = ''
  inputDisplayValue.value = ''
  open.value = true
  nextTick(() => inputEl.value?.focus())
}

function onKeydown(e: KeyboardEvent) {
  if (props.disabled) return
  if (!open.value) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      open.value = true
      e.preventDefault()
    }
    return
  }
  switch (e.key) {
    case 'ArrowDown':
      activeIdx.value = Math.min(activeIdx.value + 1, Math.max(filtered.value.length - 1, 0))
      e.preventDefault()
      break
    case 'ArrowUp':
      activeIdx.value = Math.max(activeIdx.value - 1, 0)
      e.preventDefault()
      break
    case 'Enter':
      if (filtered.value[activeIdx.value]) {
        selectId(filtered.value[activeIdx.value])
      }
      e.preventDefault()
      break
    case 'Escape':
      open.value = false
      ;(e.target as HTMLInputElement).blur()
      e.preventDefault()
      break
  }
}

onClickOutside(rootEl, () => {
  open.value = false
})

watch(
  () => props.modelValue,
  (v) => {
    inputDisplayValue.value = v ? props.labelOf(v) : ''
  },
  { immediate: true },
)
</script>

<template>
  <div
    ref="rootEl"
    :class="cn('relative w-full', props.disabled && 'opacity-50 pointer-events-none')"
  >
    <!--
      Trigger 容器：通过 data-slot="combobox-trigger" 让国风/简约两个主题的
      `themes/<id>/shadcn.css` 接管 :focus-within 视觉（与原生 `[data-slot='input']`
      的 :focus-visible 完全一致：border-color + box-shadow 0 0 0 3px rgba(...,0.1)）。

      这样避免 Tailwind 默认 `ring-ring/50` 在 minimal 主题下叠加 `--ring`
      自带的 0.4 alpha → 实际 0.2 alpha 的环，看起来比项目其它 input 深一倍
      的"黑框"。
    -->
    <div
      data-slot="combobox-trigger"
      :class="cn(
        'relative flex items-center gap-1.5 rounded-lg border border-input bg-transparent dark:bg-input/30',
        'transition-colors',
        'focus-within:border-ring',
        size === 'sm' ? 'h-8' : 'h-9',
      )"
    >
      <input
        ref="inputEl"
        :id="id"
        :value="inputDisplayValue"
        :placeholder="open ? searchPlaceholder || placeholder : placeholder"
        type="text"
        autocomplete="off"
        spellcheck="false"
        :disabled="disabled"
        :class="cn(
          'flex-1 min-w-0 bg-transparent px-3 py-1.5 text-sm outline-none',
          'placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed',
        )"
        role="combobox"
        :aria-expanded="open"
        aria-autocomplete="list"
        @focus="onFocus"
        @input="onInput"
        @keydown="onKeydown"
      />
      <button
        v-if="clearable && modelValue && !open"
        type="button"
        class="mr-1 grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        :aria-label="$attrs['aria-label'] as string ?? 'Clear'"
        @mousedown.prevent="clearSelection"
      >
        <X class="size-3" aria-hidden="true" />
      </button>
      <button
        type="button"
        tabindex="-1"
        class="mr-2 grid size-5 shrink-0 place-items-center text-muted-foreground"
        :aria-label="open ? 'Close list' : 'Open list'"
        @mousedown.prevent="toggleOpen"
      >
        <ChevronsUpDown class="size-4 opacity-50" aria-hidden="true" />
      </button>
    </div>
    <ul
      v-if="open"
      :class="cn(
        'absolute left-0 right-0 z-50 mt-1.5 max-h-72 overflow-y-auto',
        'rounded-lg border border-input bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10',
        'p-1',
      )"
      role="listbox"
    >
      <li
        v-for="(id, i) in filtered"
        :key="id"
        :class="cn(
          'flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors',
          'select-none',
          i === activeIdx && 'bg-accent text-accent-foreground',
          id === modelValue && 'font-medium text-foreground',
        )"
        role="option"
        :aria-selected="id === modelValue"
        @mousedown.prevent="selectId(id)"
        @mouseenter="activeIdx = i"
      >
        <span class="truncate">{{ labelOf(id) }}</span>
        <span
          v-if="hintOf"
          class="shrink-0 text-xs text-muted-foreground"
        >{{ hintOf(id) }}</span>
      </li>
      <li
        v-if="filtered.length === 0"
        class="px-3 py-3 text-center text-sm text-muted-foreground"
      >
        {{ noResultText }}
      </li>
    </ul>
  </div>
</template>
