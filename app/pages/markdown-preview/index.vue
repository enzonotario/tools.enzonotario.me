<script setup lang="ts">
import MarkdownIt from 'markdown-it'

definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
useSeoMeta({ title: t('Markdown Preview') })
const toast = useToast()
const { share, getSharedData } = useShare()

const input = ref('# Markdown Preview\n\nTry typing some markdown here!\n\n## Features\n- Real-time preview\n- Synchronized scrolling\n- Support for **bold**, *italic*, and `code` blocks\n\n```javascript\nconsole.log("Hello, world!");\n```')

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const renderedHtml = computed(() => {
  return md.render(input.value)
})

const editorRef = ref<ComponentPublicInstance | null>(null)
const previewRef = ref<HTMLElement | null>(null)

const isScrollingEditor = ref(false)
const isScrollingPreview = ref(false)
const isFullscreenPreview = ref(false)

const syncScroll = (source: HTMLElement, target: HTMLElement) => {
  const scrollPercentage = source.scrollTop / (source.scrollHeight - source.clientHeight)
  target.scrollTop = scrollPercentage * (target.scrollHeight - target.clientHeight)
}

const handleEditorScroll = (event: Event) => {
  if (isScrollingPreview.value) return

  const textarea = event.target as HTMLElement
  if (previewRef.value && textarea) {
    isScrollingEditor.value = true
    syncScroll(textarea, previewRef.value)
    // Clear the flag after a short delay
    setTimeout(() => {
      isScrollingEditor.value = false
    }, 50)
  }
}

const handlePreviewScroll = (event: Event) => {
  if (isScrollingEditor.value) return

  const preview = event.target as HTMLElement
  const textarea = editorRef.value?.$el?.querySelector('textarea')
  if (preview && textarea) {
    isScrollingPreview.value = true
    syncScroll(preview, textarea)
    // Clear the flag after a short delay
    setTimeout(() => {
      isScrollingPreview.value = false
    }, 50)
  }
}

// Add event listener to textarea manually on mount
onMounted(() => {
  const sharedData = getSharedData<{ input: string }>()
  if (sharedData?.input) {
    input.value = sharedData.input
  }

  const textarea = editorRef.value?.$el?.querySelector('textarea')
  if (textarea) {
    textarea.addEventListener('scroll', handleEditorScroll)
  }
})

onUnmounted(() => {
  const textarea = editorRef.value?.$el?.querySelector('textarea')
  if (textarea) {
    textarea.removeEventListener('scroll', handleEditorScroll)
  }
})

const clearInput = () => {
  input.value = ''
}

const handleShare = () => {
  share({ input: input.value })
}

const copyHtml = async () => {
  try {
    await navigator.clipboard.writeText(renderedHtml.value)
    toast.add({
      title: t('Copied'),
      description: t('HTML copied to clipboard'),
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
  } catch (err) {
    console.error('Failed to copy HTML: ', err)
    toast.add({
      title: t('Error'),
      description: t('Failed to copy HTML'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}
</script>

<template>
  <div
    class="w-full h-full split-pane-wrapper"
    :class="{ 'is-preview-fullscreen': isFullscreenPreview }"
  >
    <ClientOnly>
      <Teleport
        defer
        to="#header-actions-portal"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
            {{ $t('Markdown Preview') }}
          </span>
          <UButton
            variant="outline"
            size="sm"
            :icon="isFullscreenPreview ? 'i-lucide-panel-left' : 'i-lucide-maximize-2'"
            color="neutral"
            @click="isFullscreenPreview = !isFullscreenPreview"
          >
            {{ isFullscreenPreview ? $t('Show Editor') : $t('Fullscreen Preview') }}
          </UButton>
          <UButton
            variant="outline"
            size="sm"
            icon="i-lucide-trash-2"
            color="neutral"
            @click="clearInput"
          >
            {{ $t('Clear') }}
          </UButton>
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
            @click="copyHtml"
          >
            {{ $t('Copy HTML') }}
          </UButton>
        </div>
      </Teleport>

      <SplitPane
        split="vertical"
        :min-percent="20"
        :default-percent="50"
        storage-key="markdown-preview"
        class="h-full"
      >
        <template #paneL>
          <div class="flex flex-col h-full p-1">
            <div class="flex-1 flex flex-col min-h-0 relative">
              <UTextarea
                ref="editorRef"
                v-model="input"
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
            <div
              ref="previewRef"
              class="flex-1 flex flex-col min-h-0 overflow-auto bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
              @scroll="handlePreviewScroll"
            >
              <div
                class="markdown-body prose dark:prose-invert max-w-none"
                v-html="renderedHtml"
              />
            </div>
          </div>
        </template>
      </SplitPane>
      <template #fallback>
        <div class="flex items-center justify-center h-full">
          <UIcon
            name="i-lucide-loader-2"
            class="animate-spin size-8 text-primary-500"
          />
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

.is-preview-fullscreen :deep(.split-pane-left) {
  display: none !important;
}

.is-preview-fullscreen :deep(.split-pane-resizer) {
  display: none !important;
}

.is-preview-fullscreen :deep(.split-pane-right) {
  width: 100% !important;
  flex-grow: 1 !important;
}

:deep(.prose) {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

:deep(.prose pre) {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
}

.dark :deep(.prose pre) {
  background-color: #111827;
}

:deep(.prose code) {
  background-color: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.dark :deep(.prose code) {
  background-color: #111827;
}

:deep(.prose h1) { font-size: 1.875rem; font-weight: 700; margin-bottom: 1.25rem; }
:deep(.prose h2) { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
:deep(.prose h3) { font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.75rem; }
:deep(.prose p) { margin-bottom: 1rem; line-height: 1.6; }
:deep(.prose ul) { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
:deep(.prose ol) { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
:deep(.prose blockquote) { border-left: 4px solid #e5e7eb; padding-left: 1rem; font-style: italic; color: #6b7280; margin-bottom: 1rem; }
.dark :deep(.prose blockquote) { border-left-color: #374151; color: #9ca3af; }

/* Synchronized scroll smoothness */
.overflow-auto {
  scroll-behavior: auto;
}
</style>
