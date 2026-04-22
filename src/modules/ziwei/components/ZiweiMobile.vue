<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ZiweiPalace from './ZiweiPalace.vue'
import type { Palace, PalaceKey, ZiweiChart } from '../types'

interface Props {
  /** 真实命盘；由外层 result-zone v-if 保证非空 */
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t } = useI18n()

const palaces = computed<Palace[]>(() => props.chart?.palaces ?? [])

const KEY_PALACE_KEYS = ['ming', 'qianyi', 'fuqi', 'guanlu'] as const
type KeyKey = typeof KEY_PALACE_KEYS[number]
const KEY_SET = new Set<string>(KEY_PALACE_KEYS)

const keyPalaces = computed<Palace[]>(() =>
  KEY_PALACE_KEYS
    .map((k: KeyKey) => palaces.value.find((p) => p.key === k))
    .filter((p): p is Palace => Boolean(p)),
)

const morePalaces = computed<Palace[]>(() =>
  palaces.value.filter((p) => !KEY_SET.has(p.key)),
)

const moreOpen = ref(true)

function brightSummary(key: PalaceKey): string {
  const p = palaces.value.find((x) => x.key === key)
  if (!p) return ''
  const main = p.stars.filter((s) => s.kind === 'main')
  if (!main.length) {
    const aux = p.stars.find((s) => s.kind === 'aux')
    return aux ? aux.name : ''
  }
  const names = main.map((s) => (s.brightness ? `${s.name}（${s.brightness}）` : s.name)).join('·')
  const sihua = main.find((s) => s.sihua)
  return sihua ? `${names} · ${t('ziwei.sihuaLegend.' + sihua.sihua!)}` : names
}
</script>

<template>
  <div class="ziwei-mobile">
    <div class="mobile-key-palaces">
      <ZiweiPalace
        v-for="p in keyPalaces"
        :key="p.key"
        :palace="p"
      />
    </div>

    <div class="mobile-more-list">
      <button
        type="button"
        class="mobile-more-head"
        @click="moreOpen = !moreOpen"
      >
        <h4>◎ {{ t('ziwei.mobile.moreTitle') }}</h4>
        <span class="mobile-more-toggle">
          {{ moreOpen ? t('ziwei.mobile.collapse') : t('ziwei.mobile.expand') }}
        </span>
      </button>
      <div v-if="moreOpen" class="mobile-more-body">
        <div
          v-for="p in morePalaces"
          :key="p.key"
          class="mobile-more-item"
        >
          <span class="p-name">
            {{ t(`ziwei.palaceNames.${p.key}`) }} · {{ p.ganzhi }}
            <template v-if="p.isShen"> · 身</template>
          </span>
          <span class="p-star">{{ brightSummary(p.key) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
