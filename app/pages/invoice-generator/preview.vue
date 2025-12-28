<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

definePageMeta({
  layout: 'print'
})

const invoiceStore = useInvoiceStore()

// Forzar modo light en el preview
const colorMode = useColorMode()
const previousColorMode = ref<string | null>(null)

onMounted(() => {
  if (import.meta.client) {
    // Guardar el modo anterior
    previousColorMode.value = colorMode.value
    // Forzar modo light
    colorMode.preference = 'light'
  }
})

onUnmounted(() => {
  if (import.meta.client && previousColorMode.value) {
    // Restaurar el modo anterior al salir del preview
    colorMode.preference = previousColorMode.value
  }
})

const language = computed(() => invoiceStore.language || 'en')
const t = computed(() => useInvoiceTranslations(language.value))

const formatDate = (date: Date | { year: number, month: number, day: number } | string | null | undefined) => {
  if (!date) return ''
  const locale = language.value === 'es' ? 'es-ES' : 'en-US'

  let day: number
  let month: number
  let year: number

  if (date instanceof Date) {
    day = date.getDate()
    month = date.getMonth() + 1
    year = date.getFullYear()
  } else if (typeof date === 'object' && 'year' in date) {
    day = date.day
    month = date.month
    year = date.year
  } else {
    return String(date)
  }

  const monthNames = locale === 'es-ES'
    ? ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const monthName = monthNames[month - 1]

  if (locale === 'en-US') {
    // Format: "26th Nov 2025"
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th'
    return `${day}${suffix} ${monthName} ${year}`
  } else {
    // Format: "26 dic 2025"
    return `${day} ${monthName} ${year}`
  }
}

const invoiceData = computed(() => invoiceStore.invoiceData || {
  from: { name: '', address: '', city: '', state: '', zip: '', country: '' },
  to: { companyName: '', address: '', city: '', state: '', zip: '', country: '' },
  details: { currency: 'USD', items: [], discount: 0, tax: 0 },
  payment: { bankName: '', accountNumber: '', accountName: '' },
  terms: {
    invoiceNumber: '001',
    issueDate: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
    dueDate: new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
  }
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: invoiceData.value.details?.currency || 'USD'
  }).format(amount)
}

const getCurrencyName = (code: string) => {
  const currencyNames: Record<string, string> = {
    USD: 'United States Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    ARS: 'Argentine Peso'
  }
  return currencyNames[code] || code
}

const getCurrencySymbol = (code: string) => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    ARS: '$'
  }
  return symbols[code] || code
}

const getCurrencyFlag = (code: string) => {
  const flags: Record<string, string> = {
    USD: '/flags/us.svg',
    EUR: '/flags/eu.svg',
    GBP: '/flags/gb.svg',
    ARS: '/flags/ar.svg'
  }
  return flags[code] || null
}

onMounted(() => {
  if (import.meta.client) {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('print') === 'true') {
      // Wait for content to be fully rendered before printing
      setTimeout(() => {
        window.print()
        // Close window after printing (if opened in new window)
        setTimeout(() => {
          if (window.opener) {
            window.close()
          }
        }, 1000)
      }, 1000)
    }
  }
})
</script>

<template>
  <ClientOnly>
    <div class="invoice-preview-wrapper light">
      <div class="invoice-preview max-w-4xl mx-auto bg-white">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
          <div>
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
              {{ t.invoiceNo }}
            </div>
            <div class="font-bold text-lg text-gray-900">
              {{ invoiceData.terms?.invoiceNumber || '001' }}
            </div>
          </div>
          <div class="flex gap-8 items-center">
            <div class="text-right">
              <div class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                {{ t.issued }}
              </div>
              <div class="font-bold text-base text-gray-900">
                {{ formatDate(invoiceData.terms?.issueDate) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                {{ t.dueDate }}
              </div>
              <div class="font-bold text-base text-gray-900">
                {{ formatDate(invoiceData.terms?.dueDate) }}
              </div>
            </div>
          </div>
        </div>

        <!-- From/To Section -->
        <div class="grid grid-cols-2 gap-12 mb-6">
          <div>
            <h3 class="font-bold mb-3 text-xs text-gray-500 uppercase tracking-wide">
              {{ t.from }}
            </h3>
            <div class="space-y-1">
              <p class="font-semibold text-sm text-gray-900">
                {{ invoiceData.from?.name || 'N/A' }}
              </p>
              <p class="text-sm text-gray-700">
                {{ invoiceData.from?.address }}
              </p>
              <p class="text-sm text-gray-700">
                {{ invoiceData.from?.city }}, {{ invoiceData.from?.state }} {{ invoiceData.from?.zip }}
              </p>
              <p class="text-sm text-gray-700">
                {{ invoiceData.from?.country }}
              </p>
              <p
                v-if="invoiceData.from?.taxId"
                class="text-sm text-gray-700"
              >
                {{ t.taxId }} {{ invoiceData.from.taxId }}
              </p>
            </div>
          </div>
          <div>
            <h3 class="font-bold mb-3 text-xs text-gray-500 uppercase tracking-wide">
              {{ t.to }}
            </h3>
            <div class="space-y-1">
              <p class="font-semibold text-sm text-gray-900">
                {{ invoiceData.to?.companyName || 'N/A' }}
              </p>
              <p class="text-sm text-gray-700">
                {{ invoiceData.to?.address }}
              </p>
              <p class="text-sm text-gray-700">
                {{ invoiceData.to?.city }}, {{ invoiceData.to?.state }} {{ invoiceData.to?.zip }}
              </p>
              <p class="text-sm text-gray-700">
                {{ invoiceData.to?.country }}
              </p>
              <p
                v-if="invoiceData.to?.taxId"
                class="text-sm text-gray-700"
              >
                {{ t.taxId }} {{ invoiceData.to.taxId }}
              </p>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div class="mb-6">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {{ t.description }}
                </th>
                <th class="border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {{ t.quantity }}
                </th>
                <th class="border border-gray-200 px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {{ t.price }}
                </th>
                <th class="border border-gray-200 px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {{ t.total }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in (invoiceData.details?.items || [])"
                :key="item.id"
              >
                <td class="border border-gray-200 px-3 py-2 text-sm text-gray-700">
                  {{ item.description || 'N/A' }}
                </td>
                <td class="border border-gray-200 px-3 py-2 text-center text-sm text-gray-700">
                  {{ item.quantity }}
                </td>
                <td class="border border-gray-200 px-3 py-2 text-right text-sm text-gray-700">
                  {{ formatCurrency(item.price) }}
                </td>
                <td class="border border-gray-200 px-3 py-2 text-right text-sm text-gray-700">
                  {{ formatCurrency(item.amount) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  colspan="3"
                  class="border border-gray-200 px-3 py-2 text-right text-sm font-semibold text-gray-700"
                >
                  {{ t.subtotal }}
                </td>
                <td class="border border-gray-200 px-3 py-2 text-right text-sm font-semibold text-gray-700">
                  {{ formatCurrency(invoiceStore.subtotal) }}
                </td>
              </tr>
              <tr
                v-if="(invoiceData.details?.discount || 0) > 0"
              >
                <td
                  colspan="3"
                  class="border border-gray-200 px-3 py-2 text-right text-sm text-gray-700"
                >
                  {{ t.discount }} ({{ invoiceData.details?.discount || 0 }}%):
                </td>
                <td class="border border-gray-200 px-3 py-2 text-right text-sm text-gray-700">
                  - {{ formatCurrency(invoiceStore.discountAmount) }}
                </td>
              </tr>
              <tr
                v-if="(invoiceData.details?.tax || 0) > 0"
              >
                <td
                  colspan="3"
                  class="border border-gray-200 px-3 py-2 text-right text-sm text-gray-700"
                >
                  {{ t.tax }} ({{ invoiceData.details?.tax || 0 }}%):
                </td>
                <td class="border border-gray-200 px-3 py-2 text-right text-sm text-gray-700">
                  {{ formatCurrency(invoiceStore.taxAmount) }}
                </td>
              </tr>
              <tr>
                <td
                  colspan="3"
                  class="border border-gray-200 px-3 py-2 text-right font-bold text-base text-gray-900"
                >
                  {{ t.totalLabel }}
                </td>
                <td class="border border-gray-200 px-3 py-2 text-right font-bold text-base text-gray-900">
                  {{ formatCurrency(invoiceStore.total) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Note -->
        <div
          v-if="invoiceData.details?.note"
          class="mb-6"
        >
          <h3 class="font-semibold mb-1 text-sm text-gray-900">
            {{ t.note }}
          </h3>
          <p class="text-sm text-gray-700">
            {{ invoiceData.details.note }}
          </p>
        </div>

        <!-- Payment Details and Payable In -->
        <div class="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200">
          <!-- Payment Details -->
          <div
            v-if="invoiceData.payment?.bankName"
          >
            <h3 class="font-bold mb-3 text-xs text-gray-500 uppercase tracking-wide">
              {{ t.bankDetails }}
            </h3>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div class="text-gray-600">
                {{ t.bank }}
              </div>
              <div class="font-semibold text-gray-900">
                {{ invoiceData.payment.bankName }}
              </div>
              <div class="text-gray-600">
                {{ t.accountNumber }}
              </div>
              <div class="font-semibold text-gray-900">
                {{ invoiceData.payment.accountNumber }}
              </div>
              <div class="text-gray-600">
                {{ t.accountName }}
              </div>
              <div class="font-semibold text-gray-900">
                {{ invoiceData.payment.accountName }}
              </div>
              <div
                v-if="invoiceData.payment.swiftCode"
                class="text-gray-600"
              >
                {{ t.swiftCode }}
              </div>
              <div
                v-if="invoiceData.payment.swiftCode"
                class="font-semibold text-gray-900"
              >
                {{ invoiceData.payment.swiftCode }}
              </div>
              <div
                v-if="invoiceData.payment.routingNumber"
                class="text-gray-600"
              >
                {{ t.routingNumber }}
              </div>
              <div
                v-if="invoiceData.payment.routingNumber"
                class="font-semibold text-gray-900"
              >
                {{ invoiceData.payment.routingNumber }}
              </div>
              <div
                v-if="invoiceData.payment.ifscCode"
                class="text-gray-600"
              >
                {{ t.ifscCode }}
              </div>
              <div
                v-if="invoiceData.payment.ifscCode"
                class="font-semibold text-gray-900"
              >
                {{ invoiceData.payment.ifscCode }}
              </div>
            </div>
          </div>
          <div
            v-else
          />

          <!-- Payable In -->
          <div>
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">
              {{ t.payableIn }}
            </div>
            <div class="flex items-center gap-2 mb-1">
              <img
                v-if="getCurrencyFlag(invoiceData.details?.currency || 'USD')"
                :src="getCurrencyFlag(invoiceData.details?.currency || 'USD') || undefined"
                :alt="`${invoiceData.details?.currency || 'USD'} Flag`"
                class="w-8 h-8 object-cover rounded-full"
              >
              <div class="flex flex-col">
                <span class="font-semibold text-sm text-gray-900">{{ getCurrencyName(invoiceData.details?.currency || 'USD') }}</span>
                <div class="text-sm text-gray-700">
                  {{ getCurrencySymbol(invoiceData.details?.currency || 'USD') }} {{ invoiceData.details?.currency || 'USD' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #fallback>
      <PreviewSkeleton />
    </template>
  </ClientOnly>
</template>

<style scoped>
.invoice-preview-wrapper {
  padding: 0;
  min-height: 100vh;
  background-color: transparent;
}

/* Forzar modo light en el preview */
.invoice-preview-wrapper.light,
.invoice-preview-wrapper.light :deep(*) {
  color-scheme: light;
}

.invoice-preview {
  padding: 2.5rem;
  box-shadow: none;
  background-color: white;
  color: #111827;
}

@media print {
  .invoice-preview-wrapper {
    padding: 0;
    background-color: white;
  }

  .invoice-preview {
    padding: 2rem;
    max-width: 100%;
    box-shadow: none;
    background-color: white;
  }
}
</style>
