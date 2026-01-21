<script setup lang="ts">
import JsonFormatter from '~/components/json-xml-formatter/JsonFormatter.vue'
import XmlFormatter from '~/components/json-xml-formatter/XmlFormatter.vue'
import CodeHighlight from '~/components/json-xml-formatter/CodeHighlight.vue'
import MultiFormatOutput from '~/components/json-xml-formatter/MultiFormatOutput.vue'
import { toXML } from 'jstoxml'
import xml2json from '@hendt/xml2json'
import yaml from 'js-yaml'
import * as TOML from 'smol-toml'
import { parseJSON } from 'graceful-json'

type FormatType = 'json' | 'xml' | 'yaml' | 'toml'
type InputFormatType = FormatType | 'auto-detect'

const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dashboard'
})

const input = ref('')
const output = ref('')
const error = ref<string | null>(null)
const sortKeys = ref(false)
const outputFormat = ref<FormatType>('json')
const isMinified = ref(false)
const inputFormat = ref<InputFormatType>('auto-detect')
const isManualSelection = ref(false)
const detectedFormat = ref<FormatType>('json')
const useFracturedJson = ref(true)
const parsedJsonObjects = ref<unknown[]>([])

const detectFormat = (content: string): FormatType => {
  if (!content.trim()) {
    parsedJsonObjects.value = []
    return 'json'
  }

  const trimmed = content.trim()

  if (trimmed.startsWith('<') && trimmed.includes('>')) {
    parsedJsonObjects.value = []
    return 'xml'
  }

  const jsonResults = parseJSON(trimmed)
  if (jsonResults.length > 0) {
    parsedJsonObjects.value = jsonResults
    return 'json'
  }

  parsedJsonObjects.value = []

  if (trimmed.match(/^\[.+\]$|^[\w-]+\s*=\s*.+/m)) {
    try {
      TOML.parse(trimmed)
      return 'toml'
    } catch {
    }
  }

  try {
    yaml.load(trimmed)
    return 'yaml'
  } catch {
  }

  return 'json'
}

const placeholder = computed(() => {
  if (inputFormat.value === 'auto-detect') {
    return t('Paste your content here')
  }
  const formats: Record<FormatType, string> = {
    json: t('Paste your JSON here'),
    xml: t('Paste your XML here'),
    yaml: t('Paste your YAML here'),
    toml: t('Paste your TOML here')
  }
  return formats[inputFormat.value] || t('Paste your content here')
})

const currentType = computed(() => {
  if (inputFormat.value === 'auto-detect') {
    return detectedFormat.value
  }
  return inputFormat.value
})

// Auto-select output format based on input type
watch(currentType, (newType) => {
  if (newType) {
    outputFormat.value = newType
  }
}, { immediate: true })

const convertToJson = async (content: string, fromFormat: FormatType): Promise<unknown> => {
  switch (fromFormat) {
    case 'json':
      return JSON.parse(content)
    case 'xml':
      return xml2json(content)
    case 'yaml':
      return yaml.load(content)
    case 'toml':
      return TOML.parse(content)
  }
}

const convertFromJson = (jsonObj: unknown, toFormat: FormatType): string => {
  switch (toFormat) {
    case 'json':
      return JSON.stringify(jsonObj, null, 2)
    case 'xml':
      return toXML(jsonObj, { header: true, indent: '  ' })
    case 'yaml':
      return yaml.dump(jsonObj, { indent: 2, lineWidth: -1 })
    case 'toml':
      return TOML.stringify(jsonObj)
  }
}

const convertFormat = async (content: string, from: FormatType, to: FormatType): Promise<string | null> => {
  if (!import.meta.client) return null
  try {
    const jsonObj = await convertToJson(content, from)
    return convertFromJson(jsonObj, to)
  } catch (e) {
    console.error(`Error converting ${from} to ${to}:`, e)
    return null
  }
}

const minifyContent = (content: string, format: FormatType): string | null => {
  try {
    switch (format) {
      case 'json': {
        const jsonObj = JSON.parse(content)
        return JSON.stringify(jsonObj)
      }
      case 'xml':
        return content.replace(/>\s+</g, '><').trim()
      case 'yaml': {
        const obj = yaml.load(content)
        return yaml.dump(obj, { flowLevel: 0, lineWidth: -1 })
      }
      case 'toml': {
        const obj = TOML.parse(content)
        return TOML.stringify(obj)
      }
    }
  } catch {
    return null
  }
}

const convertedOutput = ref<string>('')
const convertedOutputList = ref<string[]>([])

watch([outputFormat, input, currentType], async () => {
  if (!input.value.trim()) {
    convertedOutput.value = ''
    convertedOutputList.value = []
    return
  }

  if (outputFormat.value !== currentType.value) {
    if (currentType.value === 'json' && parsedJsonObjects.value.length > 0) {
      const results: string[] = []
      for (const jsonObj of parsedJsonObjects.value) {
        try {
          const converted = convertFromJson(jsonObj, outputFormat.value)
          results.push(converted)
        } catch {
        }
      }
      convertedOutputList.value = results
      convertedOutput.value = results.join('\n\n')
    } else {
      const converted = await convertFormat(input.value, currentType.value, outputFormat.value)
      convertedOutput.value = converted || ''
      convertedOutputList.value = converted ? [converted] : []
    }
  } else {
    convertedOutput.value = ''
    convertedOutputList.value = []
  }
}, { immediate: true })

const finalOutput = computed(() => {
  if (!input.value.trim()) return ''

  let result = ''

  if (outputFormat.value === currentType.value) {
    result = output.value
  } else {
    result = convertedOutput.value
  }

  if (isMinified.value && result) {
    const minified = minifyContent(result, outputFormat.value)
    return minified || result
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

const skipConversion = ref(false)

// Detect format when input changes
watch(input, (newInput) => {
  if (inputFormat.value === 'auto-detect') {
    detectedFormat.value = detectFormat(newInput)
  }
  // Reset to auto-detect when input changes (unless manually selected)
  if (newInput.trim() && isManualSelection.value) {
    isManualSelection.value = false
    inputFormat.value = 'auto-detect'
    detectedFormat.value = detectFormat(newInput)
  }

  // Clear error when input changes - will be re-evaluated by formatters
  if (error.value) {
    error.value = null
  }
})

// Handle manual format selection
watch(inputFormat, async (newFormat, oldFormat) => {
  if (newFormat === 'auto-detect') {
    detectedFormat.value = detectFormat(input.value)
    isManualSelection.value = false
    return
  }

  // Mark as manual selection only if user explicitly changed it
  if (oldFormat !== newFormat) {
    isManualSelection.value = true
  }

  if (!input.value.trim() || newFormat === oldFormat || skipConversion.value) return

  skipConversion.value = true
  try {
    const actualOldFormat: FormatType = oldFormat === 'auto-detect' ? detectedFormat.value : oldFormat as FormatType
    const converted = await convertFormat(input.value, actualOldFormat, newFormat as FormatType)
    if (converted) {
      input.value = converted
    }
  } catch (e) {
    console.error('Error converting input format:', e)
  } finally {
    setTimeout(() => {
      skipConversion.value = false
    }, 100)
  }
})

// Initial format detection
onMounted(() => {
  if (input.value.trim() && inputFormat.value === 'auto-detect') {
    detectedFormat.value = detectFormat(input.value)
  }
})
</script>

<template>
  <div class="w-full h-full split-pane-wrapper">
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
                <span class="text-sm text-muted">{{ $t('Input format') }}:</span>
                <USelectMenu
                  v-model="inputFormat"
                  :items="[
                    { label: $t('Auto-detect'), value: 'auto-detect' },
                    { label: 'JSON', value: 'json' },
                    { label: 'XML', value: 'xml' },
                    { label: 'YAML', value: 'yaml' },
                    { label: 'TOML', value: 'toml' }
                  ]"
                  value-key="value"
                  label-key="label"
                  size="sm"
                />

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
                <UButton
                  size="sm"
                  color="primary"
                  icon="i-lucide-copy"
                  :disabled="!finalOutput && !output"
                  @click="copyToClipboard"
                >
                  {{ $t('Copy') }}
                </UButton>

                <span class="text-sm text-muted">{{ $t('Output format') }}:</span>
                <USelectMenu
                  v-model="outputFormat"
                  :items="[
                    { label: 'JSON', value: 'json' },
                    { label: 'XML', value: 'xml' },
                    { label: 'YAML', value: 'yaml' },
                    { label: 'TOML', value: 'toml' }
                  ]"
                  value-key="value"
                  label-key="label"
                  size="sm"
                  :disabled="!currentType"
                />
                <UFormField
                  :label="$t('Minified')"
                  orientation="horizontal"
                  :disabled="!finalOutput && !output"
                >
                  <USwitch
                    v-model="isMinified"
                  />
                </UFormField>

                <UFormField
                  v-if="inputFormat === 'json' || outputFormat === 'json'"
                  :label="$t('Sort keys')"
                  orientation="horizontal"
                  :disabled="!finalOutput && !output"
                >
                  <USwitch v-model="sortKeys" />
                </UFormField>

                <UFormField
                  v-if="(inputFormat === 'json' || outputFormat === 'json') && !isMinified"
                  :label="$t('Fractured JSON')"
                  orientation="horizontal"
                  :disabled="!finalOutput && !output"
                >
                  <USwitch v-model="useFracturedJson" />
                </UFormField>
              </div>
            </div>
            <div class="flex-1 flex flex-col min-h-0">
              <div
                v-if="isMinified"
                class="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <CodeHighlight
                  :code="finalOutput"
                  :language="outputFormat"
                  :word-wrap="true"
                />
              </div>
              <template v-else>
                <template v-if="outputFormat === currentType">
                  <JsonFormatter
                    v-if="outputFormat === 'json'"
                    :input="input"
                    :sort-keys="sortKeys"
                    :use-fractured="useFracturedJson"
                    @update:output="handleOutputUpdate"
                    @update:error="handleErrorUpdate"
                  />
                  <XmlFormatter
                    v-else-if="outputFormat === 'xml'"
                    :input="input"
                    @update:output="handleOutputUpdate"
                    @update:error="handleErrorUpdate"
                  />
                  <div
                    v-else
                    class="flex-1 flex flex-col min-h-0 overflow-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800"
                  >
                    <CodeHighlight
                      :code="input"
                      :language="outputFormat"
                    />
                  </div>
                </template>
                <template v-else-if="convertedOutputList.length > 0">
                  <JsonFormatter
                    v-if="outputFormat === 'json'"
                    :input="finalOutput"
                    :sort-keys="sortKeys"
                    :use-fractured="useFracturedJson"
                    @update:output="() => {}"
                    @update:error="() => {}"
                  />
                  <MultiFormatOutput
                    v-else
                    :outputs="convertedOutputList"
                    :format="outputFormat"
                    :label="outputFormat.toUpperCase()"
                  />
                </template>
                <div
                  v-else
                  class="flex-1 flex flex-col min-h-0 overflow-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800 items-center justify-center"
                >
                  <p class="text-muted text-sm">
                    {{ $t('Paste your content here to get started') }}
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
