/**
 * 分享 / 保存命盘卡片 composable（v3.1.1 八字 / 紫微等占卜模块通用）
 *
 * 设计目标：
 *   1. 调起浏览器 Web Share API（移动端 + 现代桌面），失败 / 不支持时回退本地下载 PNG。
 *   2. 统一使用 html2canvas 把目标 DOM 节点渲染为 PNG（无后端依赖、纯静态 SPA）。
 *   3. 提供 toast 反馈让用户知道当前状态（截图中 / 已保存 / 已分享 / 失败）。
 *
 * 用法：
 *   const { shareCard, saveCard, toastState } = useShareCard()
 *   shareCard(elRef.value, { fileName: 'bazi-2026', title: '我的八字命盘', text: '...' })
 *   saveCard(elRef.value, { fileName: 'bazi-2026' })
 *
 * 注意：
 *   - 调用方需自行确认目标 element 已挂载且可见，否则 html2canvas 截图为空。
 *   - 调用前会插入一个临时 `data-sharing-snapshot` 属性，方便 CSS 在截图期间隐藏
 *     交互态元素（按钮 hover、annot toggle 等）；调用方可通过 CSS 控制。
 *   - Web Share API 在 file 维度仅 Chrome / Safari iOS / Android 支持，PC 端 Chrome
 *     需 https；不支持时静默回退到下载。
 */

import { ref, type Ref } from 'vue'

export interface ShareOptions {
  /** 文件名（不含扩展名） */
  fileName: string
  /** Web Share API 标题，桌面端通常忽略 */
  title?: string
  /** Web Share API 正文 */
  text?: string
  /** 截图比例（默认 2，retina 屏更清晰；过大会增加内存压力） */
  scale?: number
}

export type ShareToastTone = 'info' | 'success' | 'warning' | 'error'

export interface ShareToastState {
  visible: boolean
  message: string
  tone: ShareToastTone
}

/**
 * 显示 toast 的最小封装。固定 2.4s 自动消失；连续触发会复位计时。
 * 单例 ref 由调用方挂到模板上即可。
 */
export function useShareCard() {
  const toastState: Ref<ShareToastState> = ref({
    visible: false,
    message: '',
    tone: 'info',
  })

  let toastTimer: ReturnType<typeof window.setTimeout> | null = null
  function showToast(message: string, tone: ShareToastTone = 'info', duration = 2400) {
    if (toastTimer) {
      window.clearTimeout(toastTimer)
      toastTimer = null
    }
    toastState.value = { visible: true, message, tone }
    toastTimer = window.setTimeout(() => {
      toastState.value = { ...toastState.value, visible: false }
      toastTimer = null
    }, duration)
  }

  /**
   * 把 DOM 节点截成 canvas → blob。
   *
   * 内部把对 html2canvas 的引入改为动态 import，理由：
   *   1. html2canvas 模块 ~50KB gzipped，但只有点击「分享 / 保存」时才需要
   *   2. 静态导入会增大首屏 bundle，影响排盘 LCP
   */
  async function snapshotToBlob(
    el: HTMLElement,
    scale = 2,
  ): Promise<Blob> {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el, {
      scale,
      // 透明背景在 png 下渲染会变黑底，所以拿当前页背景补底；
      // computedStyle 在 themed root 上才正确，所以从 documentElement 取
      backgroundColor:
        getComputedStyle(document.documentElement).backgroundColor || '#ffffff',
      useCORS: true,
      logging: false,
      // 默认 html2canvas 用 windowWidth/Height 计算，长 DOM 截图时建议显式给容器尺寸
      width: el.scrollWidth,
      height: el.scrollHeight,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    })
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('canvas.toBlob 返回空'))),
        'image/png',
        0.95,
      )
    })
  }

  /**
   * 预览：截图为 PNG dataURL，让上层 Dialog 直接展示成 <img>。
   *
   * 与 saveCard / shareCard 解耦——这里只生成图、不触发下载、不抛 toast 成功反馈，
   * 让 Dialog 自己掌控展示节奏；任何失败都返回空字符串并触发 error toast，
   * 上层只需判 `!image` 即可禁用 save / share 按钮。
   */
  async function previewCard(
    el: HTMLElement | null | undefined,
    opt: Pick<ShareOptions, 'scale'> = {},
  ): Promise<string> {
    if (!el) {
      showToast('未找到可截图的内容', 'error')
      return ''
    }
    try {
      const blob = await snapshotToBlob(el, opt.scale)
      return await blobToDataUrl(blob)
    } catch (e) {
      console.error('[useShareCard] previewCard failed:', e)
      showToast('图片生成失败，请重试', 'error')
      return ''
    }
  }

  /** Blob → dataURL（FileReader），用于 Dialog 内 <img> 直接渲染 */
  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
      reader.onerror = () => reject(reader.error ?? new Error('FileReader 失败'))
      reader.readAsDataURL(blob)
    })
  }

  /** 触发浏览器下载 */
  function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    // 立即 revoke 在某些浏览器下会让下载被取消，所以延后一点
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  /**
   * 保存到本地：截图后直接下载 PNG。
   *
   * @returns Promise<boolean> 成功 true / 失败 false（toast 已自处理）
   */
  async function saveCard(
    el: HTMLElement | null | undefined,
    opt: ShareOptions,
  ): Promise<boolean> {
    if (!el) {
      showToast('未找到可截图的内容', 'error')
      return false
    }
    showToast('正在生成图片…', 'info', 6000)
    try {
      const blob = await snapshotToBlob(el, opt.scale)
      downloadBlob(blob, opt.fileName)
      showToast('已保存到本地', 'success')
      return true
    } catch (e) {
      console.error('[useShareCard] saveCard failed:', e)
      showToast('图片生成失败，请重试', 'error')
      return false
    }
  }

  /**
   * 分享卡片：
   *   - 优先 Web Share API（带 PNG 文件 + 标题 + 正文）
   *   - 不支持文件分享时仅分享 title/text + 当前 URL（不少桌面 Chrome 在此条件）
   *   - 完全不支持时回退到 saveCard（下载 PNG）
   */
  async function shareCard(
    el: HTMLElement | null | undefined,
    opt: ShareOptions,
  ): Promise<boolean> {
    if (!el) {
      showToast('未找到可截图的内容', 'error')
      return false
    }
    showToast('正在生成图片…', 'info', 6000)
    let blob: Blob
    try {
      blob = await snapshotToBlob(el, opt.scale)
    } catch (e) {
      console.error('[useShareCard] snapshot failed:', e)
      showToast('图片生成失败，请重试', 'error')
      return false
    }

    const file = new File([blob], `${opt.fileName}.png`, { type: 'image/png' })
    const navAny = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean
    }

    /** 1) 优先：分享带文件 */
    if (navigator.share && navAny.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: opt.title,
          text: opt.text,
        })
        showToast('已发起分享', 'success')
        return true
      } catch (e) {
        // 用户取消是 AbortError，不算失败
        if ((e as DOMException).name === 'AbortError') {
          // 取消时不回退到下载，直接静默
          toastState.value = { ...toastState.value, visible: false }
          return false
        }
        console.warn('[useShareCard] navigator.share files failed:', e)
        // 走回退
      }
    }

    /** 2) 次选：仅分享 title/text/url（无文件） */
    if (navigator.share) {
      try {
        await navigator.share({
          title: opt.title,
          text: opt.text,
          url: window.location.href,
        })
        // 同时下载图片，让用户可以手动附加
        downloadBlob(blob, opt.fileName)
        showToast('链接已分享，图片已下载', 'success', 3000)
        return true
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') {
          toastState.value = { ...toastState.value, visible: false }
          return false
        }
        console.warn('[useShareCard] navigator.share text failed:', e)
      }
    }

    /** 3) 兜底：直接下载 */
    downloadBlob(blob, opt.fileName)
    showToast('当前环境不支持系统分享，已为你保存图片', 'warning', 3000)
    return true
  }

  return {
    toastState,
    shareCard,
    saveCard,
    previewCard,
    showToast,
  }
}
