<script setup lang="ts">
/**
 * 日期查询卡片。
 *   - 使用通用 `ds-input-card` 样式（与八字 BirthForm 一致的视觉语言）
 *   - 年 / 月 / 日 + 所求事项（可选）
 *   - 主题二选一：国风 / 简约
 *
 * 对外：
 *   - query()  按当前输入查询（更新 store 中的 year/month/day）
 *   - reset()  回到今日
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useHuangliStore } from '../stores/huangliStore'
import { MATTER_ORDER } from '../data/matterIcons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { HuangliMatterKey } from '../types'

const { t, tm, rt } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')
const store = useHuangliStore()

const year = ref(String(store.year))
const month = ref(String(store.month))
const day = ref(String(store.day))
const matter = ref<'all' | HuangliMatterKey>(store.activeMatter ?? 'all')

const currentYear = new Date().getFullYear()
const yearOptions = computed<string[]>(() => {
  const list: string[] = []
  // 过去 80 年 + 未来 5 年，常用年份靠前显示
  for (let y = currentYear + 5; y >= 1901; y--) list.push(String(y))
  return list
})
const monthOptions = computed<string[]>(() =>
  Array.from({ length: 12 }, (_, i) => String(i + 1)),
)
const dayOptions = computed<string[]>(() => {
  const y = Number(year.value)
  const m = Number(month.value)
  const last = new Date(y, m, 0).getDate()
  return Array.from({ length: last }, (_, i) => String(i + 1))
})

watch(dayOptions, (opts) => {
  if (!opts.includes(day.value)) day.value = opts[opts.length - 1]
})

const matterNames = computed(() => {
  const raw = tm('huangli.matters.names') as unknown as Record<HuangliMatterKey, unknown>
  const out = {} as Record<HuangliMatterKey, string>
  for (const k of Object.keys(raw) as HuangliMatterKey[]) {
    const v = raw[k]
    out[k] = typeof v === 'string' ? v : rt(v as Parameters<typeof rt>[0])
  }
  return out
})

function onQuery() {
  store.setDate(Number(year.value), Number(month.value), Number(day.value))
  store.setActiveMatter(matter.value === 'all' ? null : matter.value)
}

function onToday() {
  store.setToToday()
  year.value = String(store.year)
  month.value = String(store.month)
  day.value = String(store.day)
  matter.value = 'all'
  store.setActiveMatter(null)
}

/** 当外部（月历点击）改了日期 store 时，本地 ref 应同步回显 */
watch(
  () => [store.year, store.month, store.day, store.activeMatter] as const,
  ([y, m, d, mt]) => {
    year.value = String(y)
    month.value = String(m)
    day.value = String(d)
    matter.value = mt ?? 'all'
  },
)
</script>

<template>
  <div :class="[isGuofeng ? 'gf-card' : 'mn-card', 'ds-input-card hl-query-card']">
    <h2 class="ds-card-title">
      <span class="ds-ornament">{{ isGuofeng ? '◈' : '◆' }}</span>
      {{ t('huangli.query.title') }}
      <span v-if="isGuofeng" class="ds-ornament">◈</span>
    </h2>

    <div class="ds-input-row">
      <div class="ds-input-group">
        <Label>{{ t('huangli.query.fieldYear') }}</Label>
        <Select v-model="year">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="y in yearOptions" :key="y" :value="y">{{ y }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('huangli.query.fieldMonth') }}</Label>
        <Select v-model="month">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="m in monthOptions" :key="m" :value="m">{{ m }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('huangli.query.fieldDay') }}</Label>
        <Select v-model="day">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="d in dayOptions" :key="d" :value="d">{{ d }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('huangli.query.fieldMatter') }}</Label>
        <Select v-model="matter">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem value="all">{{ t('huangli.query.matterAll') }}</SelectItem>
            <SelectItem v-for="key in MATTER_ORDER" :key="key" :value="key">
              {{ matterNames[key] }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="ds-input-actions">
      <Button type="button" variant="default" :size="isGuofeng ? 'default' : 'lg'" @click="onQuery">
        <template v-if="isGuofeng">{{ t('huangli.query.btnQueryIcon') }} </template>
        {{ t('huangli.query.btnQuery') }}
      </Button>
      <Button type="button" variant="outline" @click="onToday">
        <template v-if="isGuofeng">{{ t('huangli.query.btnTodayIcon') }} </template>
        {{ t('huangli.query.btnToday') }}
      </Button>
    </div>
  </div>
</template>
