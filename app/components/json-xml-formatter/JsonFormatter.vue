<script setup lang="ts">
import { DataVisor, type ViewerDisplayMode } from 'data-visor-vue'
import { parseJSON } from 'graceful-json'
import { sortObjectKeysDeep } from '~/utils/jsonViewerSerialize'

interface Props {
  input: string
  sortKeys: boolean
}

const props = defineProps<Props>()

const displayMode = defineModel<ViewerDisplayMode>('displayMode', { default: 'tree' })

const emit = defineEmits<{
  'update:output': [value: string]
  'update:error': [value: string | null]
}>()

const colorMode = useColorMode()

const parsedJsonList = ref<unknown[]>([])
const error = ref<string | null>(null)

const isJsonViewerDark = computed(() => colorMode.value === 'dark')

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
  const outputs = sortedJsonList.value.map(json => JSON.stringify(json, null, 2))
  emit('update:output', outputs.join('\n\n'))
}

const sortedJsonList = computed(() => {
  if (!props.sortKeys) {
    return parsedJsonList.value
  }
  return parsedJsonList.value.map(sortObjectKeysDeep)
})

const prettyJsonStrings = computed(() =>
  sortedJsonList.value.map(json => JSON.stringify(json, null, 2))
)

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
        v-for="(_, index) in sortedJsonList"
        :key="index"
        class="flex-1"
        :class="{ 'border-t border-gray-200 dark:border-gray-700': index > 0 }"
      >
        <div
          v-if="sortedJsonList.length > 1"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-xs text-muted"
        >
          JSON {{ index + 1 }}
        </div>
        <DataVisorHost>
          <DataVisor
            v-model:display-mode="displayMode"
            :data="prettyJsonStrings[index] ?? ''"
            lang="json"
            :is-dark="isJsonViewerDark"
            max-height="100%"
            min-height="0"
            class="h-full flex-1 min-h-0"
          />
        </DataVisorHost>
      </div>
    </template>
  </div>
</template>
