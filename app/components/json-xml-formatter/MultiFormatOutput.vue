<script setup lang="ts">
import CodeHighlight from './CodeHighlight.vue'

interface Props {
  outputs: string[]
  format: 'json' | 'xml' | 'yaml' | 'toml'
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Output'
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 overflow-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
    <div
      v-if="outputs.length === 0"
      class="text-muted text-sm flex items-center justify-center h-full"
    >
      {{ $t('Formatted output will appear here...') }}
    </div>
    <template v-else>
      <div
        v-for="(output, index) in outputs"
        :key="index"
        :class="{ 'border-t border-gray-200 dark:border-gray-700': index > 0 }"
      >
        <div
          v-if="outputs.length > 1"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-xs text-muted"
        >
          {{ label }} {{ index + 1 }}
        </div>
        <CodeHighlight
          :code="output"
          :language="format"
        />
      </div>
    </template>
  </div>
</template>
