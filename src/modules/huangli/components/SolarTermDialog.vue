<script setup lang="ts">
/**
 * 24 节气科普卡 · Dialog 弹框版（B3，2026-04-25）。
 *
 * 触发：MiniCalendar 里点击「节气交接日」cell 上的小角标 / cell 主体（双击/长按规避）
 * 数据来源：data/solarTerms.ts（公版 24 节气含义、物候三候、民俗）
 *
 * 设计要点：
 *   - 复用 jiemeng/almanac 已有的 jm-dialog-* 视觉语言（reka-ui Dialog + 双主题）
 *   - 标题「{节气名} · {季节}」，副标题为拼音 + 农历位置
 *   - 主体三栏：含义释 / 物候三候 / 民俗活动（短语 chip）
 *   - 不提供分享按钮（节气科普是导览型，不需要分享）
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from 'reka-ui'
import { X } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { getSolarTerm, type SolarTermSeason } from '../data/solarTerms'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  open: boolean
  /** 节气名（如 '清明'）；为 null 时 dialog 不应被打开 */
  termName: string | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  /** 用户在科普卡里点「查看当日详情」按钮（关掉本 dialog 同时打开 DayDetailDialog）。 */
  (e: 'view-day'): void
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const term = computed(() => getSolarTerm(props.termName))

const seasonLabel = computed<string>(() => {
  const s = term.value?.season
  if (!s) return ''
  const key: Record<SolarTermSeason, string> = {
    spring: 'huangli.solarTerm.season.spring',
    summer: 'huangli.solarTerm.season.summer',
    autumn: 'huangli.solarTerm.season.autumn',
    winter: 'huangli.solarTerm.season.winter',
  }
  return t(key[s])
})

const titleText = computed<string>(() => {
  if (!term.value) {
    return t('huangli.solarTerm.dialogTitle', { name: '' }).replace(/\s*·\s*$/, '')
  }
  // 走 i18n 模板：'节气 · {name}'，再追加 · {季节} 形成「节气 · 清明 · 春」
  const head = t('huangli.solarTerm.dialogTitle', { name: term.value.name })
  return seasonLabel.value ? `${head} · ${seasonLabel.value}` : head
})

function setOpen(value: boolean) {
  emit('update:open', value)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="setOpen">
    <DialogPortal>
      <DialogOverlay class="jm-dialog-overlay" />
      <DialogContent
        class="jm-dialog-content"
        :class="isGuofeng ? 'jm-dialog-content--gf' : 'jm-dialog-content--mn'"
        :aria-describedby="undefined"
      >
        <header class="jm-dialog-head">
          <DialogTitle class="jm-dialog-title">{{ titleText }}</DialogTitle>
          <DialogClose
            class="jm-dialog-close"
            :aria-label="t('huangli.solarTerm.closeAria')"
          >
            <X :size="18" aria-hidden="true" />
          </DialogClose>
        </header>

        <div class="jm-dialog-body">
          <div v-if="term" class="hl-term-card">
            <div class="hl-term-pinyin">{{ term.pinyin }}</div>

            <section class="hl-term-section">
              <h4>{{ t('huangli.solarTerm.meaningLabel') }}</h4>
              <p class="hl-term-meaning">{{ term.meaning }}</p>
            </section>

            <section v-if="term.phenomena.length" class="hl-term-section">
              <h4>{{ t('huangli.solarTerm.phenomenaLabel') }}</h4>
              <ol class="hl-term-phenomena">
                <li v-for="(p, idx) in term.phenomena" :key="idx">
                  <span class="hl-term-pheno-idx">{{ idx + 1 }}</span>
                  <span>{{ p }}</span>
                </li>
              </ol>
            </section>

            <section v-if="term.customs.length" class="hl-term-section">
              <h4>{{ t('huangli.solarTerm.customsLabel') }}</h4>
              <ul class="hl-term-customs">
                <li v-for="(c, idx) in term.customs" :key="idx">{{ c }}</li>
              </ul>
            </section>
          </div>

          <div v-else class="hl-term-empty">
            {{ t('huangli.solarTerm.notFound') }}
          </div>
        </div>

        <footer v-if="term" class="jm-dialog-foot">
          <Button type="button" variant="outline" class="jm-action-btn" @click="emit('view-day')">
            {{ t('huangli.solarTerm.viewDayBtn') }}
          </Button>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
