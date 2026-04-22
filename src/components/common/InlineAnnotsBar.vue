<script setup lang="ts">
/**
 * 注释聚合容器（v3.1.1 · section 尾部 inline-annots-bar）
 *
 * 等价原型 design/prototypes/{guofeng,minimal}/bazi.html 中的
 * `.inline-annots-bar` + `.inline-annot-item` 渲染逻辑（仅 DOM 部分；
 * 原型里通过运行时 JS 注入，Vue 这里直接由模板渲染）。
 *
 * 三种布局变体（与原型 `barClass` 完全对齐）：
 *  - 'nayin' → 4 列等宽（与 .bazi-cells 4 列对齐）
 *  - 'tag'   → flex-wrap，双列（≥768px）/单列（<640px）
 *  - 'chip'  → auto-fill minmax(200px, 1fr) 网格（与 .shensha-list 一致）
 *
 * 设计文档：design/bazi/2026-04-21-03-注释交互设计方案.md §11
 */
import { computed } from 'vue'

export interface AnnotItem {
  /** 唯一定位 key，与触发器 data-annot-focus 对齐 */
  focus: string
  /** 「柱位 · 名称」标题 */
  label: string
  /** 短释义（一句话），加粗显示在正文头部 */
  short?: string
  /** 长释义（80-220 字） */
  long?: string
}

interface Props {
  /** 三种布局：nayin 4列 / tag flex-wrap / chip auto-fill 200px */
  layout: 'nayin' | 'tag' | 'chip'
  /** 容器内当前展开的项目 */
  items: AnnotItem[]
  /**
   * role="list" 的 aria-label，如"纳音注释"。
   *
   * 注：prop 名故意取 ariaLabelText 而非 ariaLabel，避免被 Vue 当作普通
   * `aria-label` HTML 属性走 attr fallthrough 到根节点 —— 那样反而会
   * 让 vue-tsc 在使用方报「Property 'ariaLabel' is missing」。
   */
  ariaLabelText: string
}

const props = defineProps<Props>()

const visible = computed(() => props.items.length > 0)
</script>

<template>
  <Transition name="annot-bar">
    <div
      v-if="visible"
      class="inline-annots-bar"
      :class="['is-' + layout]"
      role="list"
      :aria-label="ariaLabelText"
    >
      <div
        v-for="it in items"
        :key="it.focus"
        class="inline-annot-item"
        role="region"
        :aria-label="it.label"
        :data-annot-for="it.focus"
      >
        <div class="inline-annot-item-title">{{ it.label }}</div>
        <p class="inline-annot-item-body">
          <span v-if="it.short" class="inline-annot-item-body-short">{{ it.short }}</span>
          <template v-if="it.short && it.long">　</template>
          <template v-if="it.long">{{ it.long }}</template>
          <template v-else-if="!it.short">（详细解释待接入运行时数据）</template>
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.annot-bar-enter-active,
.annot-bar-leave-active {
  transition: opacity 220ms cubic-bezier(0.22, 0.9, 0.24, 1),
              transform 220ms cubic-bezier(0.22, 0.9, 0.24, 1);
}
.annot-bar-enter-from,
.annot-bar-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .annot-bar-enter-active,
  .annot-bar-leave-active {
    transition: none;
  }
}
</style>
