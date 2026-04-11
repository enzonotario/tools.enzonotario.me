<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import '~/assets/css/vue-json-pretty-enhanced.css'
import { Formatter } from 'fracturedjsonjs'
import { parseJSON } from 'graceful-json'
import CodeHighlight from './CodeHighlight.vue'

interface Props {
  input: string
  sortKeys: boolean
  useFractured?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  useFractured: true
})

const formatter = new Formatter()

const emit = defineEmits<{
  'update:output': [value: string]
  'update:error': [value: string | null]
}>()

const colorMode = useColorMode()

const parsedJsonList = ref<unknown[]>([])
const error = ref<string | null>(null)

const jsonTheme = computed(() => {
  return colorMode.value === 'dark' ? 'dark' : 'light'
})

const parseJson = () => {
  error.value = null
  if (!props.input.trim()) {
    emit('update:output', '')
    parsedJsonList.value = []
    emit('update:error', null)
    return
  }

  try {
    const results = parseJSON(props.input)
    if (results.length === 0) {
      error.value = 'No valid JSON found'
      emit('update:output', '')
      parsedJsonList.value = []
      emit('update:error', error.value)
      return
    }
    parsedJsonList.value = results
    updateOutputJson()
    emit('update:error', null)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid JSON'
    emit('update:output', '')
    parsedJsonList.value = []
    emit('update:error', error.value)
  }
}

const updateOutputJson = () => {
  if (parsedJsonList.value.length === 0) {
    emit('update:output', '')
    return
  }
  const outputs = sortedJsonList.value.map((json) => {
    if (props.useFractured) {
      return formatter.Serialize(json) ?? ''
    } else {
      return JSON.stringify(json, null, 2)
    }
  })
  emit('update:output', outputs.join('\n\n'))
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

const sortedJsonList = computed(() => {
  if (!props.sortKeys) {
    return parsedJsonList.value
  }
  return parsedJsonList.value.map(sortObjectKeys)
})

const formattedDataList = computed(() => {
  return sortedJsonList.value as (string | number | boolean | unknown[] | Record<string, unknown> | null)[]
})

const fracturedOutputList = computed((): string[] => {
  if (!props.useFractured) {
    return []
  }
  return sortedJsonList.value.map(json => formatter.Serialize(json) ?? '')
})

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
      v-if="parsedJsonList.length === 0 && !error"
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
    <template v-if="sortedJsonList.length > 0 && !error">
      <div
        v-for="(json, index) in sortedJsonList"
        :key="index"
        :class="{ 'border-t border-gray-200 dark:border-gray-700': index > 0 }"
      >
        <div
          v-if="sortedJsonList.length > 1"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-xs text-muted"
        >
          JSON {{ index + 1 }}
        </div>
        <CodeHighlight
          v-if="useFractured"
          :code="fracturedOutputList[index] ?? ''"
          language="json"
        />
        <VueJsonPretty
          v-else
          :data="formattedDataList[index]"
          :deep="10"
          :theme="jsonTheme"
          class="p-4"
        />
      </div>
    </template>
  </div>
</template>
