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

      <UFormField label="Fecha de Vencimiento">
        <UInputDate
          v-model="dueDate"
        />
      </UFormField>
    </div>
  </div>
</template>
