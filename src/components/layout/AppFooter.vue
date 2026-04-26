<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ShareQrcode from '@/components/common/ShareQrcode.vue'

const { t } = useI18n()
const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()

function goLegal(name: 'about' | 'disclaimer' | 'data-source' | 'privacy') {
  router.push({ name })
}

const isGuofeng = computed(() => themeStore.id === 'guofeng')

/**
 * AppFooter 显示一个二维码，扫描后跳转到当前页面。
 *
 * 这里复用 vue-router 的 fullPath（hash route 形态），拼出 origin + base + fullPath，
 * 而不是直接读 window.location.href —— 后者在 SPA 路由切换时不会触发响应式重算，
 * 会让二维码停留在首次渲染那一刻的 URL。
 *
 * 注意：fullPath 已包含 ?theme= / ?lang= 等 useUrlSync 同步过来的 query；
 * 模块自己的内部 store（如 huangli 的 year/month/day）目前没有同步到 URL，
 * 所以扫码后只会落到模块根页，不会复现具体的排盘上下文（这是当前架构的现状）。
 */
const shareUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  const origin = window.location.origin
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  return `${origin}${base}/#${route.fullPath}`
})
</script>

<template>
  <footer v-if="isGuofeng" class="gf-footer">
    <div class="footer-row">
      <div class="footer-text">
        <div>{{ t('footer.branding') }}</div>
        <div style="margin-top: 12px;">
          <a href="#" @click.prevent="goLegal('about')">{{ t('footer.about') }}</a> ·
          <a href="#" @click.prevent="goLegal('disclaimer')">{{ t('footer.disclaimerLink') }}</a> ·
          <a href="#" @click.prevent="goLegal('data-source')">{{ t('footer.dataSource') }}</a> ·
          <a href="#" @click.prevent="goLegal('privacy')">{{ t('footer.privacy') }}</a>
        </div>
        <div style="margin-top: 16px; font-size: 12px;">
          {{ t('footer.copyright') }}
        </div>
      </div>
                  <ShareQrcode :url="shareUrl" :size="56" compact />
    </div>
  </footer>

  <footer v-else class="mn-footer">
    <div class="footer-row">
      <div class="footer-text">
        <div style="margin-bottom: 12px;">{{ t('footer.brandingMn') }}</div>
        <div>
          <a href="#" @click.prevent="goLegal('about')">{{ t('footer.about') }}</a>
          <a href="#" @click.prevent="goLegal('disclaimer')">{{ t('footer.disclaimerLink') }}</a>
          <a href="#" @click.prevent="goLegal('data-source')">{{ t('footer.dataSource') }}</a>
          <a href="#" @click.prevent="goLegal('privacy')">{{ t('footer.privacyMn') }}</a>
        </div>
        <div style="margin-top: 16px; font-size: 12px;">
          {{ t('footer.copyrightMn') }}
        </div>
      </div>
                  <ShareQrcode :url="shareUrl" :size="56" compact />
    </div>
  </footer>
</template>

<style scoped>
.footer-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.footer-text {
  text-align: center;
}

@media (max-width: 640px) {
  .footer-row {
    gap: 16px;
  }
}
</style>
