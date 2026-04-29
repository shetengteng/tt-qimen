<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useJiemengStore } from '../stores/jiemengStore'
import type { DreamCategoryKey } from '../types'
import { CATEGORY_KEYS } from '../data/categories'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * 解梦 · 搜索输入卡：复用 ds-input-card 公共规范。
 * 两列布局：关键词 + 分类筛选；下方提示语 + 查询/清空 按钮。
 */
const emit = defineEmits<{
  (e: 'search'): void
  (e: 'reset'): void
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const store = useJiemengStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const categoryModel = computed<string>({
  get: () => store.activeCategory ?? 'auto',
  set: (v) => store.setActiveCategory(v === 'auto' ? null : (v as DreamCategoryKey)),
})

function onSubmit() {
  emit('search')
}
function onReset() {
  store.setQuery('')
  store.setActiveCategory(null)
  emit('reset')
}
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="gf-card ds-input-card jm-input-card">
    <h3 class="ds-card-title">
      <span class="ds-ornament">☌</span>
      {{ t('jiemeng.input.title') }}
      <span class="ds-ornament">☌</span>
    </h3>

    <div class="ds-input-row jm-input-row">
      <div class="ds-input-group">
        <Label>{{ t('jiemeng.input.keywordLabel') }}</Label>
        <Input
          :model-value="store.query"
          type="text"
          :placeholder="t('jiemeng.input.keywordPlaceholder')"
          @update:model-value="(v) => store.setQuery(String(v))"
          @keydown.enter="onSubmit"
        />
      </div>
      <div class="ds-input-group">
        <Label>{{ t('jiemeng.input.categoryLabel') }}</Label>
        <Select v-model="categoryModel">
          <SelectTrigger>
            <SelectValue :placeholder="t('jiemeng.input.categoryAuto')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem value="auto">{{ t('jiemeng.input.categoryAuto') }}</SelectItem>
            <SelectItem v-for="cat in CATEGORY_KEYS" :key="cat" :value="cat">
              {{ t(`jiemeng.category.${cat}`) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="ds-input-actions">
      <Button type="button" variant="default" size="lg" @click="onSubmit">
        {{ t('jiemeng.btn.searchIcon') }} {{ t('jiemeng.btn.search') }}
      </Button>
      <Button type="button" variant="outline" @click="onReset">
        {{ t('jiemeng.btn.resetIcon') }} {{ t('jiemeng.btn.reset') }}
      </Button>
    </div>

    <p class="jm-input-hint">{{ t('jiemeng.input.hint') }}</p>
  </div>

  <!-- 简约 -->
  <div v-else class="mn-card ds-input-card jm-input-card">
    <h3 class="ds-card-title">
      <span class="ds-ornament">⌕</span>
      {{ t('jiemeng.input.title') }}
    </h3>

    <div class="ds-input-row jm-input-row">
      <div class="ds-input-group">
        <Label>{{ t('jiemeng.input.keywordLabel') }}</Label>
        <Input
          :model-value="store.query"
          type="text"
          :placeholder="t('jiemeng.input.keywordPlaceholder')"
          @update:model-value="(v) => store.setQuery(String(v))"
          @keydown.enter="onSubmit"
        />
      </div>
      <div class="ds-input-group">
        <Label>{{ t('jiemeng.input.categoryLabel') }}</Label>
        <Select v-model="categoryModel">
          <SelectTrigger>
            <SelectValue :placeholder="t('jiemeng.input.categoryAuto')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem value="auto">{{ t('jiemeng.input.categoryAuto') }}</SelectItem>
            <SelectItem v-for="cat in CATEGORY_KEYS" :key="cat" :value="cat">
              {{ t(`jiemeng.category.${cat}`) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="ds-input-actions">
      <Button type="button" variant="default" size="lg" @click="onSubmit">
        {{ t('jiemeng.btn.search') }}
      </Button>
      <Button type="button" variant="outline" @click="onReset">
        {{ t('jiemeng.btn.reset') }}
      </Button>
    </div>

    <p class="jm-input-hint">{{ t('jiemeng.input.hint') }}</p>
  </div>
</template>
