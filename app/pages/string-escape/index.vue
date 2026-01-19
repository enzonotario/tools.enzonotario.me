<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
const toast = useToast()

type EscapeType = 'json' | 'html' | 'url' | 'base64' | 'unicode' | 'backslash'

const escapeTypes = computed(() => [
  { value: 'json', label: t('JSON String'), description: t('escapeDescJson') },
  { value: 'html', label: t('HTML Entities'), description: t('escapeDescHtml') },
  { value: 'url', label: t('URL Encoding'), description: t('escapeDescUrl') },
  { value: 'base64', label: t('Base64'), description: t('escapeDescBase64') },
  { value: 'unicode', label: t('Unicode'), description: t('escapeDescUnicode') },
  { value: 'backslash', label: t('Backslash'), description: t('escapeDescBackslash') }
])

const selectedType = ref<EscapeType>('json')
const inputText = ref('')
const outputText = ref('')

const escapeJson = (str: string): string => {
  return JSON.stringify(str).slice(1, -1)
}

const unescapeJson = (str: string): string => {
  try {
    return JSON.parse(`"${str}"`)
  } catch {
    try {
      return JSON.parse(str)
    } catch {
      return str
    }
  }
}

const escapeHtml = (str: string): string => {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }
  return str.replace(/[&<>"'`=/]/g, char => htmlEntities[char] || char)
}

const unescapeHtml = (str: string): string => {
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': '\'',
    '&#x27;': '\'',
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
    '&apos;': '\'',
    '&nbsp;': ' '
  }
  return str.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#39|#x27|#x2F|#x60|#x3D);/g, entity => htmlEntities[entity] || entity)
}

const escapeUrl = (str: string): string => {
  return encodeURIComponent(str)
}

const unescapeUrl = (str: string): string => {
  try {
    return decodeURIComponent(str)
  } catch {
    return str
  }
}

const escapeBase64 = (str: string): string => {
  try {
    const bytes = new TextEncoder().encode(str)
    const binString = Array.from(bytes, byte => String.fromCodePoint(byte)).join('')
    return btoa(binString)
  } catch {
    return str
  }
}

const unescapeBase64 = (str: string): string => {
  try {
    const binString = atob(str)
    const bytes = Uint8Array.from(binString, char => char.codePointAt(0) ?? 0)
    return new TextDecoder().decode(bytes)
  } catch {
    return str
  }
}

const escapeUnicode = (str: string): string => {
  return str.split('').map((char) => {
    const code = char.charCodeAt(0)
    if (code > 127) {
      return `\\u${code.toString(16).padStart(4, '0')}`
    }
    return char
  }).join('')
}

const unescapeUnicode = (str: string): string => {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    return String.fromCharCode(Number.parseInt(hex, 16))
  })
}

const escapeBackslash = (str: string): string => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

const unescapeBackslash = (str: string): string => {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
}

const doEscape = () => {
  if (!inputText.value) return

  switch (selectedType.value) {
    case 'json':
      outputText.value = escapeJson(inputText.value)
      break
    case 'html':
      outputText.value = escapeHtml(inputText.value)
      break
    case 'url':
      outputText.value = escapeUrl(inputText.value)
      break
    case 'base64':
      outputText.value = escapeBase64(inputText.value)
      break
    case 'unicode':
      outputText.value = escapeUnicode(inputText.value)
      break
    case 'backslash':
      outputText.value = escapeBackslash(inputText.value)
      break
  }
}

const doUnescape = () => {
  if (!inputText.value) return

  switch (selectedType.value) {
    case 'json':
      outputText.value = unescapeJson(inputText.value)
      break
    case 'html':
      outputText.value = unescapeHtml(inputText.value)
      break
    case 'url':
      outputText.value = unescapeUrl(inputText.value)
      break
    case 'base64':
      outputText.value = unescapeBase64(inputText.value)
      break
    case 'unicode':
      outputText.value = unescapeUnicode(inputText.value)
      break
    case 'backslash':
      outputText.value = unescapeBackslash(inputText.value)
      break
  }
}

const copyToClipboard = async () => {
  if (!outputText.value) return

  try {
    await navigator.clipboard.writeText(outputText.value)
    toast.add({
      title: t('Copied'),
      description: t('Copied to clipboard'),
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch (e) {
    console.error('Failed to copy:', e)
    toast.add({
      title: t('Copy failed'),
      description: t('Failed to copy to clipboard'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
}

const swapTexts = () => {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
}
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <Teleport to="#header-actions-portal">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted">{{ $t('Escape Type') }}:</span>
          <USelectMenu
            v-model="selectedType"
            :items="escapeTypes"
            value-key="value"
            label-key="label"
            size="sm"
          />
        </div>

        <UButton
          color="primary"
          size="sm"
          icon="i-lucide-arrow-right"
          @click="doEscape"
        >
          {{ $t('Escape') }}
        </UButton>

        <UButton
          color="primary"
          variant="outline"
          size="sm"
          icon="i-lucide-arrow-left"
          @click="doUnescape"
        >
          {{ $t('Unescape') }}
        </UButton>

        <UButton
          variant="outline"
          size="sm"
          color="neutral"
          icon="i-lucide-arrow-left-right"
          @click="swapTexts"
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

        <UButton
          size="sm"
          color="primary"
          icon="i-lucide-copy"
          :disabled="!outputText"
          @click="copyToClipboard"
        >
          {{ $t('Copy') }}
        </UButton>
      </div>
    </Teleport>

    <ClientOnly>
      <SplitPane
        split="vertical"
        :min-percent="20"
        :default-percent="50"
        storage-key="string-escape"
        class="h-full"
      >
        <template #paneL>
          <div class="flex flex-col h-full p-1 space-y-2">
            <div class="shrink-0">
              <span class="text-sm font-medium">{{ $t('Input') }}</span>
            </div>
            <div class="flex-1 flex flex-col min-h-0">
              <UTextarea
                v-model="inputText"
                :placeholder="$t('Paste your text here...')"
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
          <div class="flex flex-col h-full p-1 space-y-2">
            <div class="shrink-0">
              <span class="text-sm font-medium">{{ $t('Output') }}</span>
            </div>
            <div class="flex-1 flex flex-col min-h-0">
              <UTextarea
                v-model="outputText"
                readonly
                :placeholder="$t('Result will appear here...')"
                class="font-mono text-sm flex-1"
                :ui="{
                  base: 'block w-full h-full resize-none'
                }"
              />
            </div>
          </div>
        </template>
      </SplitPane>

      <template #fallback>
        <div class="flex gap-6 h-full">
          <div class="flex-1 flex flex-col space-y-2">
            <span class="text-sm font-medium">{{ $t('Input') }}</span>
            <div class="flex-1 flex flex-col min-h-0">
              <UTextarea
                v-model="inputText"
                :placeholder="$t('Paste your text here...')"
                class="font-mono text-sm flex-1"
                :ui="{
                  base: 'block w-full h-full resize-none'
                }"
              />
            </div>
          </div>
          <div class="flex-1 flex flex-col space-y-2">
            <span class="text-sm font-medium">{{ $t('Output') }}</span>
            <div class="flex-1 flex flex-col min-h-0">
              <UTextarea
                v-model="outputText"
                readonly
                :placeholder="$t('Result will appear here...')"
                class="font-mono text-sm flex-1"
                :ui="{
                  base: 'block w-full h-full resize-none'
                }"
              />
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
