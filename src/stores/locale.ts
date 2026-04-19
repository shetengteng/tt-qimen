import { defineStore } from 'pinia'
import { useLocale } from '@/composables/useLocale'

export const useLocaleStore = defineStore('locale', () => {
  const { id, list, set } = useLocale()
  return { id, list, set }
})
