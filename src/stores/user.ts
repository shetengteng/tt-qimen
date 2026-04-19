import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

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

const DEFAULT: BirthInput = {
  calendar: 'solar',
  year: 1990,
  month: 5,
  day: 20,
  hour: 12,
  minute: 0,
  gender: 'male',
}

export const useUserStore = defineStore('user', () => {
  const birth = useStorage<BirthInput>('tt-qimen:birth', { ...DEFAULT }, undefined, {
    mergeDefaults: true,
  })

  function update(patch: Partial<BirthInput>) {
    birth.value = { ...birth.value, ...patch }
  }

  function reset() {
    birth.value = { ...DEFAULT }
  }

  return { birth, update, reset }
})
