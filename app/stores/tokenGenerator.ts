import { defineStore } from 'pinia'

interface TokenGeneratorState {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  generatedToken: string
}

const defaultState: TokenGeneratorState = {
  length: 64,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
  generatedToken: ''
}

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (import.meta.server) return defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return defaultValue
    return JSON.parse(stored) as T
  } catch {
    return defaultValue
  }
}

const saveToStorage = <T>(key: string, value: T): void => {
  if (import.meta.server) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors
  }
}

export const useTokenGeneratorStore = defineStore('tokenGenerator', {
  state: (): TokenGeneratorState => {
    if (import.meta.server) {
      return { ...defaultState }
    }

    return {
      length: loadFromStorage('tokenGenerator:length', defaultState.length),
      includeUppercase: loadFromStorage('tokenGenerator:includeUppercase', defaultState.includeUppercase),
      includeLowercase: loadFromStorage('tokenGenerator:includeLowercase', defaultState.includeLowercase),
      includeNumbers: loadFromStorage('tokenGenerator:includeNumbers', defaultState.includeNumbers),
      includeSymbols: loadFromStorage('tokenGenerator:includeSymbols', defaultState.includeSymbols),
      generatedToken: ''
    }
  },

  actions: {
    generateToken() {
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const lowercase = 'abcdefghijklmnopqrstuvwxyz'
      const numbers = '0123456789'
      const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?"\'`~/\\'

      let charset = ''
      if (this.includeUppercase) charset += uppercase
      if (this.includeLowercase) charset += lowercase
      if (this.includeNumbers) charset += numbers
      if (this.includeSymbols) charset += symbols

      if (charset === '') {
        this.generatedToken = ''
        this.saveToLocalStorage()
        return
      }

      let token = ''
      for (let i = 0; i < this.length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        token += charset[randomIndex]
      }

      this.generatedToken = token
      this.saveToLocalStorage()
    },

    setLength(value: number) {
      this.length = Math.max(1, Math.min(512, value))
      this.saveToLocalStorage()
      if (this.generatedToken) {
        this.generateToken()
      }
    },

    setIncludeUppercase(value: boolean) {
      this.includeUppercase = value
      this.saveToLocalStorage()
      if (this.generatedToken) {
        this.generateToken()
      }
    },

    setIncludeLowercase(value: boolean) {
      this.includeLowercase = value
      this.saveToLocalStorage()
      if (this.generatedToken) {
        this.generateToken()
      }
    },

    setIncludeNumbers(value: boolean) {
      this.includeNumbers = value
      this.saveToLocalStorage()
      if (this.generatedToken) {
        this.generateToken()
      }
    },

    setIncludeSymbols(value: boolean) {
      this.includeSymbols = value
      this.saveToLocalStorage()
      if (this.generatedToken) {
        this.generateToken()
      }
    },

    saveToLocalStorage() {
      saveToStorage('tokenGenerator:length', this.length)
      saveToStorage('tokenGenerator:includeUppercase', this.includeUppercase)
      saveToStorage('tokenGenerator:includeLowercase', this.includeLowercase)
      saveToStorage('tokenGenerator:includeNumbers', this.includeNumbers)
      saveToStorage('tokenGenerator:includeSymbols', this.includeSymbols)
    }
  }
})
