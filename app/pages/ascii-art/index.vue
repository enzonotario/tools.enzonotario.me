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

const colorMode = ref<'none' | 'solid' | 'gradient'>('none')
const solidColor = ref('#00ff00')
const gradientFrom = ref('#ff00ff')
const gradientTo = ref('#00ffff')
const gradientDirection = ref('to right')

const gradientPresets = [
  { label: 'Matrix', from: '#003300', to: '#00ff00' },
  { label: 'Fire', from: '#ff2200', to: '#ffee00' },
  { label: 'Ocean', from: '#0033ff', to: '#00eeff' },
  { label: 'Neon', from: '#ff00ff', to: '#00ffff' },
  { label: 'Sunset', from: '#ff6600', to: '#cc00ff' },
  { label: 'Gold', from: '#ff8c00', to: '#ffd700' },
  { label: 'Blood', from: '#8b0000', to: '#ff4444' },
  { label: 'Ice', from: '#00cfff', to: '#ffffff' }
]

const directionOptions = [
  { value: 'to right', label: '→ Horizontal' },
  { value: 'to bottom', label: '↓ Vertical' },
  { value: 'to bottom right', label: '↘ Diagonal' }
]

const applyPreset = (preset: { label: string, from: string, to: string }) => {
  gradientFrom.value = preset.from
  gradientTo.value = preset.to
}

const preStyle = computed(() => {
  if (colorMode.value === 'solid') {
    return { color: solidColor.value }
  }
  if (colorMode.value === 'gradient') {
    return {
      background: `linear-gradient(${gradientDirection.value}, ${gradientFrom.value}, ${gradientTo.value})`,
      webkitBackgroundClip: 'text',
      webkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    }
  }
  return {}
})

const handleShare = () => {
  share({
    inputText: inputText.value,
    styleId: styleId.value,
    colorMode: colorMode.value,
    solidColor: solidColor.value,
    gradientFrom: gradientFrom.value,
    gradientTo: gradientTo.value,
    gradientDirection: gradientDirection.value
  })
}

onMounted(() => {
  const sharedData = getSharedData<{
    inputText?: string
    styleId?: 'ansi-shadow' | 'ansi-regular' | 'ansi-compact'
    colorMode?: 'none' | 'solid' | 'gradient'
    solidColor?: string
    gradientFrom?: string
    gradientTo?: string
    gradientDirection?: string
  }>()
  if (sharedData) {
    if (sharedData.inputText) inputText.value = sharedData.inputText
    if (sharedData.styleId) styleId.value = sharedData.styleId
    if (sharedData.colorMode) colorMode.value = sharedData.colorMode
    if (sharedData.solidColor) solidColor.value = sharedData.solidColor
    if (sharedData.gradientFrom) gradientFrom.value = sharedData.gradientFrom
    if (sharedData.gradientTo) gradientTo.value = sharedData.gradientTo
    if (sharedData.gradientDirection) gradientDirection.value = sharedData.gradientDirection
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
      <Teleport
        defer
        to="#header-actions-portal"
      >
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
            <div class="flex flex-col gap-2 border border-default rounded-lg p-2">
              <div class="flex items-center gap-2">
                <span class="text-sm text-muted">{{ $t('Color') }}:</span>
                <div class="flex gap-1">
                  <UButton
                    size="xs"
                    :variant="colorMode === 'none' ? 'solid' : 'outline'"
                    color="neutral"
                    @click="colorMode = 'none'"
                  >
                    {{ $t('None') }}
                  </UButton>
                  <UButton
                    size="xs"
                    :variant="colorMode === 'solid' ? 'solid' : 'outline'"
                    color="neutral"
                    @click="colorMode = 'solid'"
                  >
                    {{ $t('Solid') }}
                  </UButton>
                  <UButton
                    size="xs"
                    :variant="colorMode === 'gradient' ? 'solid' : 'outline'"
                    color="neutral"
                    @click="colorMode = 'gradient'"
                  >
                    {{ $t('Gradient') }}
                  </UButton>
                </div>
              </div>

              <UiColorPicker
                v-if="colorMode === 'solid'"
                v-model="solidColor"
              />

              <div
                v-if="colorMode === 'gradient'"
                class="flex flex-col gap-2"
              >
                <div class="flex flex-wrap gap-1">
                  <button
                    v-for="preset in gradientPresets"
                    :key="preset.label"
                    class="px-2 py-0.5 rounded text-xs font-bold text-white shadow-sm hover:scale-105 transition-transform"
                    :style="{ background: `linear-gradient(to right, ${preset.from}, ${preset.to})` }"
                    @click="applyPreset(preset)"
                  >
                    {{ preset.label }}
                  </button>
                </div>
                <div class="flex gap-4 flex-wrap">
                  <div class="flex flex-col gap-1">
                    <span class="text-xs text-muted">{{ $t('From') }}</span>
                    <UiColorPicker v-model="gradientFrom" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <span class="text-xs text-muted">{{ $t('To') }}</span>
                    <UiColorPicker v-model="gradientTo" />
                  </div>
                </div>
                <UTabs
                  v-model="gradientDirection"
                  :content="false"
                  :items="directionOptions"
                  size="xs"
                  color="neutral"
                  variant="pill"
                />
              </div>
            </div>

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
                  :style="preStyle"
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
