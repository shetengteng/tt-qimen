<script setup lang="ts">
/**
 * BirthForm — 共享生辰输入组件（八字 / 紫微 / 称骨复用）
 *
 * 物理位置：`@/components/common/BirthForm.vue`
 *
 * i18n 命名空间（已重整完毕）：
 *   - 共享字段命名（calendar / field / gender / hours / btn.paipan）已迁至
 *     `common.birthInput.*`，与组件位置匹配。
 *   - `bazi.*` 下原同名 key 仍保留作为兼容别名，供 BaziPage / FourPillarsTable 等
 *     八字独有的消费方使用（如 `bazi.gender.maleTitle/femaleTitle` 仍在 bazi 命名空间）。
 *
 * 复用方式：
 *   - bazi: <BirthForm @paipan="onPaipan" />（默认按钮文案使用 common.birthInput.btn.paipan）
 *   - ziwei / chenggu: <BirthForm :title="t('xx.inputCardTitle')" :primary-label="t('xx.btn.paipan')" />
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useBirthStore } from '@/composables/useBirthStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CITY_LONGITUDE, trueSolarTimeOffset, computeDayOfYear } from '@/lib/trueSolarTime'

interface Props {
  /** 标题文案覆盖；为空时回退到 common.birthInput.inputCardTitle */
  title?: string
  /** 主按钮文案覆盖（已经过 i18n 处理） */
  primaryLabel?: string
  /**
   * 是否展示真太阳时高级选项。
   * - bazi / ziwei → true（默认）：core 会消费 longitude
   * - chenggu / 其他不消费 longitude 的页面 → 调用方传 false 隐藏，避免误导
   */
  showAdvanced?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  primaryLabel: '',
  showAdvanced: true,
})

const emit = defineEmits<{
  paipan: []
}>()

const { t, tm } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const userStore = useBirthStore()

/**
 * 时辰索引（0..12）↔ 小时（0..23）映射
 * common.birthInput.hours i18n 顺序：子(0) 丑(1) 寅(2) 卯(3) 辰(4) 巳(5) 午(6) 未(7) 申(8) 酉(9) 戌(10) 亥(11)
 * 早子 = 0:30 平均，晚子 = 23:30 平均（命理通用规则）。idx 12 为「晚子」预留位（i18n 数组目前 12 项，下拉只渲染 0..11，晚子由日期推算自动落在 23:00 段）
 */
function hourIdxToHour(idx: number): number {
  if (idx === 0) return 0      // 早子 0:00-1:00
  if (idx === 12) return 23    // 晚子 23:00-24:00
  return idx * 2 - 1           // 1→1(丑1-3), 2→3(寅3-5)...
}
function hourToIdx(h: number): number {
  if (h === 23) return 12
  if (h === 0) return 0
  return Math.floor((h + 1) / 2)
}

const calendar = ref<'solar' | 'lunar'>(userStore.birth.calendar)
const year = ref(String(userStore.birth.year))
const month = ref(String(userStore.birth.month))
const day = ref(String(userStore.birth.day))
const hourIdx = ref(String(hourToIdx(userStore.birth.hour)))
const gender = ref<'male' | 'female'>(userStore.birth.gender)

const hours = computed(() => (tm('common.birthInput.hours') as string[]) ?? [])

// ---------------------------------------------------------------------------
// 真太阳时高级选项
// ---------------------------------------------------------------------------
//
// 数据流：
//   - 用户切开关 / 选城市 → 立即写回 store（longitude / birthplace）
//   - 关闭开关 → 把 longitude 设为 undefined，store 行为退回纯时钟时间
//   - 城市选 'custom' → 暴露 longitude 输入框，由用户手填
//
// CITY_LONGITUDE 当前 35 个常用城市经度查表（华人圈优先），未来可扩展。

const CITY_KEYS = Object.keys(CITY_LONGITUDE) as Array<keyof typeof CITY_LONGITUDE>

const advancedOpen = ref<boolean>(typeof userStore.birth.longitude === 'number')
const useTrueSolar = ref<boolean>(typeof userStore.birth.longitude === 'number')

/**
 * 反推初始 birthplaceKey：若 store 中 longitude 命中某城市经度（误差 <0.05°），
 * 选中该城市；否则视为 'custom'（手动输入经度）。
 */
function detectCityKey(longitude: number | undefined): string {
  if (typeof longitude !== 'number') return ''
  for (const key of CITY_KEYS) {
    if (Math.abs(CITY_LONGITUDE[key] - longitude) < 0.05) return key
  }
  return 'custom'
}

const birthplaceKey = ref<string>(detectCityKey(userStore.birth.longitude))
const longitudeInput = ref<string>(
  typeof userStore.birth.longitude === 'number' ? String(userStore.birth.longitude) : '',
)

/** 当选中具体城市时，把对应经度写到 longitudeInput；选 custom 时清空让用户填 */
watch(birthplaceKey, (key) => {
  if (!key || key === 'custom') return
  const lng = CITY_LONGITUDE[key as keyof typeof CITY_LONGITUDE]
  if (typeof lng === 'number') longitudeInput.value = lng.toFixed(2)
})

/** 解析后的经度数值；非法输入或越界返回 undefined */
const parsedLongitude = computed<number | undefined>(() => {
  const raw = Number(longitudeInput.value)
  if (!Number.isFinite(raw)) return undefined
  if (raw < -180 || raw > 180) return undefined
  return raw
})

/** 实时计算偏移分钟用于 UI 预览 */
const offsetMinutes = computed<number | null>(() => {
  if (!useTrueSolar.value) return null
  const lng = parsedLongitude.value
  if (typeof lng !== 'number') return null
  const yNum = Number(year.value)
  const mNum = Number(month.value)
  const dNum = Number(day.value)
  if (!Number.isFinite(yNum) || !Number.isFinite(mNum) || !Number.isFinite(dNum)) return null
  const dayOfYear = computeDayOfYear(yNum, mNum, dNum)
  return Math.round(trueSolarTimeOffset(lng, dayOfYear))
})

const offsetPreviewText = computed(() => {
  const m = offsetMinutes.value
  if (m === null) return ''
  if (m === 0) return t('common.birthInput.offsetPreviewNoChange')
  return t('common.birthInput.offsetPreview', {
    sign: m > 0 ? '+' : '-',
    minutes: Math.abs(m),
  })
})

function cityLabel(key: string): string {
  return t(`common.birthInput.cities.${key}`)
}

const currentYear = new Date().getFullYear()

/** 年份候选：当前年 → 1900（倒序，常用年份在上） */
const yearOptions = computed<string[]>(() => {
  const list: string[] = []
  for (let y = currentYear; y >= 1900; y--) list.push(String(y))
  return list
})

const monthOptions = computed<string[]>(() => Array.from({ length: 12 }, (_, i) => String(i + 1)))

/** 日的天数随年/月/历法变化 —— 阳历按公历闰年计算；阴历统一 30（mock） */
const dayOptions = computed<string[]>(() => {
  const yNum = Number(year.value)
  const mNum = Number(month.value)
  let count = 31
  if (calendar.value === 'lunar') {
    count = 30
  } else if ([4, 6, 9, 11].includes(mNum)) {
    count = 30
  } else if (mNum === 2) {
    const leap = (yNum % 4 === 0 && yNum % 100 !== 0) || yNum % 400 === 0
    count = leap ? 29 : 28
  }
  return Array.from({ length: count }, (_, i) => String(i + 1))
})

/** 当年/月切换时，若当前 day 超出新月份天数，则收敛到末日 */
watch(dayOptions, (opts) => {
  if (!opts.includes(day.value)) day.value = opts[opts.length - 1]
})

watch(gender, (v) => {
  if (userStore.birth.gender !== v) {
    userStore.update({ gender: v })
  }
})

function setCalendar(v: 'solar' | 'lunar') {
  calendar.value = v
}

function onPaipan() {
  /**
   * longitude 计算逻辑：
   *   - 关闭真太阳时 → longitude = undefined（core 退回时钟时间）
   *   - 开启 + 选具体城市 → 取城市经度
   *   - 开启 + custom → 取手动输入的 parsedLongitude
   *   - 开启但 longitudeInput 非法（NaN / 越界） → undefined（fail-safe）
   *
   * birthplace 仅作展示与回显，不参与计算。'custom' 不写回（避免污染 i18n key）。
   */
  let longitude: number | undefined
  let birthplace: string | undefined
  if (props.showAdvanced && useTrueSolar.value) {
    longitude = parsedLongitude.value
    if (birthplaceKey.value && birthplaceKey.value !== 'custom') {
      birthplace = birthplaceKey.value
    }
  }

  userStore.update({
    calendar: calendar.value,
    year: Number(year.value),
    month: Number(month.value),
    day: Number(day.value),
    hour: hourIdxToHour(Number(hourIdx.value)),
    minute: 0,
    gender: gender.value,
    longitude,
    birthplace,
  })
  emit('paipan')
}

function genderLabel(v: 'male' | 'female') {
  return t(`common.birthInput.gender.${v}`)
}
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="gf-card ds-input-card">
    <h2 class="ds-card-title">
      <span class="ds-ornament">◈</span>
      {{ title || t('common.birthInput.inputCardTitle') }}
      <span class="ds-ornament">◈</span>
    </h2>
    <div class="ds-calendar-switch">
      <button
        :class="['ds-switch-btn', { active: calendar === 'solar' }]"
        type="button"
        @click="setCalendar('solar')"
      >
        {{ t('common.birthInput.calendar.solar') }}
      </button>
      <button
        :class="['ds-switch-btn', { active: calendar === 'lunar' }]"
        type="button"
        @click="setCalendar('lunar')"
      >
        {{ t('common.birthInput.calendar.lunar') }}
      </button>
    </div>
    <div class="ds-input-row">
      <div class="ds-input-group">
        <Label>{{ t('common.birthInput.field.year') }}</Label>
        <Select v-model="year">
          <SelectTrigger>
            <SelectValue :placeholder="t('common.placeholder.year')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="y in yearOptions" :key="y" :value="y">{{ y }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('common.birthInput.field.month') }}</Label>
        <Select v-model="month">
          <SelectTrigger>
            <SelectValue :placeholder="t('common.placeholder.month')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="m in monthOptions" :key="m" :value="m">{{ m }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('common.birthInput.field.day') }}</Label>
        <Select v-model="day">
          <SelectTrigger>
            <SelectValue :placeholder="t('common.placeholder.day')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="d in dayOptions" :key="d" :value="d">{{ d }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('common.birthInput.field.hour') }}</Label>
        <Select v-model="hourIdx">
          <SelectTrigger>
            <SelectValue :placeholder="t('common.placeholder.hour')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="(h, i) in hours" :key="h" :value="String(i)">{{ h }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('common.birthInput.field.gender') }}</Label>
        <RadioGroup v-model="gender" class="ds-gender-group">
          <label
            v-for="g in (['male', 'female'] as const)"
            :key="g"
            class="ds-gender-item"
          >
            <RadioGroupItem :value="g" />
            <span>{{ genderLabel(g) }}</span>
          </label>
        </RadioGroup>
      </div>
    </div>
    <details v-if="props.showAdvanced" class="ds-advanced" :open="advancedOpen" @toggle="advancedOpen = ($event.target as HTMLDetailsElement).open">
      <summary class="ds-advanced-summary">
        {{ advancedOpen ? t('common.birthInput.advancedToggleClose') : t('common.birthInput.advancedToggle') }}
      </summary>
      <div class="ds-advanced-body">
        <label class="ds-advanced-toggle">
          <input v-model="useTrueSolar" type="checkbox" />
          <span>{{ t('common.birthInput.trueSolarLabel') }}</span>
        </label>
        <p class="ds-advanced-hint">{{ t('common.birthInput.trueSolarHint') }}</p>
        <div v-if="useTrueSolar" class="ds-advanced-fields">
          <div class="ds-input-group">
            <Label>{{ t('common.birthInput.birthplaceLabel') }}</Label>
            <Select v-model="birthplaceKey">
              <SelectTrigger>
                <SelectValue :placeholder="t('common.birthInput.birthplacePlaceholder')" />
              </SelectTrigger>
              <SelectContent class="max-h-72">
                <SelectItem v-for="key in CITY_KEYS" :key="key" :value="key">{{ cityLabel(key) }}</SelectItem>
                <SelectItem value="custom">{{ t('common.birthInput.birthplaceCustom') }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div v-if="birthplaceKey === 'custom'" class="ds-input-group">
            <Label>{{ t('common.birthInput.longitudeLabel') }}</Label>
            <input
              v-model="longitudeInput"
              class="ds-longitude-input"
              type="number"
              inputmode="decimal"
              step="0.01"
              min="-180"
              max="180"
              :placeholder="t('common.birthInput.longitudePlaceholder')"
            />
            <p class="ds-advanced-hint">{{ t('common.birthInput.longitudeHint') }}</p>
          </div>
          <p v-if="offsetPreviewText" class="ds-advanced-preview">{{ offsetPreviewText }}</p>
        </div>
      </div>
    </details>
    <div class="ds-input-actions">
      <button class="gf-btn" type="button" @click="onPaipan">
        <span>{{ t('common.birthInput.btn.paipanIcon') }}</span> {{ primaryLabel || t('common.birthInput.btn.paipan') }}
      </button>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="mn-card ds-input-card">
    <h2 class="ds-card-title">
      <span class="ds-ornament">·</span>
      {{ title || t('common.birthInput.inputCardTitle') }}
      <span class="ds-ornament">·</span>
    </h2>
    <div class="ds-calendar-switch">
      <button
        :class="['ds-switch-btn', { active: calendar === 'solar' }]"
        type="button"
        @click="setCalendar('solar')"
      >
        {{ t('common.birthInput.calendar.solar') }}
      </button>
      <button
        :class="['ds-switch-btn', { active: calendar === 'lunar' }]"
        type="button"
        @click="setCalendar('lunar')"
      >
        {{ t('common.birthInput.calendar.lunar') }}
      </button>
    </div>
    <div class="ds-input-row">
      <div class="ds-input-group">
        <Label>{{ t('common.birthInput.field.year') }}</Label>
        <Select v-model="year">
          <SelectTrigger>
            <SelectValue :placeholder="t('common.placeholder.year')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="y in yearOptions" :key="y" :value="y">{{ y }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('common.birthInput.field.month') }}</Label>
        <Select v-model="month">
          <SelectTrigger>
            <SelectValue :placeholder="t('common.placeholder.month')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="m in monthOptions" :key="m" :value="m">{{ m }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('common.birthInput.field.day') }}</Label>
        <Select v-model="day">
          <SelectTrigger>
            <SelectValue :placeholder="t('common.placeholder.day')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="d in dayOptions" :key="d" :value="d">{{ d }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('common.birthInput.field.hour') }}</Label>
        <Select v-model="hourIdx">
          <SelectTrigger>
            <SelectValue :placeholder="t('common.placeholder.hour')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="(h, i) in hours" :key="h" :value="String(i)">{{ h }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="ds-input-group">
        <Label>{{ t('common.birthInput.field.gender') }}</Label>
        <RadioGroup v-model="gender" class="ds-gender-group">
          <label
            v-for="g in (['male', 'female'] as const)"
            :key="g"
            class="ds-gender-item"
          >
            <RadioGroupItem :value="g" />
            <span>{{ genderLabel(g) }}</span>
          </label>
        </RadioGroup>
      </div>
    </div>
    <details v-if="props.showAdvanced" class="ds-advanced" :open="advancedOpen" @toggle="advancedOpen = ($event.target as HTMLDetailsElement).open">
      <summary class="ds-advanced-summary">
        {{ advancedOpen ? t('common.birthInput.advancedToggleClose') : t('common.birthInput.advancedToggle') }}
      </summary>
      <div class="ds-advanced-body">
        <label class="ds-advanced-toggle">
          <input v-model="useTrueSolar" type="checkbox" />
          <span>{{ t('common.birthInput.trueSolarLabel') }}</span>
        </label>
        <p class="ds-advanced-hint">{{ t('common.birthInput.trueSolarHint') }}</p>
        <div v-if="useTrueSolar" class="ds-advanced-fields">
          <div class="ds-input-group">
            <Label>{{ t('common.birthInput.birthplaceLabel') }}</Label>
            <Select v-model="birthplaceKey">
              <SelectTrigger>
                <SelectValue :placeholder="t('common.birthInput.birthplacePlaceholder')" />
              </SelectTrigger>
              <SelectContent class="max-h-72">
                <SelectItem v-for="key in CITY_KEYS" :key="key" :value="key">{{ cityLabel(key) }}</SelectItem>
                <SelectItem value="custom">{{ t('common.birthInput.birthplaceCustom') }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div v-if="birthplaceKey === 'custom'" class="ds-input-group">
            <Label>{{ t('common.birthInput.longitudeLabel') }}</Label>
            <input
              v-model="longitudeInput"
              class="ds-longitude-input"
              type="number"
              inputmode="decimal"
              step="0.01"
              min="-180"
              max="180"
              :placeholder="t('common.birthInput.longitudePlaceholder')"
            />
            <p class="ds-advanced-hint">{{ t('common.birthInput.longitudeHint') }}</p>
          </div>
          <p v-if="offsetPreviewText" class="ds-advanced-preview">{{ offsetPreviewText }}</p>
        </div>
      </div>
    </details>
    <div class="ds-input-actions">
      <button class="mn-btn mn-btn-lg" type="button" @click="onPaipan">
        {{ primaryLabel || t('common.birthInput.btn.paipan') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 性别 RadioGroup 横向排列 + label-radio 间距 */
.ds-gender-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  height: 42px;
  padding-inline: 4px;
}

.ds-gender-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-ink);
}

.ds-gender-item span {
  user-select: none;
}

/* ---------- 真太阳时高级选项（共享于国风 / 简约） ---------- */
.ds-advanced {
  margin-top: 12px;
  border: 1px solid var(--color-border, rgba(127, 127, 127, 0.18));
  border-radius: 8px;
  padding: 8px 14px;
  background: var(--color-bg-elevated, rgba(127, 127, 127, 0.04));
}

.ds-advanced-summary {
  cursor: pointer;
  font-size: 13px;
  color: var(--color-ink-soft, rgba(0, 0, 0, 0.6));
  list-style: none;
  user-select: none;
  padding: 4px 0;
}

.ds-advanced-summary::-webkit-details-marker {
  display: none;
}

.ds-advanced-summary::before {
  content: '▸ ';
  display: inline-block;
  transition: transform 0.15s ease;
}

.ds-advanced[open] .ds-advanced-summary::before {
  transform: rotate(90deg);
}

.ds-advanced-body {
  padding: 8px 0 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ds-advanced-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-ink);
}

.ds-advanced-toggle input[type='checkbox'] {
  width: 14px;
  height: 14px;
  accent-color: var(--color-accent, #8c5a3a);
}

.ds-advanced-hint {
  margin: 0;
  font-size: 12px;
  color: var(--color-ink-muted, rgba(0, 0, 0, 0.45));
  line-height: 1.5;
}

.ds-advanced-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
}

.ds-longitude-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--color-border, rgba(127, 127, 127, 0.25));
  border-radius: 6px;
  background: var(--color-bg, transparent);
  color: var(--color-ink);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;
}

.ds-longitude-input:focus {
  border-color: var(--color-accent, #8c5a3a);
}

.ds-advanced-preview {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-accent, #8c5a3a);
}
</style>
