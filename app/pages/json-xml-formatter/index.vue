<script setup lang="ts">
import JsonFormatter from '~/components/json-xml-formatter/JsonFormatter.vue'
import XmlFormatter from '~/components/json-xml-formatter/XmlFormatter.vue'
import { toXML } from 'jstoxml'
import xml2json from '@hendt/xml2json'

const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dashboard'
})

const input = ref('')
const output = ref('')
const error = ref<string | null>(null)
const sortKeys = ref(false)
const outputFormat = ref<'json' | 'xml'>('json')
const isMinified = ref(false)
const inputFormat = ref<'json' | 'xml'>('json')

const placeholder = computed(() => {
  if (inputFormat.value === 'json') {
    return t('Paste your JSON here')
  }
  if (inputFormat.value === 'xml') {
    return t('Paste your XML here')
  }
  return t('Paste your JSON or XML here')
})

const currentType = computed(() => {
  return inputFormat.value
})

// Auto-select output format based on input type
watch(currentType, (newType) => {
  if (newType) {
    outputFormat.value = newType
  }
}, { immediate: true })

// Convert JSON to XML using jstoxml
const convertJsonToXml = async (jsonString: string): Promise<string | null> => {
  if (!import.meta.client) return null
  try {
    const jsonObj = JSON.parse(jsonString)
    const xml = toXML(jsonObj, {
      header: true,
      indent: '  '
    })
    return xml
  } catch (e) {
    console.error('Error converting JSON to XML:', e)
    return null
  }
}

// Convert XML to JSON using xml2json
const convertXmlToJson = async (xmlString: string): Promise<string | null> => {
  if (!import.meta.client) return null
  try {
    const jsonObj = xml2json(xmlString)
    return JSON.stringify(jsonObj, null, 2)
  } catch (e) {
    console.error('Error converting XML to JSON:', e)
    return null
  }
}

// Minify JSON
const minifyJson = (jsonString: string): string | null => {
  try {
    const jsonObj = JSON.parse(jsonString)
    return JSON.stringify(jsonObj)
  } catch (e) {
    return null
  }
}

// Minify XML
const minifyXml = (xmlString: string): string => {
  return xmlString.replace(/>\s+</g, '><').trim()
}

// Store converted output
const convertedOutput = ref<string>('')

// Watch for changes and perform conversion when needed
watch([outputFormat, input, currentType], async () => {
  if (!input.value.trim()) {
    convertedOutput.value = ''
    return
  }

  // Only convert if output format differs from input type
  if (outputFormat.value !== currentType.value) {
    convertedOutput.value = ''
    if (outputFormat.value === 'xml' && currentType.value === 'json') {
      const converted = await convertJsonToXml(input.value)
      convertedOutput.value = converted || ''
    } else if (outputFormat.value === 'json' && currentType.value === 'xml') {
      const converted = await convertXmlToJson(input.value)
      convertedOutput.value = converted || ''
    }
  } else {
    convertedOutput.value = ''
  }
}, { immediate: true })

// Get the final output based on format and minification settings
const finalOutput = computed(() => {
  if (!input.value.trim()) return ''

  let result = ''

  // If output format matches input type, use the formatted output
  if (outputFormat.value === currentType.value) {
    result = output.value
  } else {
    // Use converted output
    result = convertedOutput.value
  }

  // Minify if requested
  if (isMinified.value && result) {
    if (outputFormat.value === 'json') {
      const minified = minifyJson(result)
      return minified || result
    } else {
      return minifyXml(result)
    }
  }

  return result
})

const copyToClipboard = async () => {
  const textToCopy = finalOutput.value || output.value
  if (!textToCopy) return

  try {
    await navigator.clipboard.writeText(textToCopy)
    toast.add({
      title: t('Copied'),
      description: t('Copied to clipboard'),
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
  } catch (e) {
    console.error('Failed to copy:', e)
    toast.add({
      title: t('Failed to copy'),
      description: t('Failed to copy'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

const clearAll = () => {
  input.value = ''
  output.value = ''
  error.value = null
}

const handleOutputUpdate = (value: string) => {
  output.value = value
}

const handleErrorUpdate = (value: string | null) => {
  error.value = value
}

// Track if we should skip conversion (to avoid loops)
const skipConversion = ref(false)

// Watch inputFormat changes and convert input accordingly
watch(inputFormat, async (newFormat, oldFormat) => {
  if (!input.value.trim() || newFormat === oldFormat || skipConversion.value) return

  skipConversion.value = true
  try {
    if (newFormat === 'xml' && oldFormat === 'json') {
      // Convert current JSON input to XML
      const converted = await convertJsonToXml(input.value)
      if (converted) {
        input.value = converted
      }
    } else if (newFormat === 'json' && oldFormat === 'xml') {
      // Convert current XML input to JSON
      const converted = await convertXmlToJson(input.value)
      if (converted) {
        input.value = converted
      }
    }
  } catch (e) {
    console.error('Error converting input format:', e)
  } finally {
    // Reset skip flag after a short delay
    setTimeout(() => {
      skipConversion.value = false
    }, 100)
  }
})
</script>

<template>
  <div class="w-full h-full split-pane-wrapper">
    <Teleport to="#header-actions-portal">
      <div class="flex items-center gap-2">
        <UButton
          size="sm"
          color="primary"
          icon="i-lucide-copy"
          :disabled="!finalOutput && !output"
          @click="copyToClipboard"
        >
          {{ $t('Copy') }}
        </UButton>

        <div
          v-if="currentType === 'json'"
          class="flex items-center gap-2"
        >
          <USwitch v-model="sortKeys" />
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ $t('Sort keys') }}</span>
        </div>

        <UButton
          variant="outline"
          size="sm"
          color="neutral"
          icon="i-lucide-x"
          @click="clearAll"
        >
          {{ $t('Clear') }}
        </UButton>
      </div>
    </Teleport>

    <ClientOnly>
      <SplitPane
        split="vertical"
        :min-percent="20"
        :default-percent="50"
        storage-key="json-xml-formatter"
        class="h-full"
      >
        <template #paneL>
          <div class="flex flex-col h-full p-1 space-y-2">
            <div class="shrink-0">
              <div class="flex items-center gap-2">
                <USelectMenu
                  v-model="inputFormat"
                  :items="[
                    { label: 'JSON', value: 'json' },
                    { label: 'XML', value: 'xml' }
                  ]"
                  value-key="value"
                  label-key="label"
                  size="sm"
                >
                  <template #label>
                    <span class="text-sm">{{ $t('Input format') }}: {{ inputFormat.toUpperCase() }}</span>
                  </template>
                </USelectMenu>
              </div>
            </div>
            <div class="flex-1 flex flex-col min-h-0">
              <UTextarea
                v-model="input"
                :placeholder="placeholder"
                class="font-mono text-sm flex-1"
                :ui="{
                  base: 'block w-full h-full resize-none'
                }"
                autofocus
              />
            </div>

            <div
              v-if="error"
              class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shrink-0"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-alert-circle"
                  class="size-5 text-red-600 dark:text-red-400"
                />
                <p class="text-sm text-red-600 dark:text-red-400">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>
        </template>

        <template #paneR>
          <div class="flex flex-col h-full p-1 space-y-2">
            <div class="shrink-0">
              <div class="flex items-center gap-3 flex-wrap">
                <USelectMenu
                  v-model="outputFormat"
                  :items="[
                    { label: 'JSON', value: 'json' },
                    { label: 'XML', value: 'xml' }
                  ]"
                  value-key="value"
                  label-key="label"
                  size="sm"
                  :disabled="!currentType"
                >
                  <template #label>
                    <span class="text-sm">{{ $t('Output format') }}: {{ outputFormat.toUpperCase() }}</span>
                  </template>
                </USelectMenu>
                <UFormField
                  :label="$t('Minified')"
                  orientation="horizontal"
                  :disabled="!finalOutput && !output"
                >
                  <USwitch
                    v-model="isMinified"
                  />
                </UFormField>
              </div>
            </div>
            <div class="flex-1 flex flex-col min-h-0">
              <div
                v-if="isMinified"
                class="flex-1 flex flex-col min-h-0"
              >
                <UTextarea
                  :model-value="finalOutput"
                  readonly
                  class="font-mono text-sm flex-1"
                  :ui="{
                    base: 'block w-full h-full resize-none'
                  }"
                />
              </div>
              <template v-else>
                <JsonFormatter
                  v-if="outputFormat === 'json' && currentType === 'json'"
                  :input="input"
                  :sort-keys="sortKeys"
                  @update:output="handleOutputUpdate"
                  @update:error="handleErrorUpdate"
                />
                <XmlFormatter
                  v-else-if="outputFormat === 'xml' && currentType === 'xml'"
                  :input="input"
                  @update:output="handleOutputUpdate"
                  @update:error="handleErrorUpdate"
                />
                <XmlFormatter
                  v-else-if="outputFormat === 'xml' && currentType === 'json' && finalOutput"
                  :input="finalOutput"
                  @update:output="() => {}"
                  @update:error="() => {}"
                />
                <JsonFormatter
                  v-else-if="outputFormat === 'json' && currentType === 'xml' && finalOutput"
                  :input="finalOutput"
                  :sort-keys="sortKeys"
                  @update:output="() => {}"
                  @update:error="() => {}"
                />
                <div
                  v-else
                  class="flex-1 flex flex-col min-h-0 overflow-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800 items-center justify-center"
                >
                  <p class="text-muted text-sm">
                    {{ $t('Paste your JSON or XML here to get started') }}
                  </p>
                </div>
              </template>
            </div>
          </div>
        </template>
      </SplitPane>
      <template #fallback>
        <div class="flex gap-6 h-full">
          <div class="flex-1 flex flex-col space-y-2">
            <div class="flex-1 flex flex-col min-h-0">
              <UTextarea
                v-model="input"
                :placeholder="placeholder"
                class="font-mono text-sm flex-1"
                :ui="{
                  base: 'block w-full h-full resize-none'
                }"
                autofocus
              />
            </div>
          </div>
          <div class="flex-1 flex flex-col space-y-2">
            <div class="flex-1 flex flex-col min-h-0 overflow-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800 items-center justify-center">
              <p class="text-muted text-sm">
                {{ $t('Loading...') }}
              </p>
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
