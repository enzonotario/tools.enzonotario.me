import { defineStore } from 'pinia'

interface PasswordGeneratorState {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSimpleSymbols: boolean
  includeAllSymbols: boolean
  generatedPassword: string
}

const defaultState: PasswordGeneratorState = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSimpleSymbols: false,
  includeAllSymbols: false,
  generatedPassword: ''
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

export const usePasswordGeneratorStore = defineStore('passwordGenerator', {
  state: (): PasswordGeneratorState => {
    if (import.meta.server) {
      return { ...defaultState }
    }

    // Migrate old includeSymbols to includeSimpleSymbols for backward compatibility
    const oldIncludeSymbols = loadFromStorage('passwordGenerator:includeSymbols', null)
    const includeSimpleSymbols = oldIncludeSymbols !== null
      ? oldIncludeSymbols
      : loadFromStorage('passwordGenerator:includeSimpleSymbols', defaultState.includeSimpleSymbols)

    return {
      length: loadFromStorage('passwordGenerator:length', defaultState.length),
      includeUppercase: loadFromStorage('passwordGenerator:includeUppercase', defaultState.includeUppercase),
      includeLowercase: loadFromStorage('passwordGenerator:includeLowercase', defaultState.includeLowercase),
      includeNumbers: loadFromStorage('passwordGenerator:includeNumbers', defaultState.includeNumbers),
      includeSimpleSymbols,
      includeAllSymbols: loadFromStorage('passwordGenerator:includeAllSymbols', defaultState.includeAllSymbols),
      generatedPassword: ''
    }
  },

  getters: {
    passwordStrength(): { level: number, labelKey: string, color: string } {
      if (!this.generatedPassword) return { level: 0, labelKey: '', color: '' }

      let strength = 0
      if (this.length >= 12) strength++
      if (this.length >= 16) strength++
      if (this.includeUppercase && this.includeLowercase) strength++
      if (this.includeNumbers) strength++
      if (this.includeSimpleSymbols || this.includeAllSymbols) strength++

      if (strength <= 2) return { level: 1, labelKey: 'Weak', color: 'red' }
      if (strength === 3) return { level: 2, labelKey: 'Fair', color: 'orange' }
      if (strength === 4) return { level: 3, labelKey: 'Good', color: 'yellow' }
      return { level: 4, labelKey: 'Strong', color: 'green' }
    }
  },

  actions: {
    generatePassword() {
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const lowercase = 'abcdefghijklmnopqrstuvwxyz'
      const numbers = '0123456789'
      const simpleSymbols = '!@#$%^&*()_+-='
      const allSymbols = '!@#$%^&*()_+-=[]{}|;:,.<>?"\'`~/\\'

      let charset = ''
      if (this.includeUppercase) charset += uppercase
      if (this.includeLowercase) charset += lowercase
      if (this.includeNumbers) charset += numbers
      if (this.includeAllSymbols) {
        charset += allSymbols
      } else if (this.includeSimpleSymbols) {
        charset += simpleSymbols
      }

      if (charset === '') {
        this.generatedPassword = ''
        this.saveToLocalStorage()
        return
      }

      let password = ''
      for (let i = 0; i < this.length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        password += charset[randomIndex]
      }

      this.generatedPassword = password
      this.saveToLocalStorage()
    },

    setLength(value: number) {
      this.length = Math.max(8, Math.min(128, value))
      this.saveToLocalStorage()
      if (this.generatedPassword) {
        this.generatePassword()
      }
    },

    setIncludeUppercase(value: boolean) {
      this.includeUppercase = value
      this.saveToLocalStorage()
      if (this.generatedPassword) {
        this.generatePassword()
      }
    },

    setIncludeLowercase(value: boolean) {
      this.includeLowercase = value
      this.saveToLocalStorage()
      if (this.generatedPassword) {
        this.generatePassword()
      }
    },

    setIncludeNumbers(value: boolean) {
      this.includeNumbers = value
      this.saveToLocalStorage()
      if (this.generatedPassword) {
        this.generatePassword()
      }
    },

    setIncludeSimpleSymbols(value: boolean) {
      this.includeSimpleSymbols = value
      // If enabling all symbols, disable simple symbols
      if (value && this.includeAllSymbols) {
        this.includeAllSymbols = false
      }
      this.saveToLocalStorage()
      if (this.generatedPassword) {
        this.generatePassword()
      }
    },

    setIncludeAllSymbols(value: boolean) {
      this.includeAllSymbols = value
      // If enabling all symbols, disable simple symbols
      if (value && this.includeSimpleSymbols) {
        this.includeSimpleSymbols = false
      }
      this.saveToLocalStorage()
      if (this.generatedPassword) {
        this.generatePassword()
      }
    },

    saveToLocalStorage() {
      saveToStorage('passwordGenerator:length', this.length)
      saveToStorage('passwordGenerator:includeUppercase', this.includeUppercase)
      saveToStorage('passwordGenerator:includeLowercase', this.includeLowercase)
      saveToStorage('passwordGenerator:includeNumbers', this.includeNumbers)
      saveToStorage('passwordGenerator:includeSimpleSymbols', this.includeSimpleSymbols)
      saveToStorage('passwordGenerator:includeAllSymbols', this.includeAllSymbols)
    }
  }
})
