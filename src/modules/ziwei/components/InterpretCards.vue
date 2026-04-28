<script setup lang="ts">
/**
 * 紫微 · 解读卡（4 张）— chip 摘要层（设计文档 §5 步骤 7 总评）
 *
 * 历史角色：
 *   2026-04-19 至 2026-04-27 期间，本组件用 i18n 静态写死 4 段 ~150 字"样例文案"，
 *   实际不会随用户排盘变化（本质是占位符）。
 *
 * 当前角色（2026-04-28 模板查表化）：
 *   - 上游已上线 5 个真模板驱动卡（SoulPalaceView · PalaceMajorView · MinorStarsView ·
 *     SihuaReadingView · SoulMasterView），它们已完整覆盖"长文案"语义。
 *   - 本卡退化为"4 张 chip 总评"，提供"主星 + 四化 + 吉煞 + 身宫" 4 维快速概览。
 *   - 删除写死的 i18n `cards.{key}.text`，避免误导用户以为是个性化解读。
 *
 * 数据来源：
 *   chart.interpretCards 由 `core/ziwei.ts → buildInterpretCards` 派生，仍是 chip 模型；
 *   本组件不引入 lazy 资产依赖，保持轻量同步渲染。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ZiweiChart } from '../types'

interface Props {
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t } = useI18n()

const cards = computed(() => props.chart?.interpretCards ?? [])
</script>

<template>
  <section class="ziwei-interpret-section">
    <article
      v-for="card in cards"
      :key="card.key"
      class="ziwei-interpret-card"
    >
      <h3>{{ t(`ziwei.interpret.cards.${card.key}.title`) }}</h3>
      <div class="tags">
        <span
          v-for="(tag, idx) in card.tags"
          :key="idx"
          :class="['tag', tag.tone || 'plain']"
        >
          {{ tag.label }}
        </span>
      </div>
    </article>
  </section>
</template>
