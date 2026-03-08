<script setup lang="ts">
import { textToBlockAscii, ASCII_STYLES } from '~/utils/asciiBlockFont'

definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
const toast = useToast()

const inputText = ref('HELLO WORLD')
const styleId = ref<'ansi-shadow' | 'ansi-regular' | 'ansi-compact'>('ansi-shadow')

const asciiOutput = computed(() => {
  const text = inputText.value.trim() || ' '
  return textToBlockAscii(text, { styleId: styleId.value, horizontalLayout: 'fitted' })
})

const currentStyleDesc = computed(() =>
  ASCII_STYLES.find(s => s.id === styleId.value)?.description ?? ''
)

const copyToClipboard = async () => {
  if (!asciiOutput.value) return
  try {
    await navigator.clipboard.writeText(asciiOutput.value)
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
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          {{ $t('asciiArtOptions') }}
        </h3>
      </template>

      <div class="space-y-4">
        <UFormField :label="$t('asciiArtText')">
          <UTextarea
            v-model="inputText"
            :placeholder="$t('asciiArtTextPlaceholder')"
            :rows="3"
            class="font-mono"
            autoresize
          />
        </UFormField>

        <UFormField :label="$t('asciiArtStyle')">
          <USelectMenu
            v-model="styleId"
            :items="ASCII_STYLES.map(s => ({ value: s.id, label: s.name }))"
            value-key="value"
            label-key="label"
          />
        </UFormField>

        <p class="text-sm text-muted">
          {{ currentStyleDesc }}
        </p>
      </div>
    </UCard>

    <UCard class="flex flex-col min-h-0">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <h3 class="font-semibold">
            {{ $t('asciiArtPreview') }}
          </h3>
          <UButton
            icon="i-lucide-copy"
            size="sm"
            variant="ghost"
            :disabled="!inputText.trim()"
            @click="copyToClipboard"
          >
            {{ $t('Copy') }}
          </UButton>
        </div>
      </template>

      <div class="flex-1 min-h-0 overflow-auto">
        <div
          class="p-4 rounded-lg bg-muted/50 dark:bg-muted/20 border border-default overflow-x-auto"
        >
          <pre
            class="font-mono text-sm leading-tight whitespace-pre select-all"
            style="font-size: min(0.75rem, 12px); line-height: 1.15; letter-spacing: 0;"
          >{{ asciiOutput }}</pre>
        </div>
      </div>

      <template #footer>
        <p class="text-xs text-muted">
          {{ $t('asciiArtHint') }}
        </p>
      </template>
    </UCard>
  </div>
</template>
