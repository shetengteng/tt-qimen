<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { LingqianItem } from '../types'

/**
 * 解曰 / 仙机 双栏。
 * 两套主题共用 markup，样式由 :root[data-theme='*'] .lq-two-cols 区分。
 */
interface Props {
  item: LingqianItem | null
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <section class="lq-two-cols">
    <div class="lq-col lq-col-jieyue">
      <div class="lq-col-head">
        <span class="lq-col-dot" />{{ t('lingqian.jieyue.label') }}
      </div>
      <p class="lq-col-body">
        {{ item?.jieyue ?? t('lingqian.placeholder.jieyue') }}
      </p>
    </div>

    <div class="lq-col lq-col-xianji">
      <div class="lq-col-head">
        <span class="lq-col-dot" />{{ t('lingqian.xianji.label') }}
      </div>
      <p class="lq-col-body">
        {{ item?.xianji ?? t('lingqian.placeholder.xianji') }}
      </p>
    </div>
  </section>
</template>
