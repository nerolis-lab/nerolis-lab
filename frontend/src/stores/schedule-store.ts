import { defineStore } from 'pinia'

export const useScheduleStore = defineStore('schedule', {
  state: () => ({ ingredientExplainerAcknowledged: false }),
  persist: true
})
