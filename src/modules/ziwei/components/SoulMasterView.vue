<script setup lang="ts">
/**
 * 紫微 · 命主 / 身主卡（设计文档 §3.3 第七行 / §5 步骤 4）
 *
 * 输入：chart.meta.mingZhu / chart.meta.shenZhu（直接来自 iztro 的 astrolabe.soul / .body）
 * 数据：runtime 通过 loadSoulMasterEntry(starKey, locale) 异步加载 13 颗 candidate 内一颗
 *
 * 渲染策略：
 *  - 命主、身主 各取一段，呈现为左右两栏（mobile 自适应竖排）
 *  - 资产懒加载未到位时（首次切语言瞬间）：保持 loading 占位
 *  - 每段：name + role label + 论断 text + keywords chip
 *  - 单边数据缺失（不在 13 颗 candidate 内，例如另说之"七杀"）→ 显示 entryMissing
 *  - 两边都无 → 显示 bothMissing 兜底
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ZiweiChart } from '../types'
import { ZH_MING_SHEN_TO_KEY, type SoulMasterEntry } from '../data'
import { loadSoulMasterEntry } from '../data/lazy'
import type { Locale } from '@/locales'

interface Props {
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t, locale } = useI18n()

const mingZhu = computed(() => props.chart?.meta?.mingZhu ?? '')
const shenZhu = computed(() => props.chart?.meta?.shenZhu ?? '')

const mingEntry = ref<SoulMasterEntry | null>(null)
const shenEntry = ref<SoulMasterEntry | null>(null)

async function loadEntry(zhName: string, lang: Locale): Promise<SoulMasterEntry | null> {
  const key = ZH_MING_SHEN_TO_KEY[zhName]
  if (!key) return null
  return await loadSoulMasterEntry(key, lang)
}

watch(
  [mingZhu, locale],
  async ([name, lang]) => {
    mingEntry.value = name ? await loadEntry(name, lang as Locale) : null
  },
  { immediate: true },
)

watch(
  [shenZhu, locale],
  async ([name, lang]) => {
    shenEntry.value = name ? await loadEntry(name, lang as Locale) : null
  },
  { immediate: true },
)

const hasAny = computed(() => Boolean(mingEntry.value || shenEntry.value || mingZhu.value || shenZhu.value))
</script>

<template>
  <section class="ziwei-soul-master">
    <header class="ziwei-soul-master__head">
      <h3 class="ziwei-soul-master__title">{{ t('ziwei.soulMaster.title') }}</h3>
    </header>

    <p v-if="!hasAny" class="ziwei-soul-master__empty">
      {{ t('ziwei.soulMaster.bothMissing') }}
    </p>

    <div v-else class="ziwei-soul-master__grid">
      <article class="ziwei-soul-master__card ziwei-soul-master__card--ming">
        <div class="ziwei-soul-master__card-head">
          <span class="ziwei-soul-master__role">{{ t('ziwei.soulMaster.mingLabel') }}</span>
          <span v-if="mingZhu" class="ziwei-soul-master__name">{{ mingZhu }}</span>
        </div>
        <p v-if="mingEntry" class="ziwei-soul-master__text">{{ mingEntry.text }}</p>
        <p v-else class="ziwei-soul-master__text ziwei-soul-master__text--empty">
          {{ t('ziwei.soulMaster.entryMissing') }}
        </p>
        <div v-if="mingEntry?.keywords?.length" class="ziwei-soul-master__keywords">
          <span class="ziwei-soul-master__keywords-label">
            {{ t('ziwei.soulMaster.keywordsLabel') }}
          </span>
          <span
            v-for="kw in mingEntry.keywords"
            :key="kw"
            class="ziwei-soul-master__chip"
          >
            {{ kw }}
          </span>
        </div>
      </article>

      <article class="ziwei-soul-master__card ziwei-soul-master__card--shen">
        <div class="ziwei-soul-master__card-head">
          <span class="ziwei-soul-master__role">{{ t('ziwei.soulMaster.shenLabel') }}</span>
          <span v-if="shenZhu" class="ziwei-soul-master__name">{{ shenZhu }}</span>
        </div>
        <p v-if="shenEntry" class="ziwei-soul-master__text">{{ shenEntry.text }}</p>
        <p v-else class="ziwei-soul-master__text ziwei-soul-master__text--empty">
          {{ t('ziwei.soulMaster.entryMissing') }}
        </p>
        <div v-if="shenEntry?.keywords?.length" class="ziwei-soul-master__keywords">
          <span class="ziwei-soul-master__keywords-label">
            {{ t('ziwei.soulMaster.keywordsLabel') }}
          </span>
          <span
            v-for="kw in shenEntry.keywords"
            :key="kw"
            class="ziwei-soul-master__chip"
          >
            {{ kw }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>
