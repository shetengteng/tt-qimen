<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useXingmingStore } from '../stores/xingmingStore'
import type { Gender } from '../types'

interface Props {
  title?: string
  primaryLabel?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  primaryLabel: '',
})

const emit = defineEmits<{
  calculate: []
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const store = useXingmingStore()

/** 年份 select sentinel：reka-ui SelectItem 不允许空字符串 value，故用占位符表示"未指定"。 */
const UNSPECIFIED_YEAR = '__unspecified__'

const surname = ref(store.input.surname)
const givenName = ref(store.input.givenName)
const gender = ref<Gender>(store.input.gender)
const birthYearStr = ref(
  store.input.birthYear == null ? UNSPECIFIED_YEAR : String(store.input.birthYear),
)

watch(
  () => store.input,
  (v) => {
    surname.value = v.surname
    givenName.value = v.givenName
    gender.value = v.gender
    birthYearStr.value = v.birthYear == null ? UNSPECIFIED_YEAR : String(v.birthYear)
  },
  { deep: true },
)

/**
 * 年份候选：当前年 → 1900（倒序，常用年份在上）。与 BirthForm 同款实现，便于用户跨模块复用记忆。
 * 首项使用 sentinel `__unspecified__` 让用户显式选回"未指定"。
 */
const currentYear = new Date().getFullYear()
const yearOptions = computed<string[]>(() => {
  const list: string[] = []
  for (let y = currentYear; y >= 1900; y--) list.push(String(y))
  return list
})

function commitAndEmit() {
  const raw = birthYearStr.value
  const year =
    raw === UNSPECIFIED_YEAR || raw === '' ? null : Number(raw)
  store.update({
    surname: surname.value.trim(),
    givenName: givenName.value.trim(),
    gender: gender.value,
    birthYear: Number.isFinite(year) && year !== null && year > 0 ? year : null,
  })
  emit('calculate')
}

function genderLabel(g: Gender) {
  return t(`xingming.gender.${g}`)
}
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="gf-card ds-input-card xm-name-input">
    <h3 class="ds-card-title">
      <span class="ds-ornament">◈</span>
      {{ title || t('xingming.inputCardTitle') }}
      <span class="ds-ornament">◈</span>
    </h3>

    <div class="ds-input-row xm-row-name">
      <div class="ds-input-group">
        <Label>{{ t('xingming.field.surname') }}</Label>
        <input
          v-model="surname"
          type="text"
          :placeholder="t('xingming.placeholder.surname')"
          maxlength="2"
        />
      </div>
      <div class="ds-input-group">
        <Label>{{ t('xingming.field.givenName') }}</Label>
        <input
          v-model="givenName"
          type="text"
          :placeholder="t('xingming.placeholder.givenName')"
          maxlength="2"
        />
      </div>
    </div>

    <div class="ds-input-row xm-row-meta">
      <div class="ds-input-group">
        <Label>{{ t('xingming.field.gender') }}</Label>
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
      <div class="ds-input-group">
        <Label>{{ t('xingming.field.birthYear') }}</Label>
        <Select v-model="birthYearStr">
          <SelectTrigger class="w-full">
            <SelectValue :placeholder="t('xingming.placeholder.birthYear')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem :value="UNSPECIFIED_YEAR">
              {{ t('xingming.birthYearOption.unspecified') }}
            </SelectItem>
            <SelectItem v-for="y in yearOptions" :key="y" :value="y">{{ y }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="ds-input-actions">
      <button class="gf-btn" type="button" @click="commitAndEmit">
        <span>◈</span> {{ primaryLabel || t('xingming.btn.calculate') }}
      </button>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="mn-card ds-input-card xm-name-input">
    <h3 class="ds-card-title">
      <span class="ds-ornament">◆</span>
      {{ title || t('xingming.inputCardTitle') }}
    </h3>

    <div class="ds-input-row xm-row-name">
      <div class="ds-input-group">
        <Label>{{ t('xingming.field.surname') }}</Label>
        <input
          v-model="surname"
          type="text"
          :placeholder="t('xingming.placeholder.surname')"
          maxlength="2"
        />
      </div>
      <div class="ds-input-group">
        <Label>{{ t('xingming.field.givenName') }}</Label>
        <input
          v-model="givenName"
          type="text"
          :placeholder="t('xingming.placeholder.givenName')"
          maxlength="2"
        />
      </div>
    </div>

    <div class="ds-input-row xm-row-meta">
      <div class="ds-input-group">
        <Label>{{ t('xingming.field.gender') }}</Label>
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
      <div class="ds-input-group">
        <Label>{{ t('xingming.field.birthYear') }}</Label>
        <Select v-model="birthYearStr">
          <SelectTrigger class="w-full">
            <SelectValue :placeholder="t('xingming.placeholder.birthYear')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem :value="UNSPECIFIED_YEAR">
              {{ t('xingming.birthYearOption.unspecified') }}
            </SelectItem>
            <SelectItem v-for="y in yearOptions" :key="y" :value="y">{{ y }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="ds-input-actions">
      <button class="mn-btn mn-btn-lg" type="button" @click="commitAndEmit">
        {{ primaryLabel || t('xingming.btn.calculate') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/**
 * 第一行：姓 / 名 桌面端 1fr 2fr（双名通常 2 字宽于 1-2 字姓），
 * mobile 改为均分 1fr/1fr，避免短姓输入框被压成"半字"宽度。
 */
.xm-row-name {
  grid-template-columns: 1fr 2fr;
}
@media (max-width: 768px) {
  .xm-row-name {
    grid-template-columns: 1fr 1fr;
  }
}

/**
 * 第二行：性别 / 出生年 桌面端 1fr 1fr；mobile 同样保持 1fr 1fr。
 * 使用具名类避免被 .ds-input-row 默认 `auto-fit minmax(140px, 1fr)` 在窄屏挤压成单列。
 */
.xm-row-meta {
  grid-template-columns: 1fr 1fr;
}

/**
 * Grid cell 防溢出：HTML <input> 默认宽度 ≈ 150px（基于 `size` 属性），
 * 在窄屏 grid cell（< 150px）里会撑爆 cell。
 * 1) `.ds-input-group` 显式 `min-width: 0`：解除 grid item 默认 `min-width: auto` 限制
 * 2) `.ds-input-group input`: `width: 100%` 让 input 受 cell 约束
 * 注：`box-sizing: border-box` 由通用层 base.css `*` 已保证，不重复声明。
 */
.ds-input-group {
  min-width: 0;
}
.ds-input-group input {
  width: 100%;
}

/**
 * 性别 RadioGroup 复用与 BirthForm 完全一致的规格（横排、42px 等高对齐 input）。
 * 高度与同行 input 保持齐平，避免上下错位。
 */
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
