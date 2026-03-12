<script setup lang="ts">
import { textToBlockAscii, ASCII_STYLES } from '~/utils/asciiBlockFont'

definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
useSeoMeta({ title: t('Text to ASCII Art') })
const toast = useToast()
const { share, getSharedData } = useShare()

const inputText = ref('HELLO WORLD')
const styleId = ref<'ansi-shadow' | 'ansi-regular' | 'ansi-compact'>('ansi-shadow')

const handleShare = () => {
  share({
    inputText: inputText.value,
    styleId: styleId.value
  })
}

onMounted(() => {
  const sharedData = getSharedData<any>()
  if (sharedData) {
    if (sharedData.inputText) inputText.value = sharedData.inputText
    if (sharedData.styleId) styleId.value = sharedData.styleId
  }
})

const asciiOutput = computed(() => {
  const text = inputText.value.trim() || ' '
  return textToBlockAscii(text, { styleId: styleId.value, horizontalLayout: 'fitted' })
})

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

const clearAll = () => {
  inputText.value = ''
}
</script>

<template>
  <div class="w-full h-full split-pane-wrapper">
    <ClientOnly>
      <Teleport to="#header-actions-portal">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
            {{ $t('Text to ASCII Art') }}
          </span>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">{{ $t('asciiArtStyle') }}:</span>
            <USelectMenu
              v-model="styleId"
              :items="ASCII_STYLES.map(s => ({ value: s.id, label: s.name }))"
              value-key="value"
              label-key="label"
              size="sm"
            />
          </div>

          <UButton
            size="sm"
            icon="i-lucide-share-2"
            color="neutral"
            variant="outline"
            @click="handleShare"
          >
            {{ $t('Share') }}
          </UButton>

          <UButton
            size="sm"
            icon="i-lucide-copy"
            :disabled="!asciiOutput"
            @click="copyToClipboard"
          >
            {{ $t('Copy') }}
          </UButton>

          <UButton
            variant="outline"
            size="sm"
            icon="i-lucide-x"
            @click="clearAll"
          >
            {{ $t('Clear') }}
          </UButton>
        </div>
      </Teleport>

      <SplitPane
        split="vertical"
        :min-percent="20"
        :default-percent="50"
        storage-key="ascii-art"
        class="h-full"
      >
        <template #paneL>
          <div class="flex flex-col h-full p-1 space-y-2">
            <div class="flex-1 flex flex-col min-h-0">
              <UTextarea
                v-model="inputText"
                :placeholder="$t('asciiArtTextPlaceholder')"
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
            <div class="flex-1 flex flex-col min-h-0 overflow-auto">
              <div
                class="h-full min-h-0 rounded-lg border border-default bg-muted/50 dark:bg-muted/20 overflow-auto p-4"
              >
                <pre
                  v-if="asciiOutput"
                  class="font-mono text-sm leading-tight whitespace-pre select-all"
                  style="font-size: min(0.75rem, 12px); line-height: 1.15; letter-spacing: 0;"
                >{{ asciiOutput }}</pre>
                <p
                  v-else
                  class="text-muted text-sm"
                >
                  {{ $t('asciiArtTextPlaceholder') }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </SplitPane>
      <template #fallback>
        <div class="flex gap-6 h-full">
          <div class="flex-1 flex flex-col space-y-2 p-1">
            <div class="flex-1 flex flex-col min-h-0">
              <UTextarea
                v-model="inputText"
                :placeholder="$t('asciiArtTextPlaceholder')"
                class="font-mono text-sm flex-1"
                :ui="{
                  base: 'block w-full h-full resize-none'
                }"
              />
            </div>
          </div>
          <div class="flex-1 flex flex-col space-y-2 p-1">
            <div class="flex-1 flex flex-col min-h-0 overflow-auto rounded-lg border border-default bg-muted/50 dark:bg-muted/20 p-4 items-center justify-center">
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
