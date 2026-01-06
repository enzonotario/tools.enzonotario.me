<script setup lang="ts">
import { CodeDiff } from 'v-code-diff'

type FormatType = 'text' | 'json' | 'xml' | 'yaml' | 'toml' | 'javascript' | 'typescript' | 'html' | 'css'

type InputFormatType = FormatType | 'auto-detect'

const { t } = useI18n()
const colorMode = useColorMode()

definePageMeta({
  layout: 'dashboard'
})

const leftInput = ref('')
const rightInput = ref('')
const inputFormat = ref<InputFormatType>('auto-detect')
const detectedFormat = ref<FormatType>('text')
const diffMode = ref<'split' | 'unified'>('split')

// Function to detect format from content
const detectFormat = (content: string): FormatType => {
  if (!content.trim()) return 'text'

  const trimmed = content.trim()

  // Try JSON
  try {
    JSON.parse(trimmed)
    return 'json'
  } catch {
    // Not JSON, continue detection
  }

  // Try XML/HTML
  if (trimmed.startsWith('<') && trimmed.includes('>')) {
    if (trimmed.toLowerCase().includes('<!doctype html') || trimmed.toLowerCase().includes('<html')) {
      return 'html'
    }
    return 'xml'
  }

  // Try to detect JavaScript/TypeScript
  if (trimmed.match(/^(import|export|const|let|var|function|class)\s/)) {
    if (trimmed.includes(': ') && (trimmed.includes('interface') || trimmed.includes('type '))) {
      return 'typescript'
    }
    return 'javascript'
  }

  // Try CSS
  if (trimmed.match(/^[.#]?[\w-]+\s*\{/) || (trimmed.includes('{') && trimmed.includes('}') && trimmed.includes(':'))) {
    return 'css'
  }

  // Try TOML
  if (trimmed.match(/^\[.+\]$|^[\w-]+\s*=\s*.+/m)) {
    return 'toml'
  }

  // Try YAML (less strict, should be last)
  if (trimmed.match(/^[\w-]+:\s*.+/m) || trimmed.includes('- ')) {
    return 'yaml'
  }

  return 'text'
}

const currentFormat = computed(() => {
  if (inputFormat.value === 'auto-detect') {
    return detectedFormat.value
  }
  return inputFormat.value
})

const placeholder = computed(() => {
  if (inputFormat.value === 'auto-detect') {
    return t('Paste your content here')
  }
  const formats: Record<FormatType, string> = {
    text: t('Paste your text here'),
    json: t('Paste your JSON here'),
    xml: t('Paste your XML here'),
    yaml: t('Paste your YAML here'),
    toml: t('Paste your TOML here'),
    javascript: t('Paste your JavaScript here'),
    typescript: t('Paste your TypeScript here'),
    html: t('Paste your HTML here'),
    css: t('Paste your CSS here')
  }
  return formats[inputFormat.value] || t('Paste your content here')
})

// Detect format when input changes
watch([leftInput, rightInput], ([left, right]) => {
  if (inputFormat.value === 'auto-detect') {
    // Detect from the longer input or left if equal
    const contentToDetect = left.length >= right.length ? left : right
    detectedFormat.value = detectFormat(contentToDetect || left || right)
  }
})

const clearAll = () => {
  leftInput.value = ''
  rightInput.value = ''
}

const swapInputs = () => {
  const temp = leftInput.value
  leftInput.value = rightInput.value
  rightInput.value = temp
}

// Mapping for language names
// v-code-diff only supports: plaintext, HTML/XML, JavaScript, JSON, YAML, Python, Java, Bash, SQL
const languageMap: Record<FormatType, string> = {
  text: 'plaintext',
  json: 'json',
  xml: 'xml',
  yaml: 'yaml',
  toml: 'plaintext', // toml not supported, fallback to plaintext
  javascript: 'javascript',
  typescript: 'javascript', // typescript not supported, fallback to javascript
  html: 'xml', // html maps to xml in v-code-diff
  css: 'plaintext' // css not supported, fallback to plaintext
}

const diffLanguage = computed(() => {
  return languageMap[currentFormat.value] || 'plaintext'
})

const outputFormat = computed(() => {
  return diffMode.value === 'split' ? 'side-by-side' : 'line-by-line'
})

const currentTheme = computed(() => {
  return colorMode.value === 'dark' ? 'dark' : 'light'
})
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="shrink-0">
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted">{{ $t('Format') }}:</span>
          <USelectMenu
            v-model="inputFormat"
            :items="[
              { label: $t('Auto-detect'), value: 'auto-detect' },
              { label: 'Text', value: 'text' },
              { label: 'JSON', value: 'json' },
              { label: 'XML', value: 'xml' },
              { label: 'HTML', value: 'html' },
              { label: 'CSS', value: 'css' },
              { label: 'YAML', value: 'yaml' },
              { label: 'TOML', value: 'toml' },
              { label: 'JavaScript', value: 'javascript' },
              { label: 'TypeScript', value: 'typescript' }
            ]"
            value-key="value"
            label-key="label"
            size="sm"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-muted">{{ $t('View') }}:</span>
          <USelectMenu
            v-model="diffMode"
            :items="[
              { label: $t('Split View'), value: 'split' },
              { label: $t('Unified View'), value: 'unified' }
            ]"
            value-key="value"
            label-key="label"
            size="sm"
          />
        </div>

        <UButton
          variant="outline"
          size="sm"
          color="neutral"
          icon="i-lucide-arrow-left-right"
          @click="swapInputs"
        >
          {{ $t('Swap') }}
        </UButton>

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

    <ClientOnly>
      <SplitPane
        split="horizontal"
        :min-percent="20"
        :default-percent="35"
        storage-key="text-diff-horizontal"
        class="flex-1 min-h-0"
      >
        <template #paneL>
          <SplitPane
            split="vertical"
            :min-percent="20"
            :default-percent="50"
            storage-key="text-diff-vertical"
            class="h-full"
          >
            <template #paneL>
              <div class="flex flex-col h-full p-1">
                <div>
                  <h3 class="text-sm font-semibold text-highlighted">
                    {{ $t('Original') }}
                  </h3>
                </div>
                <div class="flex-1 flex flex-col min-h-0">
                  <UTextarea
                    v-model="leftInput"
                    :placeholder="placeholder"
                    class="font-mono text-sm flex-1"
                    :ui="{
                      base: 'block w-full h-full resize-none'
                    }"
                    autofocus
                  />
                </div>
              </div>
            </template>

            <template #paneR>
              <div class="flex flex-col h-full p-1">
                <div>
                  <h3 class="text-sm font-semibold text-highlighted">
                    {{ $t('Modified') }}
                  </h3>
                </div>
                <div class="flex-1 flex flex-col min-h-0">
                  <UTextarea
                    v-model="rightInput"
                    :placeholder="placeholder"
                    class="font-mono text-sm flex-1"
                    :ui="{
                      base: 'block w-full h-full resize-none'
                    }"
                  />
                </div>
              </div>
            </template>
          </SplitPane>
        </template>

        <template #paneR>
          <div class="flex flex-col h-full">
            <div class="shrink-0">
              <h3 class="text-sm font-semibold text-highlighted">
                {{ $t('Differences') }}
              </h3>
            </div>
            <div class="flex-1 min-h-0 overflow-auto">
              <template v-if="leftInput || rightInput">
                <CodeDiff
                  :old-string="leftInput"
                  :new-string="rightInput"
                  :output-format="outputFormat"
                  :language="diffLanguage"
                  :theme="currentTheme"
                  :context="10"
                  class="!my-0"
                />
              </template>
              <template v-else>
                <div class="flex items-center justify-center h-full">
                  <p class="text-muted text-sm">
                    {{ $t('Enter text in both panels to see differences') }}
                  </p>
                </div>
              </template>
            </div>
          </div>
        </template>
      </SplitPane>

      <template #fallback>
        <div class="flex-1 flex items-center justify-center">
          <div class="text-center py-12">
            <p class="text-muted text-sm">
              {{ $t('Loading...') }}
            </p>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
