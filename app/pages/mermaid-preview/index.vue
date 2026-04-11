<script setup lang="ts">
import { VBeautifulMermaid } from 'v-beautiful-mermaid/client'

definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
useSeoMeta({ title: t('Mermaid Preview') })
const toast = useToast()
const { share, getSharedData } = useShare()

const defaultDiagram = `flowchart LR
  A[Mermaid] --> B[Preview]
  B --> C[SVG / ASCII]`

const input = ref(defaultDiagram)
const previewMode = ref<'svg' | 'ascii'>('svg')

const encodedCode = computed(() => {
  const s = input.value.trim()
  if (!s) return ''
  try {
    return btoa(unescape(encodeURIComponent(s)))
  } catch {
    return ''
  }
})

const renderOptions = computed(() => ({
  transparent: true
}))

onMounted(() => {
  const shared = getSharedData<{ input: string, mode?: 'svg' | 'ascii' }>()
  if (shared?.input) {
    input.value = shared.input
  }
  if (shared?.mode === 'ascii' || shared?.mode === 'svg') {
    previewMode.value = shared.mode
  }
})

const clearAll = () => {
  input.value = ''
}

const handleShare = () => {
  share({ input: input.value, mode: previewMode.value })
}

const copySource = async () => {
  try {
    await navigator.clipboard.writeText(input.value)
    toast.add({
      title: t('Copied'),
      description: t('Mermaid source copied'),
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
  } catch {
    toast.add({
      title: t('Error'),
      description: t('Failed to copy to clipboard'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="w-full h-full split-pane-wrapper">
    <div class="flex h-full min-h-0 flex-col">
      <Teleport
        defer
        to="#header-actions-portal"
      >
        <div class="flex flex-wrap items-center gap-2">
          <USelectMenu
            v-model="previewMode"
            :items="[
              { label: t('mermaidRenderSvg'), value: 'svg' },
              { label: t('mermaidRenderAscii'), value: 'ascii' }
            ]"
            value-key="value"
            label-key="label"
            size="sm"
            class="w-36"
          />
          <UButton
            variant="outline"
            size="sm"
            icon="i-lucide-x"
            @click="clearAll"
          >
            {{ $t('Clear') }}
          </UButton>
          <UButton
            variant="outline"
            size="sm"
            icon="i-lucide-share-2"
            @click="handleShare"
          >
            {{ $t('Share') }}
          </UButton>
          <UButton
            size="sm"
            icon="i-lucide-copy"
            :disabled="!input.trim()"
            @click="copySource"
          >
            {{ $t('Copy Mermaid') }}
          </UButton>
        </div>
      </Teleport>

      <SplitPane
        split="vertical"
        :min-percent="20"
        :default-percent="50"
        storage-key="mermaid-preview"
        class="min-h-0 flex-1"
      >
        <template #paneL>
          <div class="flex flex-col h-full p-1">
            <div class="flex-1 flex flex-col min-h-0">
              <UTextarea
                v-model="input"
                class="font-mono text-sm flex-1"
                :placeholder="$t('mermaidPreviewPlaceholder')"
                :ui="{
                  base: 'block w-full h-full resize-none'
                }"
                autofocus
              />
            </div>
          </div>
        </template>

        <template #paneR>
          <div class="flex flex-col h-full p-1 min-h-0">
            <div
              class="flex-1 flex flex-col min-h-0 overflow-auto rounded-lg border border-default bg-default"
            >
              <div
                v-if="!encodedCode"
                class="flex-1 flex items-center justify-center p-6 text-muted text-sm text-center"
              >
                {{ $t('mermaidPreviewEmpty') }}
              </div>
              <VBeautifulMermaid
                v-else
                :code="encodedCode"
                :mode="previewMode"
                :render-options="renderOptions"
                class="min-h-[200px] h-full"
              />
            </div>
          </div>
        </template>
      </SplitPane>
    </div>
  </div>
</template>

<style scoped>
.split-pane-wrapper {
  position: relative;
  height: 100%;
}
</style>
