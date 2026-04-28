<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { useBaziStore } from './stores/baziStore'
import BirthForm from '@/components/common/BirthForm.vue'
import FourPillarsTable from './components/FourPillarsTable.vue'
import ShishenStructure from './components/ShishenStructure.vue'
import ElementsRadar from './components/ElementsRadar.vue'
import InterpretBlock from './components/InterpretBlock.vue'
import ShenshaBlock from './components/ShenshaBlock.vue'
import DayunTimeline from './components/DayunTimeline.vue'
import FlowYears from './components/FlowYears.vue'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import InlineAnnotsBar from '@/components/common/InlineAnnotsBar.vue'
import ShareToast from '@/components/common/ShareToast.vue'
import SharePreviewDialog from '@/components/common/SharePreviewDialog.vue'
import ResultBanner from '@/components/common/ResultBanner.vue'
import AskAiButton from '@/components/ai/AskAiButton.vue'
import AiDrawer from '@/components/ai/AiDrawer.vue'
import { useAnnotBar } from '@/composables/useAnnotBar'
import { useShareCard } from '@/composables/useShareCard'
import { buildShareUrl, normalizeQuery, readIntInRange } from '@/lib/shareUrl'
import { useBaziDrawings, type BaziArc } from './composables/useBaziDrawings'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { calculateBazi } from './core/bazi'
import { detectZhiRelations } from './core/zhiRelations'
import type { BaziChart, PillarCell, PillarInfo } from './types'

const { t, tm } = useI18n()
const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
const baziStore = useBaziStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const inputCardEl = ref<HTMLElement | null>(null)
const resultBannerEl = ref<HTMLElement | null>(null)
const fourPillarsEl = ref<InstanceType<typeof FourPillarsTable> | null>(null)
const dayunEl = ref<InstanceType<typeof DayunTimeline> | null>(null)

/** v3.1.1 注释交互：3 个 section 的 CollapsibleSection ref，用于注释 toggle 后重测 max-height */
const chartSectionEl = ref<InstanceType<typeof CollapsibleSection> | null>(null)
const interpretSectionEl = ref<InstanceType<typeof CollapsibleSection> | null>(null)
const shenshaSectionEl = ref<InstanceType<typeof CollapsibleSection> | null>(null)
const flowSectionEl = ref<InstanceType<typeof CollapsibleSection> | null>(null)

/** v3.1.1 注释交互：InterpretBlock / ShenshaBlock 的 ref，用于 toggleAll 转发 */
const interpretBlockEl = ref<InstanceType<typeof InterpretBlock> | null>(null)
const shenshaBlockEl = ref<InstanceType<typeof ShenshaBlock> | null>(null)

const chart = shallowRef<BaziChart | null>(null)

/**
 * v3.1.1 注释交互（命盘 Nayin）：状态由 BaziPage 托管，
 * 避免锚点（在 FourPillarsTable 内）与展开容器 InlineAnnotsBar
 * （在命盘 section 内、紧贴 .bazi-table 之后）跨组件共享 state。
 *
 * 等价方案 §11.9 的 Vue 落地建议：
 *   <ChartSection>
 *     <FourPillarsTable @toggle-nayin="..." />
 *     <InlineAnnotsBar layout="nayin" :items="..." />
 *     <ShishenStructure />
 *     <ElementsRadar />
 *   </ChartSection>
 */
const nayinAnnotItems = computed(() => fourPillarsEl.value?.nayinAnnotItems() ?? [])
const nayinAnnotBar = useAnnotBar(nayinAnnotItems)
const annotLabelNayin = computed(() => t('bazi.collapse.annotLabel.nayin'))
const nayinOpenKeySet = computed<ReadonlySet<string>>(() => {
  const s = new Set<string>()
  for (const it of nayinAnnotBar.openItems.value) s.add(it.focus)
  return s
})

/** 把 PillarInfo 转换为 UI 用的 PillarCell（兼容旧 FourPillarsTable 模板） */
function toPillarCell(p: PillarInfo, isDay: boolean): PillarCell {
  return {
    gan: p.gan,
    zhi: p.zhi,
    ganAttr: isDay ? `${p.ganYinYang}${p.ganElement} · 日主` : `${p.ganYinYang}${p.ganElement}`,
    zhiAttr: `${p.zhiYinYang}${p.zhiElement}`,
    shishen: p.tenGod,
    nayin: p.nayin,
    canggang: p.hideStems.map(h => h.gan),
    cangganSingle: p.hideStemSingle,
  }
}

/**
 * 以下 computed 均假设 `chart.value` 非空（result-zone 外层通过 v-if 拦截 null 态）。
 * 未排盘时 BaziPage 只渲染 BirthForm，不会消费这些 computed。
 */
const arcs = computed<BaziArc[]>(() => {
  const c = chart.value
  if (!c) return []
  const p = c.pillars
  return detectZhiRelations(p.year, p.month, p.day, p.hour)
})

const pillarsLocalized = computed<PillarCell[]>(() => {
  const c = chart.value
  if (!c) return []
  const p = c.pillars
  return [
    toPillarCell(p.year, false),
    toPillarCell(p.month, false),
    toPillarCell(p.day, true),
    toPillarCell(p.hour, false),
  ]
})

const meta = computed(() => {
  const c = chart.value
  if (!c) return { solar: '', lunar: '', genderTitle: undefined as '乾造' | '坤造' | undefined }
  return {
    solar: c.meta.solar,
    lunar: c.meta.lunar,
    genderTitle: c.meta.genderTitle,
  }
})

const metaLabels = computed(() => {
  const m = tm('bazi.chartMeta') as Record<string, string>
  return { solar: m.solarLabel, lunar: m.lunarLabel }
})

/** 四柱表头副标题（chart 存在时才有意义） */
const headerSubs = computed(() => {
  if (!chart.value) return undefined
  const b = userStore.birth
  return [
    { key: 'year' as const, sub: String(b.year) },
    { key: 'month' as const, sub: String(b.month) },
    { key: 'day' as const, sub: String(b.day) },
    { key: 'hour' as const, sub: hourLabelOf(b.hour) },
  ]
})

function hourLabelOf(hour: number): string {
  const labels = (tm('common.birthInput.hours') as string[]) ?? []
  let idx = Math.floor((hour + 1) / 2) % 12
  if (hour === 23) idx = 12
  if (hour === 0) idx = 0
  return labels[idx] ?? `${hour}`
}

const drawings = useBaziDrawings({
  getRelationsSvg: () => fourPillarsEl.value?.svgRef() ?? null,
  getRelationsTable: () => fourPillarsEl.value?.tableRef() ?? null,
  relationsArcs: () => arcs.value,
  getConnectorsSvg: () => dayunEl.value?.svgRef() ?? null,
  getConnectorsTrack: () => dayunEl.value?.trackRef() ?? null,
})

watch(isGuofeng, () => {
  nextTick(() => {
    drawings.schedule()
    window.setTimeout(drawings.schedule, 250)
    window.setTimeout(drawings.schedule, 700)
  })
})

const skeleton = useSkeletonReveal({
  delay: 1500,
  scrollOffset: 30,
  scrollHoldMs: 280,
  onReveal: () => {
    window.setTimeout(drawings.schedule, 150)
    window.setTimeout(drawings.schedule, 700)
  },
})

/**
 * v3.1.1 注释交互：通用 helper —— annot 状态变化后，
 * 触发对应 CollapsibleSection 的 max-height 重测。
 * 等价原型 design/prototypes/{guofeng,minimal}/bazi.html `syncCollapsibleHeight`。
 */
function syncSection(section: InstanceType<typeof CollapsibleSection> | null) {
  section?.syncHeight()
}

function onToggleNayin(focus: string) {
  nayinAnnotBar.toggleOne(focus)
  nextTick(() => syncSection(chartSectionEl.value))
}
function onToggleAllNayin() {
  nayinAnnotBar.toggleAll()
  nextTick(() => syncSection(chartSectionEl.value))
}
function onChartSectionOpen(open: boolean) {
  if (!open) nayinAnnotBar.closeAll()
}

/**
 * ShishenStructure「就地展开/收起详细解读」会改变内容高度。
 * CollapsibleSection 用 max-height 控制可见高度，所以子内容长度变化时
 * 必须调一次 syncHeight 重测，否则展开内容会被裁。
 */
function onShishenDetailToggle(_expanded: boolean) {
  nextTick(() => syncSection(chartSectionEl.value))
}

/**
 * FlowYears「查看更多年份」展开后，需要重测外层流年 CollapsibleSection 高度。
 */
function onFlowYearsExpand(_visibleCount: number) {
  nextTick(() => syncSection(flowSectionEl.value))
}

/**
 * 分享 / 保存命盘卡片：
 *   - 截图根 div 由 shareCardEl 持有（包裹排盘结果区，避开 BirthForm + 操作栏）
 *   - 文件名按用户名 + 当前年份命名，便于本地归档
 */
const shareCardEl = ref<HTMLElement | null>(null)
const { toastState, shareCard, saveCard, previewCard } = useShareCard()

/**
 * 把全局 user.name 转成文件名安全 slug：
 *   - 只保留 中文 / 英文字母 / 数字，其它（空格 / 中划线 / 标点）一律剔除
 *   - 上限 12 字（防御过长姓名污染文件名）
 *   - 空 → 返回 null（让调用方走 birth-only 分支）
 */
function nameToSlug(name: string): string | null {
  const cleaned = name
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '')
    .slice(0, 12)
  return cleaned ? cleaned : null
}

function buildShareOpts() {
  const b = userStore.birth
  const mm = String(b.month).padStart(2, '0')
  const dd = String(b.day).padStart(2, '0')
  const slug = nameToSlug(userStore.name ?? '')
  // 优先用全局 user.name（由 xingming 派生同步而来）；为空时降级回 birth-only 文件名
  const fileName = slug
    ? `bazi-${slug}-${b.year}-${mm}-${dd}-${themeStore.id}`
    : `bazi-${b.year}-${mm}-${dd}-${b.gender}-${themeStore.id}`
  return {
    fileName,
    title: t('bazi.share.title'),
    text: t('bazi.share.text'),
  }
}

/**
 * Deeplink 参数：八字算法吃 minute 维度（划分时辰边界），所以比 chenggu 多带 minute；
 * longitude / birthplace 仅 UI 展示，不参与计算，不放入 query。
 */
const shareUrl = computed(() => {
  const b = userStore.birth
  return buildShareUrl('bazi', {
    calendar: b.calendar,
    year: b.year,
    month: b.month,
    day: b.day,
    hour: b.hour,
    minute: b.minute,
    gender: b.gender,
  })
})

const previewOpen = ref(false)
const previewImage = ref('')

const aiOpen = ref(false)
const aiUserContext = computed(() => ({
  name: userStore.name || undefined,
  gender: userStore.birth.gender,
}))

async function onPreview() {
  previewImage.value = ''
  previewOpen.value = true
  previewImage.value = await previewCard(shareCardEl.value, {})
}
function onShare() {
  shareCard(shareCardEl.value, buildShareOpts())
}
function onSave() {
  saveCard(shareCardEl.value, buildShareOpts())
}

function onToggleAllInterpret() {
  interpretBlockEl.value?.toggleAllAnnot()
  nextTick(() => syncSection(interpretSectionEl.value))
}
function onInterpretSectionOpen(open: boolean) {
  if (!open) interpretBlockEl.value?.closeAllAnnot()
}

function onToggleAllShensha() {
  shenshaBlockEl.value?.toggleAllAnnot()
  nextTick(() => syncSection(shenshaSectionEl.value))
}
function onShenshaSectionOpen(open: boolean) {
  if (!open) shenshaBlockEl.value?.closeAllAnnot()
}

const interpretAnyOpen = computed(() => !!interpretBlockEl.value?.isAnyAnnotOpen())
const shenshaAnyOpen = computed(() => !!shenshaBlockEl.value?.isAnyAnnotOpen())

const annotExpand = computed(() => t('bazi.collapse.annotExpand'))
const annotCollapse = computed(() => t('bazi.collapse.annotCollapse'))

function onPaipan() {
  try {
    chart.value = calculateBazi(userStore.birth)
    if (chart.value) baziStore.recordComputed()
  } catch (err) {
    console.error('[bazi] calculate failed:', err)
    chart.value = null
  }
  skeleton.start(() => resultBannerEl.value)
}

/**
 * 刷新 / 切窗回来后，若 baziStore 里有 lastComputed 且与当前 birth 指纹一致，
 * 直接重算并跳过骨架屏（P4 · 输入指纹模式，对齐 liuren）。
 *
 * 关键点：
 *   - 不触发 skeleton 动画：直接 revealImmediately，避免每次刷新都看 1.5s 动画
 *   - 计算失败（FortuneError 等）则清空快照，回到默认起始态
 *   - URL deeplink 命中时**优先走 deeplink hydrate** 路径，本函数会被跳过
 */
function tryRestoreLastResult(): boolean {
  if (!baziStore.shouldRestore) return false
  try {
    const fresh = calculateBazi(userStore.birth)
    if (!fresh) {
      baziStore.clearComputed()
      return false
    }
    chart.value = fresh
    skeleton.revealImmediately()
    return true
  } catch (err) {
    console.error('[bazi] restore failed:', err)
    baziStore.clearComputed()
    chart.value = null
    return false
  }
}

/**
 * 扫码进入：若 URL 带 calendar/year/.../minute/gender 等字段，hydrate 到 userStore 并自动排盘一次。
 * 与 chenggu 一致的策略：仅在 onMounted 一次性消费 query；后续编辑表单不再受 query 影响。
 *
 * 无 query 时尝试从 lastComputed 静默恢复上次排盘（刷新页面不丢盘）。
 */
onMounted(() => {
  const q = normalizeQuery(route.query as Record<string, string | string[] | undefined>)
  const hasInputs = ['year', 'month', 'day', 'hour'].some((k) => k in q)
  if (!hasInputs) {
    tryRestoreLastResult()
    return
  }

  const b = userStore.birth
  userStore.update({
    calendar: q.calendar === 'lunar' ? 'lunar' : 'solar',
    year: readIntInRange(q, 'year', 1900, 2100, b.year),
    month: readIntInRange(q, 'month', 1, 12, b.month),
    day: readIntInRange(q, 'day', 1, 31, b.day),
    hour: readIntInRange(q, 'hour', 0, 23, b.hour),
    minute: readIntInRange(q, 'minute', 0, 59, b.minute),
    gender: q.gender === 'female' ? 'female' : 'male',
  })
  void Promise.resolve().then(() => onPaipan())
})

function onRepaipan() {
  chart.value = null
  baziStore.clearComputed()
  nayinAnnotBar.closeAll()
  interpretBlockEl.value?.closeAllAnnot()
  shenshaBlockEl.value?.closeAllAnnot()
  skeleton.reset(() => inputCardEl.value)
}

/**
 * 排盘失败回退态：当 result-zone 已 reveal、但 chart 仍为 null 时，
 * 直接渲染"排盘未完成"提示，避免子组件落入 i18n 硬编码示例 fallback
 * （那些示例本质是 1990-05-20 男的样例文案，与当前用户的生辰无关，
 *  容易被误读为"已经是 TA 的命盘"）。
 *
 * 见 `design/bazi/2026-04-21-03-八字文案校验报告.md` § 7。
 */
const showComputeError = computed(() => skeleton.revealed.value && chart.value === null)
function go(name: 'home') {
  router.push({ name })
}
</script>

<template>
  <!-- ============ 国风 ============ -->
  <main v-if="isGuofeng">
    <div class="gf-container">
      <div class="page-title">
        <h1>{{ t('bazi.pageTitle') }}</h1>
        <div class="subtitle">{{ t('bazi.pageSubtitle') }}</div>
      </div>

      <div ref="inputCardEl">
        <BirthForm @paipan="onPaipan" />
      </div>
    </div>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl">
      <ResultBanner title-key="bazi.resultBanner.title" subtitle-key="bazi.resultBanner.subtitle" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <div v-if="showComputeError" class="compute-error-card">
        <h3>◈ {{ t('bazi.computeError.title') }}</h3>
        <p>{{ t('bazi.computeError.hint') }}</p>
        <button class="gf-btn gf-btn-outline" @click="onRepaipan">
          {{ t('bazi.btn.repaipanIcon') }} {{ t('bazi.computeError.retry') }}
        </button>
      </div>
      <template v-else>
        <div ref="shareCardEl" class="bazi-share-card">
        <CollapsibleSection
          ref="chartSectionEl"
          :label="t('bazi.collapse.sectionChart')"
          @update:open="onChartSectionOpen"
        >
          <template #actions>
            <button
              type="button"
              class="annot-toggle-all"
              :aria-pressed="nayinAnnotBar.isAnyOpen.value"
              @click="onToggleAllNayin"
            >
              <span aria-hidden="true">◎</span>
              {{ nayinAnnotBar.isAnyOpen.value ? annotCollapse : annotExpand }}
            </button>
          </template>

          <FourPillarsTable
            ref="fourPillarsEl"
            :pillars="pillarsLocalized"
            :meta="meta"
            :meta-labels="metaLabels"
            :arcs="arcs"
            :header-subs="headerSubs"
            :open-nayin-keys="nayinOpenKeySet"
            @toggle-nayin="onToggleNayin"
          />
          <InlineAnnotsBar
            layout="nayin"
            :items="nayinAnnotBar.openItems.value"
            :ariaLabelText="annotLabelNayin"
          />
          <ShishenStructure :chart="chart" @toggle-detail="onShishenDetailToggle" />
          <ElementsRadar :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection
          ref="interpretSectionEl"
          :label="t('bazi.collapse.sectionInterpret')"
          @update:open="onInterpretSectionOpen"
        >
          <template #actions>
            <button
              type="button"
              class="annot-toggle-all"
              :aria-pressed="interpretAnyOpen"
              @click="onToggleAllInterpret"
            >
              <span aria-hidden="true">◎</span>
              {{ interpretAnyOpen ? annotCollapse : annotExpand }}
            </button>
          </template>

          <InterpretBlock ref="interpretBlockEl" :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection
          ref="shenshaSectionEl"
          :label="t('bazi.collapse.sectionShensha')"
          @update:open="onShenshaSectionOpen"
        >
          <template #actions>
            <button
              type="button"
              class="annot-toggle-all"
              :aria-pressed="shenshaAnyOpen"
              @click="onToggleAllShensha"
            >
              <span aria-hidden="true">◎</span>
              {{ shenshaAnyOpen ? annotCollapse : annotExpand }}
            </button>
          </template>

          <ShenshaBlock ref="shenshaBlockEl" :chart="chart" />
        </CollapsibleSection>

        <div class="gf-divider">
          <span>◆ {{ t('bazi.fortune.title') }} ◆</span>
        </div>

        <CollapsibleSection :label="t('bazi.collapse.sectionFortune')">
          <DayunTimeline ref="dayunEl" :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection ref="flowSectionEl" :label="t('bazi.collapse.sectionFlow')">
          <FlowYears :chart="chart" @toggle-expand="onFlowYearsExpand" />
        </CollapsibleSection>
        </div><!-- /bazi-share-card -->

        <div class="action-bar">
          <button type="button" class="gf-btn" @click="onPreview">
            {{ t('bazi.btn.shareIcon') }} {{ t('bazi.btn.share') }}
          </button>
          <AskAiButton :disabled="!chart" @click="aiOpen = true" />
          <button type="button" class="gf-btn gf-btn-outline" @click="onRepaipan">
            {{ t('bazi.btn.repaipanIcon') }} {{ t('bazi.btn.repaipan') }}
          </button>
        </div>
      </template>
    </div>
  </main>

  <!-- ============ 简约 ============ -->
  <template v-else>
    <main class="mn-container">
      <section class="page-hero">
        <div class="page-breadcrumb">
          <a href="#" @click.prevent="go('home')">{{ t('bazi.breadcrumbHome') }}</a> /
          {{ t('bazi.breadcrumbCurrent') }}
        </div>
        <h1>{{ t('bazi.pageTitle') }}</h1>
        <p>{{ t('bazi.pageSubtitle') }}</p>
      </section>

      <div ref="inputCardEl">
        <BirthForm @paipan="onPaipan" />
      </div>
    </main>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl">
      <ResultBanner title-key="bazi.resultBanner.title" subtitle-key="bazi.resultBanner.subtitle" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <main v-if="showComputeError" class="mn-container">
        <div class="compute-error-card mn">
          <h3>{{ t('bazi.computeError.title') }}</h3>
          <p>{{ t('bazi.computeError.hint') }}</p>
          <button class="mn-btn mn-btn-outline" @click="onRepaipan">
            {{ t('bazi.computeError.retry') }}
          </button>
        </div>
      </main>
      <template v-else>
        <div ref="shareCardEl" class="bazi-share-card">
        <main class="mn-container" style="padding-top: 0;">
          <CollapsibleSection
            ref="chartSectionEl"
            :label="t('bazi.collapse.sectionChartMn')"
            @update:open="onChartSectionOpen"
          >
            <template #actions>
              <button
                type="button"
                class="annot-toggle-all"
                :aria-pressed="nayinAnnotBar.isAnyOpen.value"
                @click="onToggleAllNayin"
              >
                <span aria-hidden="true">◎</span>
                {{ nayinAnnotBar.isAnyOpen.value ? annotCollapse : annotExpand }}
              </button>
            </template>

            <FourPillarsTable
              ref="fourPillarsEl"
              :pillars="pillarsLocalized"
              :meta="meta"
              :meta-labels="metaLabels"
              :arcs="arcs"
              :header-subs="headerSubs"
              :open-nayin-keys="nayinOpenKeySet"
              @toggle-nayin="onToggleNayin"
            />
            <InlineAnnotsBar
              layout="nayin"
              :items="nayinAnnotBar.openItems.value"
              :ariaLabelText="annotLabelNayin"
            />
            <ShishenStructure :chart="chart" @toggle-detail="onShishenDetailToggle" />
            <ElementsRadar :chart="chart" />
          </CollapsibleSection>

          <CollapsibleSection
            ref="interpretSectionEl"
            :label="t('bazi.collapse.sectionInterpretMn')"
            @update:open="onInterpretSectionOpen"
          >
            <template #actions>
              <button
                type="button"
                class="annot-toggle-all"
                :aria-pressed="interpretAnyOpen"
                @click="onToggleAllInterpret"
              >
                <span aria-hidden="true">◎</span>
                {{ interpretAnyOpen ? annotCollapse : annotExpand }}
              </button>
            </template>

            <InterpretBlock ref="interpretBlockEl" :chart="chart" />
          </CollapsibleSection>

          <CollapsibleSection
            ref="shenshaSectionEl"
            :label="t('bazi.collapse.sectionShenshaMn')"
            @update:open="onShenshaSectionOpen"
          >
            <template #actions>
              <button
                type="button"
                class="annot-toggle-all"
                :aria-pressed="shenshaAnyOpen"
                @click="onToggleAllShensha"
              >
                <span aria-hidden="true">◎</span>
                {{ shenshaAnyOpen ? annotCollapse : annotExpand }}
              </button>
            </template>

            <ShenshaBlock ref="shenshaBlockEl" :chart="chart" />
          </CollapsibleSection>
        </main>

        <hr class="mn-divider">

        <main class="mn-container" style="padding-top: 0;">
          <CollapsibleSection :label="t('bazi.collapse.sectionFortuneMn')">
            <DayunTimeline ref="dayunEl" :chart="chart" />
          </CollapsibleSection>

          <CollapsibleSection ref="flowSectionEl" :label="t('bazi.collapse.sectionFlowMn')">
            <FlowYears :chart="chart" @toggle-expand="onFlowYearsExpand" />
          </CollapsibleSection>
        </main>
        </div><!-- /bazi-share-card -->

        <div class="actions mn-container">
          <button type="button" class="mn-btn" @click="onPreview">{{ t('bazi.btn.share') }}</button>
          <AskAiButton :disabled="!chart" @click="aiOpen = true" />
          <button type="button" class="mn-btn mn-btn-ghost" @click="onRepaipan">{{ t('bazi.btn.repaipan') }}</button>
        </div>
      </template>
    </div>
  </template>

  <!-- 骨架遮罩 -->
  <div :class="['skeleton-overlay', { visible: skeleton.skeletonVisible.value }]">
    <div class="skeleton-card">
      <div class="skeleton-ring" />
      <div v-if="isGuofeng" class="skeleton-text">{{ t('bazi.skeleton.title') }}</div>
      <div v-else class="skeleton-title">{{ t('bazi.skeleton.title') }}</div>
      <div v-if="isGuofeng" class="skeleton-subtext">{{ t('bazi.skeleton.subtitle') }}</div>
      <div v-else class="skeleton-sub">{{ t('bazi.skeleton.subtitle') }}</div>
      <div class="skeleton-dots"><span>·</span><span>·</span><span>·</span></div>
    </div>
  </div>

  <!-- 分享 / 保存的反馈 toast（fixed 定位） -->
  <ShareToast :state="toastState" />

  <!-- 分享卡预览对话框 -->
  <SharePreviewDialog
    v-model:open="previewOpen"
    :image="previewImage"
    :share-url="shareUrl"
    :disabled="!previewImage"
    @save="onSave"
    @share="onShare"
  />

  <!-- AI 解读 Drawer -->
  <AiDrawer
    v-model:open="aiOpen"
    module-id="bazi"
    :chart="chart"
    :user-context="aiUserContext"
  />
</template>
