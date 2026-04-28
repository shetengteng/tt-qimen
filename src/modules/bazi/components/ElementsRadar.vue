<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { BaziChart, ElementCell, ElementName } from '../types'
import { ELEMENT_NAMES, ELEMENT_PINYIN, type ElementPinyinKey } from '@/lib/element'

interface Props {
  /** 真实命盘；由外层 result-zone v-if 保证非空 */
  chart?: BaziChart | null
}
const props = defineProps<Props>()

const { t, tm } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const labels = computed(() => tm('bazi.radar.labels') as Record<string, string>)
const fiveElementLabel = computed(() => tm('bazi.fiveElementsLabel') as Record<string, string>)

/**
 * 视觉顺序（与 SVG 五角对齐）：上=木，右上=火，右下=土，左下=金，左上=水。
 * 直接消费 lib/element 的标准顺序。
 */
const RADAR_ORDER: readonly ElementName[] = ELEMENT_NAMES

/**
 * 五个角的「外端坐标」（半径 120 = SVG 中外环）。
 * 顺序与 RADAR_ORDER 保持一致，等价于 SVG 中的 5 条 axis。
 */
const RADAR_AXES: Array<readonly [number, number]> = [
  [0, -120],            // 木 上
  [114.13, -37.08],     // 火 右上
  [70.53, 97.08],       // 土 右下
  [-70.53, 97.08],      // 金 左下
  [-114.13, -37.08],    // 水 左上
]

interface RadarItem {
  key: ElementPinyinKey
  name: string
  /** 雷达点的归一化半径 0..1（用于绘制） */
  ratio: number
  /** 显示用的整数计数（取分数四舍五入） */
  count: number
  /** 显示用的百分比 0..100 */
  percent: number
  status: 'strong' | 'weak' | 'balanced'
  statusLabel: string
}

const radarItems = computed<RadarItem[]>(() => {
  if (!props.chart) return []

  const cellMap: Record<ElementName, ElementCell> = props.chart.elementCells
    .reduce((acc, c) => { acc[c.name] = c; return acc }, {} as Record<ElementName, ElementCell>)
  const maxScore = Math.max(...props.chart.elementCells.map(c => c.score), 0.01)

  return RADAR_ORDER.map((el) => {
    const key = ELEMENT_PINYIN[el]
    const cell = cellMap[el]
    return {
      key,
      name: labels.value[key],
      ratio: Math.min(1, cell.score / maxScore),
      count: Math.round(cell.score),
      percent: Math.round(cell.percent * 100),
      status: cell.status,
      statusLabel: fiveElementLabel.value[cell.status],
    }
  })
})

/** 根据 radarItems 重新生成多边形 + 数据点 */
const radarDataPoints = computed<ReadonlyArray<readonly [number, number]>>(() =>
  radarItems.value.map((it, i) => {
    const [x, y] = RADAR_AXES[i]
    return [x * it.ratio, y * it.ratio] as const
  }),
)
const radarPolygonPoints = computed(() =>
  radarDataPoints.value.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' '),
)

/** 用于 5 个轴标签下方的数字（按 RADAR_ORDER 索引取） */
function axisCount(idx: number): number {
  return radarItems.value[idx]?.count ?? 0
}

/** 给「五行强弱条」用的展示顺序：金木水火土 */
const elemDisplay = computed<RadarItem[]>(() => {
  if (!radarItems.value.length) return []
  const order: Array<'jin' | 'mu' | 'shui' | 'huo' | 'tu'> = ['jin', 'mu', 'shui', 'huo', 'tu']
  return order
    .map((key) => radarItems.value.find(r => r.key === key))
    .filter((it): it is RadarItem => !!it)
})

const description = computed(() => (isGuofeng.value ? t('bazi.radar.desc') : t('bazi.radar.descMn')))
</script>

<template>
  <!-- 五行雷达 -->
  <div class="elements-radar-card">
    <svg class="radar-svg" viewBox="-160 -160 320 320" role="img" :aria-label="t('bazi.radar.title')">
      <g class="radar-grid">
        <polygon class="radar-grid-stroke" points="0,-120 114.13,-37.08 70.53,97.08 -70.53,97.08 -114.13,-37.08" />
        <polygon class="radar-grid-stroke" points="0,-96 91.3,-29.67 56.43,77.67 -56.43,77.67 -91.3,-29.67" />
        <polygon class="radar-grid-stroke" points="0,-72 68.48,-22.25 42.32,58.25 -42.32,58.25 -68.48,-22.25" />
        <polygon class="radar-grid-stroke" points="0,-48 45.65,-14.83 28.21,38.83 -28.21,38.83 -45.65,-14.83" />
        <polygon class="radar-grid-stroke" points="0,-24 22.83,-7.42 14.11,19.42 -14.11,19.42 -22.83,-7.42" />
      </g>
      <g class="radar-axes">
        <line class="radar-axis-stroke" x1="0" y1="0" x2="0" y2="-120" />
        <line class="radar-axis-stroke" x1="0" y1="0" x2="114.13" y2="-37.08" />
        <line class="radar-axis-stroke" x1="0" y1="0" x2="70.53" y2="97.08" />
        <line class="radar-axis-stroke" x1="0" y1="0" x2="-70.53" y2="97.08" />
        <line class="radar-axis-stroke" x1="0" y1="0" x2="-114.13" y2="-37.08" />
      </g>
      <polygon class="radar-area-fill" :points="radarPolygonPoints" />
      <circle
        v-for="(p, i) in radarDataPoints"
        :key="i"
        class="radar-point"
        :cx="p[0]"
        :cy="p[1]"
        r="4"
      />
      <text class="radar-label" x="0" y="-135" text-anchor="middle">{{ labels.mu }}</text>
      <text class="radar-label-num" x="0" y="-122" text-anchor="middle">{{ axisCount(0) }}</text>
      <text class="radar-label" x="125" y="-38" text-anchor="start">{{ labels.huo }}</text>
      <text class="radar-label-num" x="125" y="-26" text-anchor="start">{{ axisCount(1) }}</text>
      <text class="radar-label" x="80" y="112" text-anchor="start">{{ labels.tu }}</text>
      <text class="radar-label-num" x="80" y="124" text-anchor="start">{{ axisCount(2) }}</text>
      <text class="radar-label" x="-80" y="112" text-anchor="end">{{ labels.jin }}</text>
      <text class="radar-label-num" x="-80" y="124" text-anchor="end">{{ axisCount(3) }}</text>
      <text class="radar-label" x="-125" y="-38" text-anchor="end">{{ labels.shui }}</text>
      <text class="radar-label-num" x="-125" y="-26" text-anchor="end">{{ axisCount(4) }}</text>
    </svg>

    <div class="radar-meta">
      <h4 v-if="isGuofeng">◈ {{ t('bazi.radar.title') }}</h4>
      <h4 v-else>{{ t('bazi.radar.title') }}</h4>
      <p>{{ description }}</p>
      <div class="radar-list">
        <div
          v-for="el in elemDisplay"
          :key="el.key"
          :class="['radar-chip', el.key]"
        >{{ el.name }} {{ el.count }}</div>
      </div>
    </div>
  </div>

  <!-- 五行强弱条 -->
  <div v-if="isGuofeng" class="five-elements">
    <div
      v-for="el in elemDisplay"
      :key="el.key"
      :class="['element', el.key]"
    >
      <div class="element-name">{{ el.name }}</div>
      <div class="element-count">{{ el.count }}</div>
      <div class="element-bar">
        <div class="element-bar-fill" :style="{ width: `${el.percent}%` }" />
      </div>
      <div :class="['element-label', el.status === 'weak' ? 'weak' : el.status === 'strong' ? 'strong' : '']">
        {{ el.statusLabel }}
      </div>
    </div>
  </div>
  <div v-else class="five-elements">
    <div
      v-for="el in elemDisplay"
      :key="el.key"
      :class="['elem', el.key]"
    >
      <div class="elem-dot">{{ el.name }}</div>
      <div class="elem-count">{{ el.count }}</div>
      <div class="elem-bar">
        <div class="elem-bar-fill" :style="{ width: `${el.percent}%` }" />
      </div>
      <div :class="['elem-status', el.status === 'weak' ? 'weak' : el.status === 'strong' ? 'strong' : '']">
        {{ el.statusLabel }}
      </div>
    </div>
  </div>
</template>
