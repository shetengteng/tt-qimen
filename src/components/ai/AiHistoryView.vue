<script setup lang="ts">
/**
 * AI 会话历史列表（在 AiSidebarPanel 内以 view 形式呈现）
 *
 * 职责：
 *   - 拉 useAiHistoryStore.listAll()（已按 LRU 排序，最近使用在前）
 *   - 每行展示：模块 chip + displayLabel + 消息数 + 相对时间 + 首条 user 预览 + 删除按钮
 *   - 高亮当前激活的 fingerprint（currentBadge）
 *   - 点击行 → emit('select', fingerprint) 由父组件切到只读预览
 *   - 单条删除：右侧 trash 按钮 + AlertDialog 二次确认（删除当前会话仍允许，
 *     只删 store 中的记录，不影响内存里的 chat.messages —— 父组件该如何处理由 emit('deleted', fp) 报出）
 *   - 清空全部：底部按钮 + AlertDialog 二次确认
 *   - 空态：空标 + 提示语
 *
 * 不会修改 useAiChat / 当前命盘上下文 —— 完全只读 + 删除。
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAiHistoryStore } from '@/stores/aiHistory'
import type { ChatSession } from '@/stores/aiHistory'
import type { ModuleId } from '@/router'

const props = withDefaults(defineProps<{
  /** 当前活跃会话 fingerprint，用于在列表中高亮"当前"标识 */
  currentFingerprint?: string | null
}>(), {
  currentFingerprint: null,
})

const emit = defineEmits<{
  (e: 'select', fingerprint: string): void
  (e: 'deleted', fingerprint: string): void
}>()

const { t } = useI18n()
const aiHistory = useAiHistoryStore()

const sessions = computed<ChatSession[]>(() => aiHistory.listAll())

function moduleLabel(id: ModuleId): string {
  const key = `modules.${id}.name`
  const v = t(key)
  return v === key ? id : v
}

/**
 * 首条非 hidden 的 user 消息内容预览（去掉 markdown 块、空行；截断至 60 字符）。
 *   - hidden=true 是"自动首问"那条占位 user，UI 不展示
 *   - 退化：找不到合适的就回落到 displayLabel
 */
function firstPreview(session: ChatSession): string {
  const userMsg = session.messages.find((m) => m.role === 'user' && !m.hidden && !!m.content?.trim())
  if (!userMsg) return ''
  const content = userMsg.content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!content) return ''
  return content.length > 60 ? content.slice(0, 60) + '…' : content
}

/**
 * 相对时间格式化（不引入 dayjs / date-fns，避免新依赖）。
 * - <60s: 刚刚
 * - <60min: N 分钟前
 * - <24h: N 小时前
 * - <7d: N 天前
 * - <4w: N 周前
 * - 其他：YYYY-MM-DD
 */
function relativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts)
  const min = Math.floor(diff / 60_000)
  if (min < 1) return t('ai.history.relative.justNow')
  if (min < 60) return t('ai.history.relative.minutesAgo', { n: min })
  const hr = Math.floor(min / 60)
  if (hr < 24) return t('ai.history.relative.hoursAgo', { n: hr })
  const day = Math.floor(hr / 24)
  if (day < 7) return t('ai.history.relative.daysAgo', { n: day })
  const week = Math.floor(day / 7)
  if (week < 4) return t('ai.history.relative.weeksAgo', { n: week })
  const d = new Date(ts)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function visibleMessageCount(session: ChatSession): number {
  return session.messages.filter((m) => !m.hidden && m.role !== 'system').length
}

function onSelect(session: ChatSession) {
  emit('select', session.fingerprint)
}

/**
 * 二次确认走 shadcn AlertDialog：
 *   - 单条删除用 deleteTarget 暂存当前候选 session（含 label 用于描述文案），
 *     点确认后再真正调 store.removeSession 并 emit deleted
 *   - 清空全部用独立 boolean 控制 dialog 可见性
 *   - reka-ui AlertDialog 通过 Portal 渲染到 body，不会被 sidebar 容器裁剪
 */
const deleteTarget = ref<ChatSession | null>(null)
const clearAllDialogOpen = ref(false)

function onDelete(session: ChatSession, evt: Event) {
  evt.stopPropagation()
  deleteTarget.value = session
}

function onConfirmDelete() {
  const target = deleteTarget.value
  if (!target) return
  deleteTarget.value = null
  aiHistory.removeSession(target.fingerprint)
  emit('deleted', target.fingerprint)
}

function onClearAll() {
  if (sessions.value.length === 0) return
  clearAllDialogOpen.value = true
}

function onConfirmClearAll() {
  clearAllDialogOpen.value = false
  aiHistory.clearAll()
}
</script>

<template>
  <div class="ai-history-view flex flex-1 flex-col overflow-hidden">
    <!-- 列表区 -->
    <div v-if="sessions.length > 0" class="flex-1 overflow-y-auto px-3 py-3">
      <ul class="flex flex-col gap-2">
        <li v-for="s in sessions" :key="s.fingerprint">
          <button
            type="button"
            class="ai-history-item group/item w-full rounded-lg border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            :class="{ 'is-current': s.fingerprint === currentFingerprint }"
            @click="onSelect(s)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <!-- 标题行：模块 chip + label + current badge -->
                <div class="flex flex-wrap items-center gap-1.5">
                  <span
                    class="inline-flex shrink-0 items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >{{ moduleLabel(s.moduleId) }}</span>
                  <span
                    v-if="s.fingerprint === currentFingerprint"
                    class="inline-flex shrink-0 items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary"
                  >{{ t('ai.history.currentBadge') }}</span>
                  <span class="truncate text-sm font-medium text-foreground">
                    {{ s.displayLabel }}
                  </span>
                </div>

                <!-- 预览行：首条 user 消息 -->
                <p
                  v-if="firstPreview(s)"
                  class="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground"
                >
                  {{ firstPreview(s) }}
                </p>

                <!-- 元信息行：时间 + 消息数 -->
                <div class="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{{ relativeTime(s.updatedAt) }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ t('ai.history.messageCount', { count: visibleMessageCount(s) }) }}</span>
                </div>
              </div>

              <!-- 删除按钮（hover 才显），桌面悬停 / 移动端常亮 -->
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                class="ai-history-delete shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                :aria-label="t('ai.history.deleteAria')"
                :title="t('ai.history.deleteAria')"
                @click="onDelete(s, $event)"
              >
                <Trash2 class="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </button>
        </li>
      </ul>
    </div>

    <!-- 空态 -->
    <div
      v-else
      class="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center"
    >
      <p class="text-sm font-medium text-foreground">{{ t('ai.history.empty') }}</p>
      <p class="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
        {{ t('ai.history.emptyHint') }}
      </p>
    </div>

    <!-- 底部清空按钮（仅有数据时） -->
    <div v-if="sessions.length > 0" class="shrink-0 border-t border-border bg-background px-3 py-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="w-full text-xs text-muted-foreground hover:text-destructive"
        @click="onClearAll"
      >
        <Trash2 class="size-3.5" aria-hidden="true" />
        {{ t('ai.history.clearAll') }}
      </Button>
    </div>

    <!-- 单条删除确认弹框 -->
    <AlertDialog
      :open="deleteTarget !== null"
      @update:open="(v: boolean) => { if (!v) deleteTarget = null }"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('ai.history.deleteTitle') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ deleteTarget ? t('ai.history.deleteConfirm', { label: deleteTarget.displayLabel }) : '' }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t('ai.history.confirmCancel') }}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="onConfirmDelete">
            {{ t('ai.history.deleteConfirmBtn') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- 清空全部确认弹框 -->
    <AlertDialog v-model:open="clearAllDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('ai.history.clearAllTitle') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('ai.history.clearConfirm', { count: sessions.length }) }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t('ai.history.confirmCancel') }}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="onConfirmClearAll">
            {{ t('ai.history.clearAllConfirmBtn') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<style scoped>
.ai-history-item.is-current {
  border-color: hsl(var(--primary) / 0.5);
  background: hsl(var(--primary) / 0.04);
}

.ai-history-delete {
  opacity: 0;
  transition: opacity 160ms ease;
}
.ai-history-item:hover .ai-history-delete,
.ai-history-item:focus-within .ai-history-delete {
  opacity: 1;
}
@media (max-width: 768px) {
  .ai-history-delete { opacity: 1; }
}
</style>
