<script setup lang="ts">
import type { Component } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const invoiceStore = useInvoiceStore()

const steps = [
  {
    title: 'Your Details',
    description: 'Tus Detalles'
  },
  {
    title: 'Company Details',
    description: 'Detalles de la Empresa'
  },
  {
    title: 'Invoice Details',
    description: 'Detalles de la Factura'
  },
  {
    title: 'Payment Details',
    description: 'Detalles de Pago'
  },
  {
    title: 'Invoice Terms',
    description: 'Términos de la Factura'
  },
  {
    title: 'Review & Download',
    description: 'Revisar y Descargar'
  }
]

// Convert 1-based currentStep to 0-based activeStep
const activeStep = ref(invoiceStore.currentStep - 1)

// Watch for changes in currentStep and update activeStep (convert 1-based to 0-based)
watch(() => invoiceStore.currentStep, (newValue) => {
  activeStep.value = newValue - 1
}, { immediate: true })

// Watch for changes in activeStep and update store (convert 0-based to 1-based)
watch(activeStep, (newValue) => {
  invoiceStore.currentStep = newValue + 1
  invoiceStore.saveToLocalStorage()
})

// Add a reactive key to force iframe refresh when data changes
const previewKey = ref(0)

// Debounce function
const debounce = (fn: () => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(fn, delay)
  }
}

// Watch for changes in invoice data to refresh preview with debounce
const updatePreview = debounce(() => {
  if (import.meta.client) {
    previewKey.value++
  }
}, 200)

// Watch for deep changes in invoiceData to update preview in real-time
if (import.meta.client) {
  watch(
    () => invoiceStore.invoiceData,
    () => {
      updatePreview()
    },
    { deep: true, immediate: false }
  )

  // Watch for language changes to update preview and save to localStorage
  watch(
    () => invoiceStore.language,
    () => {
      invoiceStore.saveToLocalStorage()
      updatePreview()
    }
  )
}

const previewUrl = computed(() => {
  // Add timestamp to force refresh
  return `/invoice-generator/preview?t=${previewKey.value}`
})

// Import step components
const Step1 = defineAsyncComponent(() => import('./step-1.vue'))
const Step2 = defineAsyncComponent(() => import('./step-2.vue'))
const Step3 = defineAsyncComponent(() => import('./step-3.vue'))
const Step4 = defineAsyncComponent(() => import('./step-4.vue'))
const Step5 = defineAsyncComponent(() => import('./step-5.vue'))
const Step6 = defineAsyncComponent(() => import('./step-6.vue'))

const stepComponents: Record<number, Component> = {
  1: Step1,
  2: Step2,
  3: Step3,
  4: Step4,
  5: Step5,
  6: Step6
}

const handleImportJSON = () => {
  if (import.meta.client) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        invoiceStore.importFromJSON(file)
      }
    }
    input.click()
  }
}
</script>

<template>
  <div class="split-pane-wrapper h-full">
    <Teleport to="#header-actions-portal">
      <div class="flex items-center gap-2">
        <USelectMenu
          v-model="invoiceStore.language"
          :items="[
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' }
          ]"
          value-key="value"
          label-key="label"
          size="sm"
          color="neutral"
          variant="outline"
        />
        <UButton
          variant="outline"
          size="sm"
          color="neutral"
          icon="i-lucide-download"
          @click="invoiceStore.exportToJSON()"
        >
          Exportar JSON
        </UButton>
        <UButton
          variant="outline"
          size="sm"
          color="neutral"
          icon="i-lucide-upload"
          @click="handleImportJSON"
        >
          Importar JSON
        </UButton>
      </div>
    </Teleport>

    <ClientOnly>
      <SplitPane
        split="vertical"
        :min-percent="25"
        :default-percent="33"
        storage-key="invoice-generator"
        class="h-full"
      >
        <template #paneL>
          <div class="overflow-y-auto h-full p-8 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div class="max-w-xl mx-auto">
              <div class="mb-6">
                <h1 class="text-2xl font-bold mb-1">
                  Invoice Generator
                </h1>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Crea facturas profesionales en minutos
                </p>
              </div>

              <UStepper
                v-model="activeStep"
                :items="steps"
                orientation="horizontal"
                color="neutral"
                :linear="false"
                class="mb-6"
              />

              <ClientOnly>
                <div class="mt-8">
                  <component
                    :is="stepComponents[activeStep + 1]"
                  />
                </div>
                <template #fallback>
                  <div class="mt-8">
                    <div class="animate-pulse space-y-4">
                      <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                </template>
              </ClientOnly>

              <!-- Navigation Controls -->
              <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  <UButton
                    v-if="activeStep > 0"
                    variant="ghost"
                    color="neutral"
                    leading-icon="i-lucide-arrow-left"
                    :ui="{
                      base: 'justify-center'
                    }"
                    @click="invoiceStore.prevStep()"
                  >
                    Anterior
                  </UButton>
                  <div v-else />

                  <UButton
                    v-if="activeStep < 5"
                    color="neutral"
                    trailing-icon="i-lucide-arrow-right"
                    :ui="{
                      base: 'justify-center'
                    }"
                    @click="invoiceStore.nextStep()"
                  >
                    Siguiente
                  </UButton>
                  <UButton
                    v-else
                    color="primary"
                    icon="i-lucide-file-text"
                    :ui="{
                      base: 'justify-center'
                    }"
                    @click="invoiceStore.downloadPDF()"
                  >
                    Descargar PDF
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #paneR>
          <div
            class="overflow-y-auto h-full bg-gray-100 dark:bg-gray-950 p-8"
            style="background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px); background-size: 20px 20px;"
          >
            <div class="sticky top-0 bg-transparent pb-4 mb-4 z-10">
              <h2 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Vista Previa
              </h2>
            </div>
            <div class="flex justify-center">
              <iframe
                :key="previewKey"
                :src="previewUrl"
                class="w-full max-w-4xl border-0 rounded-lg bg-white shadow-lg"
                style="height: calc(100vh - 200px); min-height: 800px;"
              />
            </div>
          </div>
        </template>
      </SplitPane>
      <template #fallback>
        <div class="flex h-full items-center justify-center">
          <div class="text-center">
            <div class="animate-pulse space-y-4">
              <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto" />
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto" />
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.split-pane-wrapper {
  position: relative;
  height: 100%;
}
</style>
