import { defineStore } from 'pinia'
import { useTheme } from '@/composables/useTheme'

export const useThemeStore = defineStore('theme', () => {
  const { id, list, registry, set } = useTheme()
  return { id, list, registry, set }
})
