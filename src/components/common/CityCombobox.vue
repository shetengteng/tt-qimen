<script setup lang="ts">
/**
 * CityCombobox — 城市搜索下拉
 *
 * 物理位置：`@/components/common/CityCombobox.vue`
 *
 * 设计目标：
 *   - 输入关键字过滤（中文 / 英文 / 拼音 key 任一匹配，大小写不敏感）
 *   - 选中城市 = 隐式开启真太阳时（消费方读 modelValue 推导经度）
 *   - 不选 / 清空 = 隐式关闭真太阳时（modelValue 为空字符串）
 *   - 双主题：国风 / 简约 通过 .gf / .mn 类切换
 *
 * 受控接口：
 *   - props.modelValue: 当前选中的 city key（CITY_LONGITUDE 的 key），''/undefined 表示未选
 *   - props.options: 可用 city key 列表（由 BirthForm 注入，避免组件自己依赖 CITY_LONGITUDE）
 *   - props.labelOf: (key) => 国际化后的城市名（避免组件直接依赖 useI18n，便于测试）
 *
 * 行为：
 *   - 焦点 input → 显示下拉列表（默认全集）
 *   - 输入关键字 → 实时过滤，无结果显示 noResult 文案
 *   - 点选 / Enter 选中第 0 项 → emit 'update:modelValue' + 关闭下拉
 *   - Esc / 点击外部 → 关闭下拉（不清空选中）
 *   - 清除按钮 → emit ''（让真太阳时回到关闭态）
 */

import { computed, nextTick, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'

interface Props {
  modelValue: string
  options: readonly string[]
  labelOf: (key: string) => string
  placeholder?: string
  noResultText?: string
  clearTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  noResultText: '',
  clearTitle: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const rootEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const open = ref(false)
const queryText = ref('')
const activeIdx = ref(0)

/** 当前已选 city 的可读 label（input 失焦时显示这个） */
const selectedLabel = computed(() => (props.modelValue ? props.labelOf(props.modelValue) : ''))

/** 焦点之外的 input 显示值：未聚焦显示 selectedLabel，聚焦显示 queryText */
const inputDisplayValue = ref('')

watch([open, selectedLabel], ([isOpen, label]) => {
  if (!isOpen) inputDisplayValue.value = label
})

/**
 * 过滤后的 options 列表
 *
 * 匹配维度：
 *   - 拼音 key（CITY_LONGITUDE 原 key，例如 "beijing"）
 *   - i18n label（中/繁/英，例如 "北京" / "Beijing"）
 *   - 部分匹配（区分大小写不敏感）
 */
const filtered = computed<string[]>(() => {
  const q = queryText.value.trim().toLowerCase()
  if (!q) return [...props.options]
  return props.options.filter((key) => {
    if (key.toLowerCase().includes(q)) return true
    const label = props.labelOf(key).toLowerCase()
    return label.includes(q)
  })
})

watch(filtered, () => {
  activeIdx.value = 0
})

function onFocus() {
  open.value = true
  queryText.value = ''
  inputDisplayValue.value = ''
  activeIdx.value = 0
}

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  queryText.value = v
  inputDisplayValue.value = v
  open.value = true
}

function selectKey(key: string) {
  emit('update:modelValue', key)
  open.value = false
  queryText.value = ''
  // 失焦后 selectedLabel watch 会同步 inputDisplayValue
  nextTick(() => inputEl.value?.blur())
}

function clearSelection() {
  emit('update:modelValue', '')
  queryText.value = ''
  inputDisplayValue.value = ''
  open.value = true
  nextTick(() => inputEl.value?.focus())
}

function onKeydown(e: KeyboardEvent) {
  if (!open.value) {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
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
        selectKey(filtered.value[activeIdx.value])
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
  <div ref="rootEl" class="cc-root">
    <div class="cc-input-wrap">
      <input
        ref="inputEl"
        :value="inputDisplayValue"
        :placeholder="placeholder"
        type="text"
        class="cc-input"
        autocomplete="off"
        spellcheck="false"
        @focus="onFocus"
        @input="onInput"
        @keydown="onKeydown"
      />
      <button
        v-if="modelValue && !open"
        type="button"
        class="cc-clear"
        :title="clearTitle"
        :aria-label="clearTitle"
        @mousedown.prevent="clearSelection"
      >
        ×
      </button>
    </div>
    <ul v-if="open" class="cc-list" role="listbox">
      <li
        v-for="(key, i) in filtered"
        :key="key"
        :class="['cc-item', { active: i === activeIdx, selected: key === modelValue }]"
        role="option"
        :aria-selected="key === modelValue"
        @mousedown.prevent="selectKey(key)"
        @mouseenter="activeIdx = i"
      >
        <span class="cc-item-label">{{ labelOf(key) }}</span>
        <span class="cc-item-key">{{ key }}</span>
      </li>
      <li v-if="filtered.length === 0" class="cc-empty">{{ noResultText }}</li>
    </ul>
  </div>
</template>

<style scoped>
.cc-root {
  position: relative;
  width: 100%;
}

.cc-input-wrap {
  position: relative;
}

.cc-input {
  width: 100%;
  height: 32px;
  padding: 0 30px 0 10px;
  border: 1px solid var(--color-border, rgba(127, 127, 127, 0.25));
  border-radius: 8px;
  background: var(--color-bg, transparent);
  color: var(--color-ink);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;
}

.cc-input::placeholder {
  color: var(--color-ink-muted, rgba(0, 0, 0, 0.35));
}

.cc-input:focus {
  border-color: var(--color-accent, #8c5a3a);
}

.cc-clear {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  background: var(--color-ink-muted, rgba(0, 0, 0, 0.32));
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease;
}

.cc-clear:hover {
  background: var(--color-ink, #333);
}

.cc-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 30;
  max-height: 260px;
  overflow-y: auto;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: var(--color-bg-elevated, var(--color-bg, #fff));
  border: 1px solid var(--color-border, rgba(127, 127, 127, 0.2));
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.cc-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 12px;
  font-size: 14px;
  color: var(--color-ink);
  cursor: pointer;
  transition: background 0.12s ease;
}

.cc-item.active,
.cc-item:hover {
  background: var(--color-bg-hover, rgba(140, 90, 58, 0.08));
}

.cc-item.selected {
  color: var(--color-accent, #8c5a3a);
  font-weight: 500;
}

.cc-item-label {
  flex: 1;
}

.cc-item-key {
  font-size: 11px;
  color: var(--color-ink-muted, rgba(0, 0, 0, 0.35));
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.cc-empty {
  padding: 10px 12px;
  text-align: center;
  font-size: 13px;
  color: var(--color-ink-muted, rgba(0, 0, 0, 0.45));
  cursor: default;
}
</style>
