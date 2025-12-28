import { defineStore } from 'pinia'
import type { DateValue } from '@internationalized/date'
import { CalendarDate } from '@internationalized/date'

export type InvoiceLanguage = 'en' | 'es'

type DateValueOrPlain = ({ year: number, month: number, day: number }) | DateValue

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  amount: number
}

export interface InvoiceFrom {
  email?: string
  name: string
  logo?: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  taxId?: string
}

export interface InvoiceTo {
  email?: string
  companyName: string
  logo?: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  taxId?: string
}

export interface InvoiceDetails {
  currency: string
  items: InvoiceItem[]
  note?: string
  discount: number
  tax: number
}

export interface PaymentDetails {
  bankName: string
  accountNumber: string
  accountName: string
  ifscCode?: string
  routingNumber?: string
  swiftCode?: string
}

export interface InvoiceTerms {
  invoiceNumber: string
  issueDate: DateValue
  dueDate: DateValue
}

export interface InvoiceData {
  from: InvoiceFrom
  to: InvoiceTo
  details: InvoiceDetails
  payment: PaymentDetails
  terms: InvoiceTerms
}

export interface InvoiceTemplate {
  id: string
  name: string
  preview?: string
}

const defaultInvoiceData: InvoiceData = {
  from: {
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    email: '',
    taxId: ''
  },
  to: {
    companyName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    email: '',
    taxId: ''
  },
  details: {
    currency: 'USD',
    items: [],
    note: '',
    discount: 0,
    tax: 0
  },
  payment: {
    bankName: '',
    accountNumber: '',
    accountName: '',
    ifscCode: '',
    routingNumber: '',
    swiftCode: ''
  },
  terms: {
    invoiceNumber: '001',
    issueDate: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
    dueDate: (() => {
      const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      return new CalendarDate(futureDate.getFullYear(), futureDate.getMonth() + 1, futureDate.getDate())
    })()
  }
}

const serializeInvoiceData = (value: InvoiceData): string => {
  const serialized = {
    ...value,
    terms: {
      ...value.terms,
      issueDate: value.terms.issueDate instanceof CalendarDate
        ? { year: value.terms.issueDate.year, month: value.terms.issueDate.month, day: value.terms.issueDate.day }
        : value.terms.issueDate,
      dueDate: value.terms.dueDate instanceof CalendarDate
        ? { year: value.terms.dueDate.year, month: value.terms.dueDate.month, day: value.terms.dueDate.day }
        : value.terms.dueDate
    }
  }
  return JSON.stringify(serialized)
}

const deserializeInvoiceData = (value: string): InvoiceData => {
  const parsed = JSON.parse(value) as {
    from?: InvoiceFrom
    to?: InvoiceTo
    details?: InvoiceDetails
    payment?: PaymentDetails
    terms?: {
      invoiceNumber?: string
      issueDate?: DateValueOrPlain
      dueDate?: DateValueOrPlain
    }
  }
  return {
    from: parsed.from || defaultInvoiceData.from,
    to: parsed.to || defaultInvoiceData.to,
    details: parsed.details || defaultInvoiceData.details,
    payment: parsed.payment || defaultInvoiceData.payment,
    terms: {
      invoiceNumber: parsed.terms?.invoiceNumber || defaultInvoiceData.terms.invoiceNumber,
      issueDate: parsed.terms?.issueDate && typeof parsed.terms.issueDate === 'object' && 'year' in parsed.terms.issueDate
        ? new CalendarDate(parsed.terms.issueDate.year, parsed.terms.issueDate.month, parsed.terms.issueDate.day)
        : parsed.terms?.issueDate instanceof CalendarDate
          ? parsed.terms.issueDate
          : defaultInvoiceData.terms.issueDate,
      dueDate: parsed.terms?.dueDate && typeof parsed.terms.dueDate === 'object' && 'year' in parsed.terms.dueDate
        ? new CalendarDate(parsed.terms.dueDate.year, parsed.terms.dueDate.month, parsed.terms.dueDate.day)
        : parsed.terms?.dueDate instanceof CalendarDate
          ? parsed.terms.dueDate
          : defaultInvoiceData.terms.dueDate
    }
  }
}

const loadFromStorage = <T>(key: string, defaultValue: T, deserializer?: (value: string) => T): T => {
  if (import.meta.server) {
    // On server, return a serializable version
    if (key === 'invoice:data') {
      const serialized = serializeInvoiceData(defaultValue as InvoiceData)
      return JSON.parse(serialized) as T
    }
    return defaultValue
  }
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return defaultValue
    if (deserializer) {
      return deserializer(stored)
    }
    return JSON.parse(stored) as T
  } catch {
    return defaultValue
  }
}

const saveToStorage = <T>(key: string, value: T, serializer?: (value: T) => string): void => {
  if (import.meta.server) return
  try {
    if (serializer) {
      localStorage.setItem(key, serializer(value))
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch {
    // Ignore storage errors
  }
}

export const useInvoiceStore = defineStore('invoice', {
  state: () => {
    // Always return a complete structure
    const defaultState = {
      currentStep: 1,
      selectedTemplate: 'default',
      language: 'en' as InvoiceLanguage,
      invoiceData: {
        from: { name: '', address: '', city: '', state: '', zip: '', country: '', email: '', taxId: '' },
        to: { companyName: '', address: '', city: '', state: '', zip: '', country: '', email: '', taxId: '' },
        details: { currency: 'USD', items: [], note: '', discount: 0, tax: 0 },
        payment: { bankName: '', accountNumber: '', accountName: '', ifscCode: '', routingNumber: '', swiftCode: '' },
        terms: {
          invoiceNumber: '001',
          issueDate: { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() },
          dueDate: (() => {
            const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            return { year: futureDate.getFullYear(), month: futureDate.getMonth() + 1, day: futureDate.getDate() }
          })()
        }
      } as unknown as InvoiceData
    }

    // On server, return default serializable data
    if (import.meta.server) {
      return defaultState
    }

    // On client, load from storage
    const data = loadFromStorage<InvoiceData>('invoice:data', defaultInvoiceData, deserializeInvoiceData)
    return {
      currentStep: loadFromStorage('invoice:currentStep', 1),
      selectedTemplate: loadFromStorage('invoice:selectedTemplate', 'default'),
      language: loadFromStorage<InvoiceLanguage>('invoice:language', 'en'),
      invoiceData: data || defaultState.invoiceData
    }
  },

  hydrate(state, initialState) {
    // Load from localStorage on client side hydration
    if (import.meta.client) {
      state.currentStep = loadFromStorage('invoice:currentStep', initialState?.currentStep ?? 1)
      state.selectedTemplate = loadFromStorage('invoice:selectedTemplate', initialState?.selectedTemplate ?? 'default')
      state.language = loadFromStorage<InvoiceLanguage>('invoice:language', initialState?.language ?? 'en')
      // Convert plain objects back to CalendarDate
      const data = loadFromStorage<InvoiceData>('invoice:data', (initialState?.invoiceData ?? defaultInvoiceData) as unknown as InvoiceData, deserializeInvoiceData)
      state.invoiceData = data as unknown as InvoiceData
    } else {
      // On server, ensure dates are plain objects
      if (state.invoiceData?.terms) {
        const issueDate = state.invoiceData.terms.issueDate
        if (issueDate && typeof issueDate === 'object' && 'year' in issueDate && !('calendar' in issueDate)) {
          // Already serialized as plain object
        } else if (issueDate instanceof CalendarDate) {
          state.invoiceData.terms.issueDate = {
            year: issueDate.year,
            month: issueDate.month,
            day: issueDate.day
          } as unknown as DateValue
        }
        const dueDate = state.invoiceData.terms.dueDate
        if (dueDate && typeof dueDate === 'object' && 'year' in dueDate && !('calendar' in dueDate)) {
          // Already serialized as plain object
        } else if (dueDate instanceof CalendarDate) {
          state.invoiceData.terms.dueDate = {
            year: dueDate.year,
            month: dueDate.month,
            day: dueDate.day
          } as unknown as DateValue
        }
      }
    }
  },

  getters: {
    templates: () => [
      {
        id: 'default',
        name: 'Default'
      }
    ] as InvoiceTemplate[],

    subtotal(): number {
      if (!this.invoiceData?.details) return 0
      const items = this.invoiceData.details.items || []
      return items.reduce((sum: number, item: InvoiceItem) => sum + (item.amount || 0), 0)
    },

    discountAmount(): number {
      if (!this.invoiceData || !this.invoiceData.details) return 0
      const subtotal = this.subtotal
      const discount = (this.invoiceData.details.discount || 0)
      return (subtotal * discount) / 100
    },

    taxAmount(): number {
      if (!this.invoiceData?.details) return 0
      const subtotal = this.subtotal
      const discountAmount = this.discountAmount
      const afterDiscount = subtotal - discountAmount
      const tax = this.invoiceData.details.tax || 0
      return (afterDiscount * tax) / 100
    },

    total(): number {
      const subtotal = this.subtotal
      const discountAmount = this.discountAmount
      const taxAmount = this.taxAmount
      return subtotal - discountAmount + taxAmount
    }
  },

  actions: {
    addItem() {
      this.invoiceData.details.items.push({
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        price: 0,
        amount: 0
      })
      this.saveToLocalStorage()
    },

    removeItem(id: string) {
      const index = this.invoiceData.details.items.findIndex((item: InvoiceItem) => item.id === id)
      if (index > -1) {
        this.invoiceData.details.items.splice(index, 1)
        this.saveToLocalStorage()
      }
    },

    updateItem(id: string, field: keyof InvoiceItem, value: string | number) {
      const item = this.invoiceData.details.items.find((i: InvoiceItem) => i.id === id)
      if (item) {
        item[field] = value as never
        if (field === 'quantity' || field === 'price') {
          item.amount = item.quantity * item.price
        }
        this.saveToLocalStorage()
      }
    },

    exportToJSON() {
      const dataStr = JSON.stringify(this.invoiceData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${this.invoiceData.terms.invoiceNumber}.json`
      link.click()
      URL.revokeObjectURL(url)
    },

    async importFromJSON(file: File) {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string) as {
              from?: InvoiceFrom
              to?: InvoiceTo
              details?: InvoiceDetails
              payment?: PaymentDetails
              terms?: {
                invoiceNumber?: string
                issueDate?: DateValueOrPlain
                dueDate?: DateValueOrPlain
              }
            }
            const importedData: InvoiceData = {
              from: data.from || defaultInvoiceData.from,
              to: data.to || defaultInvoiceData.to,
              details: data.details || defaultInvoiceData.details,
              payment: data.payment || defaultInvoiceData.payment,
              terms: {
                invoiceNumber: data.terms?.invoiceNumber || defaultInvoiceData.terms.invoiceNumber,
                issueDate: data.terms?.issueDate && typeof data.terms.issueDate === 'object' && 'year' in data.terms.issueDate
                  ? new CalendarDate(data.terms.issueDate.year, data.terms.issueDate.month, data.terms.issueDate.day)
                  : defaultInvoiceData.terms.issueDate,
                dueDate: data.terms?.dueDate && typeof data.terms.dueDate === 'object' && 'year' in data.terms.dueDate
                  ? new CalendarDate(data.terms.dueDate.year, data.terms.dueDate.month, data.terms.dueDate.day)
                  : defaultInvoiceData.terms.dueDate
              }
            }
            this.invoiceData = importedData
            this.saveToLocalStorage()
            resolve()
          } catch {
            reject(new Error('Invalid JSON file'))
          }
        }
        reader.onerror = () => reject(new Error('Error reading file'))
        reader.readAsText(file)
      })
    },

    nextStep() {
      if (this.currentStep < 6) {
        this.currentStep++
        this.saveToLocalStorage()
      }
    },

    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
        this.saveToLocalStorage()
      }
    },

    resetInvoice() {
      this.invoiceData = { ...defaultInvoiceData }
      this.currentStep = 1
      this.saveToLocalStorage()
    },

    downloadPDF() {
      // Open preview page in new window for printing
      if (import.meta.client) {
        const previewUrl = `${window.location.origin}/invoice-generator/preview?print=true`
        const printWindow = window.open(previewUrl, '_blank')
        if (!printWindow) {
          // If popup was blocked, try opening in same window
          window.location.href = previewUrl
        }
      }
    },

    saveToLocalStorage() {
      saveToStorage('invoice:currentStep', this.currentStep)
      saveToStorage('invoice:selectedTemplate', this.selectedTemplate)
      saveToStorage('invoice:language', this.language)
      saveToStorage('invoice:data', this.invoiceData as unknown as InvoiceData, serializeInvoiceData)
    }
  }
})
