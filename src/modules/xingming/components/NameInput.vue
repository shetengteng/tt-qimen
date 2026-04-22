<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
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
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="gf-card ds-input-card xm-name-input">
    <h3 class="ds-card-title">
      <span class="ds-ornament">◈</span>
      {{ title || t('xingming.inputCardTitle') }}
      <span class="ds-ornament">◈</span>
    </h3>

    <div class="ds-input-row" style="grid-template-columns: 1fr 2fr;">
      <div class="ds-input-group">
        <label>{{ t('xingming.field.surname') }}</label>
        <input
          v-model="surname"
          type="text"
          :placeholder="t('xingming.placeholder.surname')"
          maxlength="2"
        />
      </div>
      <div class="ds-input-group">
        <label>{{ t('xingming.field.givenName') }}</label>
        <input
          v-model="givenName"
          type="text"
          :placeholder="t('xingming.placeholder.givenName')"
          maxlength="2"
        />
      </div>
    </div>

    <div class="ds-input-row">
      <div class="ds-input-group">
        <label>{{ t('xingming.field.gender') }}</label>
        <select v-model="gender">
          <option value="male">{{ t('xingming.gender.male') }}</option>
          <option value="female">{{ t('xingming.gender.female') }}</option>
        </select>
      </div>
      <div class="ds-input-group">
        <label>{{ t('xingming.field.birthYear') }}</label>
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

    <div class="ds-input-row" style="grid-template-columns: 1fr 2fr;">
      <div class="ds-input-group">
        <label>{{ t('xingming.field.surname') }}</label>
        <input
          v-model="surname"
          type="text"
          :placeholder="t('xingming.placeholder.surname')"
          maxlength="2"
        />
      </div>
      <div class="ds-input-group">
        <label>{{ t('xingming.field.givenName') }}</label>
        <input
          v-model="givenName"
          type="text"
          :placeholder="t('xingming.placeholder.givenName')"
          maxlength="2"
        />
      </div>
    </div>

    <div class="ds-input-row">
      <div class="ds-input-group">
        <label>{{ t('xingming.field.gender') }}</label>
        <select v-model="gender">
          <option value="male">{{ t('xingming.gender.male') }}</option>
          <option value="female">{{ t('xingming.gender.female') }}</option>
        </select>
      </div>
      <div class="ds-input-group">
        <label>{{ t('xingming.field.birthYear') }}</label>
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
