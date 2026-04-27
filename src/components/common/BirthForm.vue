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
 * 真太阳时简化交互（2026-04-27）：
 *   - 出生城市选择直接放在性别后面同一行，"选了城市 = 开启真太阳时"，"清空 = 关闭"。
 *   - 砍掉「高级选项」折叠块、useTrueSolar 开关、自定义经度输入：
 *     · 34 个常用城市已覆盖 95%+ 用户场景
 *     · 用户不再需要面对"经度°E"等专业概念
 *   - 城市搜索通过 CityCombobox 实现，支持中/英/拼音 key 模糊匹配。
 *   - 不再展示偏移分钟数预览（保持表单视觉简洁，结果在排盘后体现）。
 *
 * 复用方式：
 *   - bazi: <BirthForm @paipan="onPaipan" />（默认按钮文案使用 common.birthInput.btn.paipan）
 *   - ziwei / chenggu: <BirthForm :title="t('xx.inputCardTitle')" :primary-label="t('xx.btn.paipan')" />
 *   - 不需要真太阳时的页面（如 chenggu）传 :show-birthplace="false" 隐藏城市字段
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
import CityCombobox from '@/components/common/CityCombobox.vue'
import { CITY_LONGITUDE } from '@/lib/trueSolarTime'

interface Props {
  /** 标题文案覆盖；为空时回退到 common.birthInput.inputCardTitle */
  title?: string
  /** 主按钮文案覆盖（已经过 i18n 处理） */
  primaryLabel?: string
  /**
   * 是否展示出生城市字段（=真太阳时开关）。
   * - bazi / ziwei → true（默认）：core 会消费 longitude
   * - chenggu / 其他不消费 longitude 的页面 → 调用方传 false 隐藏，避免误导
   *
   * 兼容别名：`showAdvanced` 已弃用，遗留调用站若仍传 :show-advanced="false" 也按隐藏处理。
   */
  showBirthplace?: boolean
  /** @deprecated 用 showBirthplace 替代；本字段仅作向后兼容 */
  showAdvanced?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  primaryLabel: '',
  showBirthplace: undefined,
  showAdvanced: undefined,
})

const emit = defineEmits<{
  paipan: []
}>()

const { t, tm } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const userStore = useBirthStore()

/** 实际是否展示出生城市字段：showBirthplace 优先，未传时回退到 showAdvanced；都未传时默认 true */
const shouldShowBirthplace = computed<boolean>(() => {
  if (typeof props.showBirthplace === 'boolean') return props.showBirthplace
  if (typeof props.showAdvanced === 'boolean') return props.showAdvanced
  return true
})

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
// 真太阳时（出生城市）
// ---------------------------------------------------------------------------
//
// 数据流：
//   - 用户在城市搜索框选城市 → birthplaceKey 改变 → 写回 store.longitude / birthplace
//   - 清空 → birthplaceKey = ''，longitude = undefined，core 自动回退到时钟时间
//
// 不再支持「自定义经度」入口；35 个常用城市已覆盖 95% 用户场景，进一步降低交互复杂度。

const CITY_KEYS = Object.freeze(Object.keys(CITY_LONGITUDE)) as readonly string[]

/**
 * 反推初始 birthplaceKey：若 store 中 longitude 命中某城市经度（误差 <0.05°）
 * 选中该城市；否则视为未选（自定义经度的旧数据被透明丢弃）。
 */
function detectCityKey(longitude: number | undefined): string {
  if (typeof longitude !== 'number') return ''
  for (const key of CITY_KEYS) {
    if (Math.abs(CITY_LONGITUDE[key] - longitude) < 0.05) return key
  }
  return ''
}

const birthplaceKey = ref<string>(detectCityKey(userStore.birth.longitude))

/** city key → 经度数值，未选返回 undefined */
const selectedLongitude = computed<number | undefined>(() => {
  if (!birthplaceKey.value) return undefined
  return CITY_LONGITUDE[birthplaceKey.value as keyof typeof CITY_LONGITUDE]
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
   * longitude 计算逻辑（简化版）：
   *   - 选了城市 → longitude = CITY_LONGITUDE[key]，birthplace = key
   *   - 没选城市 / 城市字段隐藏 → longitude = undefined，birthplace = undefined
   * core 看到 longitude === undefined 自动回退到时钟时间。
   */
  let longitude: number | undefined
  let birthplace: string | undefined
  if (shouldShowBirthplace.value && birthplaceKey.value) {
    longitude = selectedLongitude.value
    birthplace = birthplaceKey.value
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
      <div v-if="shouldShowBirthplace" class="ds-input-group ds-birthplace-group">
        <Label>{{ t('common.birthInput.birthplaceLabel') }}</Label>
        <CityCombobox
          v-model="birthplaceKey"
          :options="CITY_KEYS"
          :label-of="cityLabel"
          :placeholder="t('common.birthInput.birthplaceSearchPlaceholder')"
          :no-result-text="t('common.birthInput.birthplaceNoResult')"
          :clear-title="t('common.birthInput.birthplaceClear')"
        />
      </div>
    </div>
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
      <div v-if="shouldShowBirthplace" class="ds-input-group ds-birthplace-group">
        <Label>{{ t('common.birthInput.birthplaceLabel') }}</Label>
        <CityCombobox
          v-model="birthplaceKey"
          :options="CITY_KEYS"
          :label-of="cityLabel"
          :placeholder="t('common.birthInput.birthplaceSearchPlaceholder')"
          :no-result-text="t('common.birthInput.birthplaceNoResult')"
          :clear-title="t('common.birthInput.birthplaceClear')"
        />
      </div>
    </div>
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

/* ---------- 出生城市（inline 真太阳时入口） ---------- */
/*
 * 在 ds-input-row（grid）内新增的 input-group。
 * 紧跟在性别字段之后，作为同一行的最后一个单元，避免破坏年/月/日/时/性别的等宽布局。
 */
.ds-birthplace-group {
  /* CityCombobox 自身 100% 宽度，无需额外约束；保留 hook 类便于消费方覆盖 */
}
</style>
