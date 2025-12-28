import { defineStore } from 'pinia'

interface SplitPaneSizes {
  [key: string]: number
}

const loadFromStorage = (key: string, defaultValue: number): number => {
  if (import.meta.server) return defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return defaultValue
    return Number.parseFloat(stored) || defaultValue
  } catch {
    return defaultValue
  }
}

const saveToStorage = (key: string, value: number): void => {
  if (import.meta.server) return
  try {
    localStorage.setItem(key, value.toString())
  } catch {
    // Ignore storage errors
  }
}

export const useSplitPaneStore = defineStore('splitPane', {
  state: (): { sizes: SplitPaneSizes } => ({
    sizes: {}
  }),

  actions: {
    getSize(key: string, defaultPercent: number): number {
      if (this.sizes[key]) {
        return this.sizes[key]
      }
      const stored = loadFromStorage(`splitPane:${key}`, defaultPercent)
      this.sizes[key] = stored
      return stored
    },

    setSize(key: string, percent: number): void {
      this.sizes[key] = percent
      saveToStorage(`splitPane:${key}`, percent)
    }
  }
})
