<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
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

const surname = ref(store.input.surname)
const givenName = ref(store.input.givenName)
const gender = ref<Gender>(store.input.gender)
const birthYearStr = ref(store.input.birthYear == null ? '' : String(store.input.birthYear))

watch(
  () => store.input,
  (v) => {
    surname.value = v.surname
    givenName.value = v.givenName
    gender.value = v.gender
    birthYearStr.value = v.birthYear == null ? '' : String(v.birthYear)
  },
  { deep: true },
)

function commitAndEmit() {
  const trimmedYear = birthYearStr.value.trim()
  const year = trimmedYear ? Number(trimmedYear) : null
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
        <input
          v-model="birthYearStr"
          type="text"
          inputmode="numeric"
          :placeholder="t('xingming.placeholder.birthYear')"
          maxlength="4"
        />
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
        <input
          v-model="birthYearStr"
          type="text"
          inputmode="numeric"
          :placeholder="t('xingming.placeholder.birthYear')"
          maxlength="4"
        />
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
