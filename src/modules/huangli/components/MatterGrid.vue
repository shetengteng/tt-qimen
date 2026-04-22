<script setup lang="ts">
/**
 * 9 事由速查网格。
 *   - 点击某事由：把 store.activeMatter 切到该 key（月历将亮起所有匹配"宜"的日子）
 *   - 再次点击同一事由：清除筛选
 *   - 每个卡片右下角一个 verdict 徽章（宜 / 忌 / 平）
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MATTER_ORDER, MATTER_ICONS } from '../data/matterIcons'
import { judgeAllMatters } from '../data/matterKeywords'
import { useHuangliStore } from '../stores/huangliStore'
import type { HuangliDay, HuangliMatterKey, MatterVerdict } from '../types'

const props = defineProps<{
  day: HuangliDay
}>()

const { t, tm, rt } = useI18n()
const store = useHuangliStore()

const matterNames = computed(() => {
  const raw = tm('huangli.matters.names') as unknown as Record<HuangliMatterKey, unknown>
  const out = {} as Record<HuangliMatterKey, string>
  for (const k of Object.keys(raw) as HuangliMatterKey[]) {
    const v = raw[k]
    out[k] = typeof v === 'string' ? v : rt(v as Parameters<typeof rt>[0])
  }
  return out
})

const verdicts = computed<Record<HuangliMatterKey, MatterVerdict>>(() => {
  const map: Partial<Record<HuangliMatterKey, MatterVerdict>> = {}
  for (const row of judgeAllMatters(props.day.recommends, props.day.avoids)) {
    map[row.key] = row.verdict
  }
  return map as Record<HuangliMatterKey, MatterVerdict>
})

function verdictText(v: MatterVerdict): string {
  return t(`huangli.matters.verdict.${v}`)
}

function onToggle(key: HuangliMatterKey) {
  if (store.activeMatter === key) store.setActiveMatter(null)
  else store.setActiveMatter(key)
}
</script>

<template>
  <section class="hl-matter-section">
    <div class="hl-matter-section-head">
      <h3 class="hl-matter-title">{{ t('huangli.matters.sectionTitle') }}</h3>
      <p class="hl-matter-sub">{{ t('huangli.matters.sectionHint') }}</p>
    </div>
    <div class="hl-matter-grid">
      <button
        v-for="key in MATTER_ORDER"
        :key="key"
        type="button"
        :class="['hl-matter-card', { 'is-active': store.activeMatter === key }]"
        @click="onToggle(key)"
      >
        <span class="hl-matter-icon" aria-hidden="true">{{ MATTER_ICONS[key] }}</span>
        <span class="hl-matter-name">{{ matterNames[key] }}</span>
        <span :class="['hl-matter-verdict', `hl-matter-verdict--${verdicts[key]}`]">
          {{ verdictText(verdicts[key]) }}
        </span>
      </button>
    </div>
  </section>
</template>
