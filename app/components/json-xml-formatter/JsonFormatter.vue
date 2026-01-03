<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import '~/assets/css/vue-json-pretty-enhanced.css'
import { Formatter } from 'fracturedjsonjs'
import CodeHighlight from './CodeHighlight.vue'

interface Props {
  input: string
  sortKeys: boolean
  useFractured?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  useFractured: true
})

// Create formatter instance with default options
const formatter = new Formatter()

const emit = defineEmits<{
  'update:output': [value: string]
  'update:error': [value: string | null]
}>()

const colorMode = useColorMode()

const parsedJson = ref<unknown>(null)
const error = ref<string | null>(null)

const jsonTheme = computed(() => {
  return colorMode.value === 'dark' ? 'dark' : 'light'
})

const parseJson = () => {
  error.value = null
  if (!props.input.trim()) {
    emit('update:output', '')
    parsedJson.value = null
    emit('update:error', null)
    return
  }

  try {
    const parsed = JSON.parse(props.input)
    parsedJson.value = parsed
    updateOutputJson()
    emit('update:error', null)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid JSON'
    emit('update:output', '')
    parsedJson.value = null
    emit('update:error', error.value)
  }
}

const updateOutputJson = () => {
  if (!parsedJson.value) {
    emit('update:output', '')
    return
  }
  const jsonToFormat = props.sortKeys ? sortedJson.value : parsedJson.value

  if (props.useFractured) {
    const formatted = formatter.Serialize(jsonToFormat)
    emit('update:output', formatted)
  } else {
    const formatted = JSON.stringify(jsonToFormat, null, 2)
    emit('update:output', formatted)
  }
}

const sortObjectKeys = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObjectKeys((obj as Record<string, unknown>)[key])
        return result
      }, {} as Record<string, unknown>)
  }
  return obj
}

const sortedJson = computed(() => {
  if (!parsedJson.value || !props.sortKeys) {
    return parsedJson.value
  }
  return sortObjectKeys(parsedJson.value)
})

const formattedData = computed(() => {
  return sortedJson.value as string | number | boolean | unknown[] | Record<string, unknown> | null
})

const fracturedOutput = computed(() => {
  if (!sortedJson.value || !props.useFractured) {
    return ''
  }
  return formatter.Serialize(sortedJson.value)
})

// Auto-parse on input change with debounce
let parseTimeout: ReturnType<typeof setTimeout>
watch(() => props.input, () => {
  clearTimeout(parseTimeout)
  parseTimeout = setTimeout(() => {
    parseJson()
  }, 300)
}, { immediate: true })

watch(() => props.sortKeys, () => {
  updateOutputJson()
})

watch(() => props.useFractured, () => {
  updateOutputJson()
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 overflow-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
    <div
      v-if="!parsedJson && !error"
      class="text-muted text-sm flex items-center justify-center h-full"
    >
      {{ $t('Formatted JSON will appear here...') }}
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
    <CodeHighlight
      v-if="sortedJson && !error && useFractured"
      :code="fracturedOutput"
      language="json"
    />
    <VueJsonPretty
      v-else-if="sortedJson && !error && !useFractured"
      :data="formattedData"
      :deep="10"
      :theme="jsonTheme"
      class="p-4"
    />
  </div>
</template>
