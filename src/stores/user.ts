import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'

export interface BirthInput {
  calendar: 'solar' | 'lunar'
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: 'male' | 'female'
  longitude?: number
  birthplace?: string
}

export const DEFAULT_BIRTH: BirthInput = {
  calendar: 'solar',
  year: 1990,
  month: 5,
  day: 20,
  hour: 12,
  minute: 0,
  gender: 'male',
}

/**
 * 判定 birth 是否仍处于初始默认值（用于决定首屏要不要自动排盘）。
 * 仅比对参与排盘计算的字段；longitude / birthplace 不影响。
 */
export function isDefaultBirth(b: BirthInput): boolean {
  return (
    b.calendar === DEFAULT_BIRTH.calendar
    && b.year === DEFAULT_BIRTH.year
    && b.month === DEFAULT_BIRTH.month
    && b.day === DEFAULT_BIRTH.day
    && b.hour === DEFAULT_BIRTH.hour
    && b.minute === DEFAULT_BIRTH.minute
    && b.gender === DEFAULT_BIRTH.gender
  )
}

export const useUserStore = defineStore('user', () => {
  const birth = useStorage<BirthInput>('tt-qimen:birth', { ...DEFAULT_BIRTH }, undefined, {
    mergeDefaults: true,
  })

  function update(patch: Partial<BirthInput>) {
    birth.value = { ...birth.value, ...patch }
  }

  function reset() {
    birth.value = { ...DEFAULT_BIRTH }
  }

  const isDefault = computed(() => isDefaultBirth(birth.value))

  return { birth, update, reset, isDefault }
})
