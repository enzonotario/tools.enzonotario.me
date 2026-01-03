<script setup lang="ts">
import { codeToHtml } from 'shiki'

interface Props {
  code: string
  language?: string
  wordWrap?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'json',
  wordWrap: false
})

const colorMode = useColorMode()

const highlightedCode = ref('')

const highlight = async () => {
  if (!props.code) {
    highlightedCode.value = ''
    return
  }

  try {
    const html = await codeToHtml(props.code, {
      lang: props.language,
      theme: colorMode.value === 'dark' ? 'dark-plus' : 'light-plus'
    })
    highlightedCode.value = html
  } catch (error) {
    console.error('Error highlighting code:', error)
    highlightedCode.value = `<pre><code>${props.code}</code></pre>`
  }
}

// Watch for changes in code, language, or color mode
watch([() => props.code, () => props.language, colorMode], () => {
  highlight()
}, { immediate: true })
</script>

<template>
  <div
    :class="[
      'shiki-container h-full p-4',
      wordWrap ? 'overflow-y-auto' : 'overflow-auto'
    ]"
    v-html="highlightedCode"
  />
</template>

<style scoped>
.shiki-container :deep(pre) {
  margin: 0;
  padding: 0;
  background: transparent !important;
  overflow: visible;
}

.shiki-container :deep(code) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Word wrap styles */
.shiki-container.overflow-y-auto :deep(pre) {
  white-space: pre-wrap;
  word-break: break-all;
}

.shiki-container.overflow-y-auto :deep(code) {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
