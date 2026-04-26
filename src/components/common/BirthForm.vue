<script setup lang="ts">
/**
 * BirthForm — 共享生辰输入组件（八字 / 紫微 / 称骨复用）
 *
 * 物理位置：`@/components/common/BirthForm.vue`
 *
 * 已知技术债（非本次范畴）：
 *   - 模板内的 i18n key 仍使用 `bazi.field.*` / `bazi.calendar.*` / `bazi.gender.*` /
 *     `bazi.hours` / `bazi.btn.paipan` 等命名，与组件位置不再匹配。
 *   - 真正干净的方案是把 birth-input 相关的 i18n key 提到 `common.birthInput.*`，
 *     但这会触动 zh-CN / zh-TW / en 三套词表与既有 8 个模块的引用，超出"物理移动"
 *     这一最小变更范围，故本次仅迁移文件位置，i18n 重整留作 TODO。
 *
 * 复用方式：
 *   - bazi: <BirthForm @paipan="onPaipan" />（用默认 bazi.inputCardTitle / bazi.btn.paipan）
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

interface Props {
  /** 标题文案覆盖；为空时回退到 bazi.inputCardTitle */
  title?: string
  /** 主按钮文案覆盖（已经过 i18n 处理） */
  primaryLabel?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  primaryLabel: '',
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
 * bazi.hours i18n 顺序：早子(0) 丑(1) 寅(2) 卯(3) 辰(4) 巳(5) 午(6) 未(7) 申(8) 酉(9) 戌(10) 亥(11) 晚子(12)
 * 早子 = 0:30 平均，晚子 = 23:30 平均（命理通用规则）
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

const hours = computed(() => (tm('bazi.hours') as string[]) ?? [])

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
  userStore.update({
    calendar: calendar.value,
    year: Number(year.value),
    month: Number(month.value),
    day: Number(day.value),
    hour: hourIdxToHour(Number(hourIdx.value)),
    minute: 0,
    gender: gender.value,
  })
  emit('paipan')
}

function genderLabel(v: 'male' | 'female') {
  return t(`bazi.gender.${v}`)
}
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="gf-card ds-input-card">
    <h2 class="ds-card-title">
      <span class="ds-ornament">◈</span>
      {{ title || t('bazi.inputCardTitle') }}
      <span class="ds-ornament">◈</span>
    </h2>
    <div class="ds-calendar-switch">
      <button
        :class="['ds-switch-btn', { active: calendar === 'solar' }]"
        type="button"
        @click="setCalendar('solar')"
      >
        {{ t('bazi.calendar.solar') }}
      </button>
      <button
        :class="['ds-switch-btn', { active: calendar === 'lunar' }]"
        type="button"
        @click="setCalendar('lunar')"
      >
        {{ t('bazi.calendar.lunar') }}
      </button>
    </div>
    <div class="ds-input-row">
      <div class="ds-input-group">
        <Label>{{ t('bazi.field.year') }}</Label>
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
        <Label>{{ t('bazi.field.month') }}</Label>
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
        <Label>{{ t('bazi.field.day') }}</Label>
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
        <Label>{{ t('bazi.field.hour') }}</Label>
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
        <Label>{{ t('bazi.field.gender') }}</Label>
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
    <div class="ds-input-actions">
      <button class="gf-btn" type="button" @click="onPaipan">
        <span>{{ t('bazi.btn.paipanIcon') }}</span> {{ primaryLabel || t('bazi.btn.paipan') }}
      </button>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="mn-card ds-input-card">
    <h2 class="ds-card-title">
      <span class="ds-ornament">·</span>
      {{ title || t('bazi.inputCardTitle') }}
      <span class="ds-ornament">·</span>
    </h2>
    <div class="ds-calendar-switch">
      <button
        :class="['ds-switch-btn', { active: calendar === 'solar' }]"
        type="button"
        @click="setCalendar('solar')"
      >
        {{ t('bazi.calendar.solar') }}
      </button>
      <button
        :class="['ds-switch-btn', { active: calendar === 'lunar' }]"
        type="button"
        @click="setCalendar('lunar')"
      >
        {{ t('bazi.calendar.lunar') }}
      </button>
    </div>
    <div class="ds-input-row">
      <div class="ds-input-group">
        <Label>{{ t('bazi.field.year') }}</Label>
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
        <Label>{{ t('bazi.field.month') }}</Label>
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
        <Label>{{ t('bazi.field.day') }}</Label>
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
        <Label>{{ t('bazi.field.hour') }}</Label>
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
        <Label>{{ t('bazi.field.gender') }}</Label>
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
    <div class="ds-input-actions">
      <button class="mn-btn mn-btn-lg" type="button" @click="onPaipan">
        {{ primaryLabel || t('bazi.btn.paipan') }}
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
</style>
