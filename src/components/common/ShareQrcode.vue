<script setup lang="ts">
/**
 * 分享卡 · 二维码行
 *
 * 设计目标：
 *   1. 在每个模块的 .xxx-share-card 末尾静态嵌入，截图时一并保留；
 *   2. 二维码内容为完整 URL（含 query），扫描后可复现同一排盘；
 *   3. 不阻塞渲染：qrcode 库走动态 import，首屏 bundle 不受影响；
 *   4. 不抛错：编码失败时静默隐藏二维码，仅保留文字 fallback（避免破坏卡片美学）。
 *
 * 用法：
 *   <ShareQrcode :url="shareUrl" />
 *
 * 截图 / 分享期间不应再请求生成（已在 mounted 时一次性渲染到 dataURL），所以
 * 不需要在 useShareCard 流程中做任何额外协调。
 */

import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  /** 完整可扫描 URL（一般由 buildShareUrl 生成） */
  url: string
  /** 渲染尺寸（边长，px），默认 96 */
  size?: number
  /**
   * 紧凑模式：仅显示二维码图本身，不渲染说明文字、不带顶部分割线。
   * 用于 AppFooter 等需要把二维码与外部文字共存于一行的场景；默认 false 维持原样
   * （在 share-card 底部独立成一行 + 提示文字）。
   */
  compact?: boolean
}
const props = withDefaults(defineProps<Props>(), { size: 96, compact: false })

const { t } = useI18n()

const dataUrl = ref<string>('')
const failed = ref(false)

/**
 * 用 qrcode 生成 dataURL。
 *
 * margin: 1（最小静区，节省卡片寸土寸金的右下角）；
 * errorCorrectionLevel: 'M'（中等容错，足以应对截图压缩）；
 * 颜色：黑底白底，避免主题切换时二维码对比度坍塌。
 */
async function regenerate() {
  if (!props.url) {
    dataUrl.value = ''
    return
  }
  try {
    const QRCode = (await import('qrcode')).default
    dataUrl.value = await QRCode.toDataURL(props.url, {
      width: props.size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    })
    failed.value = false
  } catch (e) {
    console.warn('[ShareQrcode] generate failed:', e)
    dataUrl.value = ''
    failed.value = true
  }
}

onMounted(() => regenerate())
watch(() => props.url, () => regenerate())
</script>

<template>
  <div :class="['share-qrcode', { 'share-qrcode--compact': compact }]" v-if="dataUrl">
    <img
      :src="dataUrl"
      :width="size"
      :height="size"
      class="share-qrcode-img"
      :alt="t('common.share.qrcode.alt')"
    />
    <div v-if="!compact" class="share-qrcode-hint">{{ t('common.share.qrcode.hint') }}</div>
  </div>
</template>

<style scoped>
.share-qrcode {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-top: 18px;
  border-top: 1px solid var(--border-soft, rgba(0, 0, 0, 0.06));
}

.share-qrcode--compact {
  /* AppFooter 等紧凑场景：二维码与外部文字平铺一行，去掉额外的分隔线与边距，
   * 让父容器决定整体留白与对齐。 */
  padding: 0;
  margin-top: 0;
  border-top: none;
}

.share-qrcode-img {
  flex: 0 0 auto;
  border-radius: 4px;
  background: #fff;
}

.share-qrcode-hint {
  flex: 1 1 auto;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-muted, #6b6b6b);
}
</style>
