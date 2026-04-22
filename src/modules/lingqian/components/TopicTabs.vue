<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { LingqianItem } from '../types'
import { TOPIC_KEYS, type TopicKey } from '../core/lingqian'

/**
 * 6 大分类指引（家宅 / 婚姻 / 事业 / 财富 / 出行 / 健康），
 * tab 受控于父组件（v-model:topic），缺省给"family"。
 *
 * 设计取舍：原型用列表「分事而问·逐项开示」，但 tab 切换更聚焦；
 * 这里采用 tab，宽屏可后续迁移为列表（数据接口不变）。
 */
interface Props {
  /** 已抽得的签；调用方用 v-if / v-else-if 保证非空 */
  item: LingqianItem
  topic: TopicKey
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:topic', v: TopicKey): void
}>()

const { t } = useI18n()

function pick(k: TopicKey) {
  emit('update:topic', k)
}

const currentText = computed(() => props.item.topics[props.topic])

/** 单字 icon（与原型「谋/财/婚/疾/行」相同的视觉骨架） */
const TOPIC_ICON: Readonly<Record<TopicKey, string>> = {
  family: '宅',
  marriage: '姻',
  career: '业',
  wealth: '财',
  travel: '行',
  health: '康',
}
</script>

<template>
  <section class="lq-topics">
    <h3 class="lq-topics-title">
      {{ t('lingqian.topics.title') }}
    </h3>

    <div class="lq-topic-tabs">
      <button
        v-for="k in TOPIC_KEYS"
        :key="k"
        type="button"
        class="lq-topic-tab"
        :class="{ active: k === topic }"
        @click="pick(k)"
      >
        <span class="lq-topic-icon">{{ TOPIC_ICON[k] }}</span>
        <span class="lq-topic-name">{{ t(`lingqian.topic.${k}`) }}</span>
      </button>
    </div>

    <p class="lq-topic-body">{{ currentText }}</p>
  </section>
</template>
