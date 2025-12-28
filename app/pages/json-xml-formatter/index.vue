<script setup lang="ts">
import JsonFormatter from '~/components/json-xml-formatter/JsonFormatter.vue'
import XmlFormatter from '~/components/json-xml-formatter/XmlFormatter.vue'

const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dashboard'
})

const input = ref('')
const output = ref('')
const error = ref<string | null>(null)
const sortKeys = ref(false)
const formatType = ref<'json' | 'xml' | 'auto'>('auto')
const detectedType = ref<'json' | 'xml' | null>(null)

const placeholder = computed(() => {
  if (formatType.value === 'json') {
    return t('Paste your JSON here')
  }
  if (formatType.value === 'xml') {
    return t('Paste your XML here')
  }
  return t('Paste your JSON or XML here')
})

const detectFormat = (text: string): 'json' | 'xml' | null => {
  const trimmed = text.trim()
  if (!trimmed) return null

  // Check if it starts with XML-like tags
  if (trimmed.startsWith('<') && trimmed.includes('>')) {
    // Try to parse as XML
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(trimmed, 'text/xml')
      const parseError = xmlDoc.querySelector('parsererror')
      if (!parseError) {
        return 'xml'
      }
    } catch {
      // Not valid XML
    }
  }

  // Try to parse as JSON
  try {
    JSON.parse(trimmed)
    return 'json'
  } catch {
    // Not valid JSON
  }

  // If it starts with <, assume XML even if invalid
  if (trimmed.startsWith('<')) {
    return 'xml'
  }

  return null
}

const currentType = computed(() => {
  if (formatType.value === 'auto') {
    return detectedType.value || 'json'
  }
  return formatType.value
})

const copyToClipboard = async () => {
  if (!output.value) return

  try {
    await navigator.clipboard.writeText(output.value)
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
  detectedType.value = null
}

const handleOutputUpdate = (value: string) => {
  output.value = value
}

const handleErrorUpdate = (value: string | null) => {
  error.value = value
}

// Auto-detect format on input change
watch(input, () => {
  if (formatType.value === 'auto') {
    detectedType.value = detectFormat(input.value)
  }
}, { immediate: true })
</script>

<template>
  <div class="w-full h-full split-pane-wrapper">
    <Teleport to="#header-actions-portal">
      <div class="flex items-center gap-2">
        <UButton
          size="sm"
          color="primary"
          icon="i-lucide-copy"
          :disabled="!output"
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

        <USelectMenu
          v-model="formatType"
          :items="[
            { label: $t('Auto detect'), value: 'auto' },
            { label: 'JSON', value: 'json' },
            { label: 'XML', value: 'xml' }
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
          <div class="flex flex-col h-full p-1">
            <JsonFormatter
              v-if="currentType === 'json'"
              :input="input"
              :sort-keys="sortKeys"
              @update:output="handleOutputUpdate"
              @update:error="handleErrorUpdate"
            />
            <XmlFormatter
              v-else-if="currentType === 'xml'"
              :input="input"
              @update:output="handleOutputUpdate"
              @update:error="handleErrorUpdate"
            />
            <div
              v-else
              class="flex-1 flex flex-col min-h-0 overflow-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800 items-center justify-center"
            >
              <p class="text-muted text-sm">
                {{ $t('Paste your JSON or XML here to get started') }}
              </p>
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
