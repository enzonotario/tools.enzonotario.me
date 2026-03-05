<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const invoiceStore = useInvoiceStore()

// Helper to convert plain object to CalendarDate
const toCalendarDate = (date: CalendarDate | { year: number, month: number, day: number } | null | undefined): CalendarDate => {
  if (date instanceof CalendarDate) {
    return date
  }
  if (date && typeof date === 'object' && 'year' in date && 'month' in date && 'day' in date) {
    return new CalendarDate(date.year, date.month, date.day)
  }
  // Fallback to today
  const today = new Date()
  return new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
}

const issueDate = computed({
  get: () => {
    const date = invoiceStore.invoiceData.terms?.issueDate
    return toCalendarDate(date)
  },
  set: (value: CalendarDate) => {
    invoiceStore.invoiceData.terms.issueDate = value
    invoiceStore.saveToLocalStorage()
  }
})

const hasDueDate = computed({
  get: () => invoiceStore.invoiceData.terms?.dueDate != null,
  set: (value: boolean) => {
    if (value) {
      const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      invoiceStore.invoiceData.terms.dueDate = new CalendarDate(futureDate.getFullYear(), futureDate.getMonth() + 1, futureDate.getDate())
    } else {
      invoiceStore.invoiceData.terms.dueDate = null
    }
    invoiceStore.saveToLocalStorage()
  }
})

const hasBillingPeriod = computed({
  get: () => invoiceStore.invoiceData.terms?.billingPeriod != null,
  set: (value: boolean) => {
    if (value) {
      const today = new Date()
      const firstOfMonth = new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1)
      const lastOfMonth = new CalendarDate(today.getFullYear(), today.getMonth() + 1, new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate())
      invoiceStore.invoiceData.terms.billingPeriod = { start: firstOfMonth, end: lastOfMonth }
    } else {
      invoiceStore.invoiceData.terms.billingPeriod = null
    }
    invoiceStore.saveToLocalStorage()
  }
})

const billingPeriodStart = computed({
  get: () => toCalendarDate(invoiceStore.invoiceData.terms?.billingPeriod?.start),
  set: (value: CalendarDate) => {
    if (invoiceStore.invoiceData.terms.billingPeriod) {
      invoiceStore.invoiceData.terms.billingPeriod.start = value
      invoiceStore.saveToLocalStorage()
    }
  }
})

const billingPeriodEnd = computed({
  get: () => toCalendarDate(invoiceStore.invoiceData.terms?.billingPeriod?.end),
  set: (value: CalendarDate) => {
    if (invoiceStore.invoiceData.terms.billingPeriod) {
      invoiceStore.invoiceData.terms.billingPeriod.end = value
      invoiceStore.saveToLocalStorage()
    }
  }
})

const dueDate = computed({
  get: () => {
    const date = invoiceStore.invoiceData.terms?.dueDate
    return toCalendarDate(date)
  },
  set: (value: CalendarDate) => {
    invoiceStore.invoiceData.terms.dueDate = value
    invoiceStore.saveToLocalStorage()
  }
})

// Use toRefs for terms, but keep computed for dates
const terms = toRefs(invoiceStore.invoiceData).terms

// Watch for changes in terms and save to localStorage
watch(terms, () => {
  invoiceStore.saveToLocalStorage()
}, { deep: true })

// Also watch issueDate and dueDate
watch([issueDate, dueDate], () => {
  invoiceStore.saveToLocalStorage()
})
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">
      Términos de la Factura
    </h2>

    <div class="space-y-4">
      <UFormField label="Número de Factura">
        <UInput
          v-model="terms.invoiceNumber"
          placeholder="001"
        />
      </UFormField>

      <UFormField label="Fecha de Emisión">
        <UInputDate
          v-model="issueDate"
        />
      </UFormField>

      <div class="space-y-2">
        <UCheckbox
          v-model="hasDueDate"
          label="Fecha de Vencimiento"
        />
        <UInputDate
          v-if="hasDueDate"
          v-model="dueDate"
        />
      </div>

      <div class="space-y-2">
        <UCheckbox
          v-model="hasBillingPeriod"
          label="Período de Facturación"
        />
        <div
          v-if="hasBillingPeriod"
          class="flex items-center gap-3"
        >
          <UInputDate v-model="billingPeriodStart" />
          <span class="text-sm text-gray-500">al</span>
          <UInputDate v-model="billingPeriodEnd" />
        </div>
      </div>
    </div>
  </div>
</template>
