<script setup lang="ts">
/**
 * 通用可折叠区块。
 *
 * 用法：
 *   <CollapsibleSection :label="t('bazi.collapse.sectionChart')">
 *     <FourPillarsTable ... />
 *   </CollapsibleSection>
 *
 * 与原型对齐：
 * - 头部为「标题 + 收起/展开 按钮」一行
 * - 主体通过 max-height 过渡实现平滑收起/展开
 * - 国风 / 简约主题的视觉差异由 themes/{guofeng,minimal}/components.css 控制
 *   （类名 .collapsible-head / .collapse-toggle / .collapsible-body 与原型一致）
 *
 * 关键实现细节：
 * - 默认展开（open=true），展开时把 max-height 设为 scrollHeight；
 *   动画完成后再清空 max-height，确保里面的内容（如 SVG resize、tooltip）
 *   能继续撑开父容器，不会被 px 值卡死。
 * - 收起时先把 max-height 由 scrollHeight 锁回 0，触发 transition。
 * - 监听 window resize：只对当前展开的 section 重算 scrollHeight，
 *   避免窗口大小变化后 tracking 出错（与原型 line 2069-2073 行为对齐）。
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  /** 头部显示的标题文本（含 ◎ 等装饰符） */
  label: string
  /** 是否默认展开。默认 true */
  defaultOpen?: boolean
  /**
   * head 节点上的额外 class，方便不同位置（命盘/简析/大运/流年）
   * 在 components.css 里做最后微调（如左右内边距）。
   */
  headClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: true,
  headClass: '',
})

const { t } = useI18n()

const open = ref<boolean>(props.defaultOpen)
const bodyEl = ref<HTMLElement | null>(null)
/** 当前 inline max-height 字符串：'0' / '320px' / '' */
const maxHeight = ref<string>('')

function applyMaxHeight() {
  const el = bodyEl.value
  if (!el) return
  if (open.value) {
    maxHeight.value = el.scrollHeight + 'px'
    // 过渡完成后释放 max-height，让内容撑开父容器（避免子组件后续 resize 被截断）
    window.setTimeout(() => {
      if (open.value) maxHeight.value = ''
    }, 520) // 与 .collapsible-body 的 transition 时长（500ms）保持一致 + 20ms 缓冲
  } else {
    // 收起前必须先把当前展开高度写死，否则浏览器无法在 'auto' → '0' 间补帧
    maxHeight.value = el.scrollHeight + 'px'
    requestAnimationFrame(() => {
      maxHeight.value = '0'
    })
  }
}

function toggle() {
  open.value = !open.value
}

watch(open, () => {
  // 等待 DOM 更新后再读取 scrollHeight（如有展开后立即变高的子组件）
  nextTick(() => applyMaxHeight())
})

function handleResize() {
  if (!open.value) return
  const el = bodyEl.value
  if (!el) return
  if (maxHeight.value && maxHeight.value !== '') {
    maxHeight.value = el.scrollHeight + 'px'
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div :class="['collapsible-head', headClass]">
    <h3>{{ label }}</h3>
    <button
      type="button"
      class="collapse-toggle"
      :data-state="open ? 'open' : 'closed'"
      @click="toggle"
    >
      {{ open ? t('bazi.collapse.collapseLabel') + ' ▲' : t('bazi.collapse.expandLabel') + ' ▼' }}
    </button>
  </div>

  <div
    ref="bodyEl"
    class="collapsible-body"
    :class="{ collapsed: !open }"
    :style="maxHeight ? { maxHeight } : {}"
  >
    <slot />
  </div>
</template>
