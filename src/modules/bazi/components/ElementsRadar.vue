<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { fiveElements, radarPolygonPoints, radarDataPoints } from '../data/mockBazi'

const { t, tm } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const labels = computed(() => tm('bazi.radar.labels') as Record<string, string>)
const fiveElementLabel = computed(() => tm('bazi.fiveElementsLabel') as Record<string, string>)

const elemDisplay = computed(() => {
  const order: Array<keyof typeof labels.value> = ['jin', 'mu', 'shui', 'huo', 'tu']
  return order.map((key) => {
    const cell = fiveElements.find((e) => e.key === key)!
    return {
      key,
      name: labels.value[key],
      count: cell.count,
      percent: cell.percent,
      status: cell.status,
      statusLabel: fiveElementLabel.value[cell.status],
    }
  })
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
      <text class="radar-label-num" x="0" y="-122" text-anchor="middle">1</text>
      <text class="radar-label" x="125" y="-38" text-anchor="start">{{ labels.huo }}</text>
      <text class="radar-label-num" x="125" y="-26" text-anchor="start">3</text>
      <text class="radar-label" x="80" y="112" text-anchor="start">{{ labels.tu }}</text>
      <text class="radar-label-num" x="80" y="124" text-anchor="start">1</text>
      <text class="radar-label" x="-80" y="112" text-anchor="end">{{ labels.jin }}</text>
      <text class="radar-label-num" x="-80" y="124" text-anchor="end">2</text>
      <text class="radar-label" x="-125" y="-38" text-anchor="end">{{ labels.shui }}</text>
      <text class="radar-label-num" x="-125" y="-26" text-anchor="end">1</text>
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
