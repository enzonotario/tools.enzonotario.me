<script setup lang="ts">
import { PrettyXml } from 'pretty-xml-vue3'
import 'pretty-xml-vue3/style.css'

interface Props {
  input: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:output': [value: string]
  'update:error': [value: string | null]
}>()

const error = ref<string | null>(null)
const formattedXml = ref<string>('')

const parseXml = () => {
  error.value = null
  if (!props.input.trim()) {
    formattedXml.value = ''
    emit('update:output', '')
    emit('update:error', null)
    return
  }

  try {
    const trimmed = props.input.trim()
    if (!trimmed.startsWith('<')) {
      throw new Error('Invalid XML: must start with <')
    }

    // Try to parse with DOMParser for validation
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(trimmed, 'text/xml')

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      const errorText = parseError.textContent || 'Invalid XML: parsing error'
      throw new Error(errorText)
    }

    // Use the input directly - PrettyXml will format it
    formattedXml.value = trimmed
    emit('update:output', trimmed)
    emit('update:error', null)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid XML'
    formattedXml.value = ''
    emit('update:output', '')
    emit('update:error', error.value)
  }
}

// Auto-parse on input change with debounce
let parseTimeout: ReturnType<typeof setTimeout>
watch(() => props.input, () => {
  clearTimeout(parseTimeout)
  parseTimeout = setTimeout(() => {
    parseXml()
  }, 300)
}, { immediate: true })
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 overflow-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
    <div
      v-if="!formattedXml && !error"
      class="text-muted text-sm flex items-center justify-center h-full"
    >
      {{ $t('Formatted XML will appear here...') }}
    </div>
    <div
      v-if="error"
      class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
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
    <ClientOnly>
      <PrettyXml
        v-if="formattedXml && !error"
        :xml="formattedXml"
        :options="{ shortRecord: true }"
        class="xml-viewer"
      />
      <template #fallback>
        <div class="text-muted text-sm flex items-center justify-center h-full">
          {{ $t('Loading XML viewer...') }}
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.xml-viewer {
  width: 100%;
  overflow: auto;
}
</style>
