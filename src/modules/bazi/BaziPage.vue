<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import BirthForm from './components/BirthForm.vue'
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
import { useAnnotBar } from '@/composables/useAnnotBar'
import { useShareCard } from '@/composables/useShareCard'
import { meta as baziMeta, pillarsByLocale, type PillarCell } from './data/mockBazi'
import { useBaziDrawings, type BaziArc } from './composables/useBaziDrawings'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { calculateBazi } from './core/bazi'
import { detectZhiRelations } from './core/zhiRelations'
import type { BaziChart, PillarInfo } from './types'

const { t, tm, locale } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
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

const arcs = computed<BaziArc[]>(() => {
  if (chart.value) {
    const p = chart.value.pillars
    return detectZhiRelations(p.year, p.month, p.day, p.hour)
  }
  // 未排盘前回退到 i18n 中的示意文案，保持视觉占位
  const r = tm('bazi.relations') as Record<string, string>
  return [
    { type: 'chong', from: 0, to: 2, label: r.chong, desc: r.chongDescMn, dir: 'up' },
    { type: 'zixing', from: 0, to: 3, label: r.zixing, desc: r.zixingDescMn, dir: 'down' },
    { type: 'anhe', from: 1, to: 3, label: r.anhe, desc: r.anheDescMn, dir: 'down' },
  ]
})

const pillarsLocalized = computed(() => {
  if (chart.value) {
    const c = chart.value.pillars
    return [
      toPillarCell(c.year, false),
      toPillarCell(c.month, false),
      toPillarCell(c.day, true),
      toPillarCell(c.hour, false),
    ]
  }
  const map = pillarsByLocale as Record<string, typeof pillarsByLocale['zh-CN']>
  return map[locale.value] ?? pillarsByLocale['zh-CN']
})

const meta = computed(() => {
  if (chart.value) return {
    solar: chart.value.meta.solar,
    lunar: chart.value.meta.lunar,
    genderTitle: chart.value.meta.genderTitle,
  }
  return {
    solar: locale.value === 'en' ? baziMeta.solarEn : baziMeta.solar,
    lunar: locale.value === 'en' ? baziMeta.lunarEn : baziMeta.lunar,
    genderTitle: userStore.birth.gender === 'female' ? '坤造' as const : '乾造' as const,
  }
})

const metaLabels = computed(() => {
  const m = tm('bazi.chartMeta') as Record<string, string>
  return { solar: m.solarLabel, lunar: m.lunarLabel }
})

/** 四柱表头副标题 */
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
  const labels = (tm('bazi.hours') as string[]) ?? []
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
const { toastState, shareCard, saveCard } = useShareCard()
function buildShareOpts() {
  const b = userStore.birth
  // 文件名：bazi-1990-05-20-male-guofeng.png；用 birth 字段而非 user.name（store 暂无 name）
  const mm = String(b.month).padStart(2, '0')
  const dd = String(b.day).padStart(2, '0')
  return {
    fileName: `bazi-${b.year}-${mm}-${dd}-${b.gender}-${themeStore.id}`,
    title: t('bazi.share.title'),
    text: t('bazi.share.text'),
  }
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
  } catch (err) {
    console.error('[bazi] calculate failed:', err)
    chart.value = null
  }
  skeleton.start(() => resultBannerEl.value)
}
function onRepaipan() {
  chart.value = null
  nayinAnnotBar.closeAll()
  interpretBlockEl.value?.closeAllAnnot()
  shenshaBlockEl.value?.closeAllAnnot()
  skeleton.reset(() => inputCardEl.value)
}

/**
 * 排盘失败回退态：当 result-zone 已 reveal、但 chart 仍为 null 时，
 * 直接渲染"排盘未完成"提示，避免子组件落入 i18n / mockBazi 的硬编码示例 fallback
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

    <div ref="resultBannerEl" :class="['result-banner', { revealed: skeleton.revealed.value }]">
      <h2 class="result-banner-title">
        <span class="result-banner-decor">◈</span>
        {{ t('bazi.resultBanner.title') }}
        <span class="result-banner-decor">◈</span>
      </h2>
      <div class="result-banner-subtitle">{{ t('bazi.resultBanner.subtitle') }}</div>
    </div>

    <div :class="['result-zone', { revealed: skeleton.revealed.value }]">
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
          <button type="button" class="gf-btn" @click="onShare">
            {{ t('bazi.btn.shareIcon') }} {{ t('bazi.btn.share') }}
          </button>
          <button type="button" class="gf-btn gf-btn-outline" @click="onSave">
            {{ t('bazi.btn.saveIcon') }} {{ t('bazi.btn.save') }}
          </button>
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

    <div ref="resultBannerEl" :class="['result-banner', { revealed: skeleton.revealed.value }]">
      <h2 class="result-banner-title">{{ t('bazi.resultBanner.title') }}</h2>
      <div class="result-banner-sub">{{ t('bazi.resultBanner.subtitle') }}</div>
      <div class="result-banner-line" />
    </div>

    <div :class="['result-zone', { revealed: skeleton.revealed.value }]">
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
          <button type="button" class="mn-btn" @click="onShare">{{ t('bazi.btn.share') }}</button>
          <button type="button" class="mn-btn mn-btn-outline" @click="onSave">{{ t('bazi.btn.save') }}</button>
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
</template>
