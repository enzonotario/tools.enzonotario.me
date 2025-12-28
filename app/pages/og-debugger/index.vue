<script setup lang="ts">
import type { PlatformPreview } from '~/composables/useOgDebugger'
import OgDebuggerPlatformPreview from '~/components/og-debugger/PlatformPreview.vue'

definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
const toast = useToast()
const { metadata, loading, error, fetchOgMetadata, getPlatformPreview } = useOgDebugger()

const url = ref('')
const activeTab = ref<'previews' | 'metatags'>('previews')

// Plataformas disponibles - fácil de extender
const platforms = [
  'Twitter',
  'Facebook',
  'LinkedIn',
  'Slack',
  'Discord',
  'Telegram',
  'WhatsApp'
]

const validateUrl = () => {
  if (!url.value.trim()) {
    return false
  }
  return true
}

const handleValidate = async () => {
  if (!validateUrl()) {
    return
  }
  await fetchOgMetadata(url.value)
}

const previews = computed(() => {
  if (!metadata.value) return []

  return platforms
    .map(platform => getPlatformPreview(platform))
    .filter((preview): preview is PlatformPreview => preview !== null)
})

const metatagsList = computed(() => {
  if (!metadata.value) return []

  const tags: Array<{ name: string, value: string | undefined }> = []
  const meta = metadata.value

  if (meta.title) tags.push({ name: 'og:title', value: meta.title })
  if (meta.description) tags.push({ name: 'og:description', value: meta.description })
  if (meta.image) tags.push({ name: 'og:image', value: meta.image })
  if (meta.url) tags.push({ name: 'og:url', value: meta.url })
  if (meta.siteName) tags.push({ name: 'og:site_name', value: meta.siteName })
  if (meta.type) tags.push({ name: 'og:type', value: meta.type })
  if (meta.twitterCard) tags.push({ name: 'twitter:card', value: meta.twitterCard })
  if (meta.twitterTitle) tags.push({ name: 'twitter:title', value: meta.twitterTitle })
  if (meta.twitterDescription) tags.push({ name: 'twitter:description', value: meta.twitterDescription })
  if (meta.twitterImage) tags.push({ name: 'twitter:image', value: meta.twitterImage })
  if (meta.twitterSite) tags.push({ name: 'twitter:site', value: meta.twitterSite })
  if (meta.twitterCreator) tags.push({ name: 'twitter:creator', value: meta.twitterCreator })
  if (meta.author) tags.push({ name: 'author', value: meta.author })
  if (meta.publishedTime) tags.push({ name: 'article:published_time', value: meta.publishedTime })

  return tags
})

const copyMetatag = async (tag: { name: string, value: string | undefined }) => {
  const metaTag = `<meta property="${tag.name}" content="${tag.value}" />`
  try {
    await navigator.clipboard.writeText(metaTag)
    toast.add({
      title: t('Metatag copied'),
      description: t('Metatag has been copied to clipboard'),
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
  } catch (e) {
    console.error('Failed to copy:', e)
    toast.add({
      title: t('Failed to copy'),
      description: t('Failed to copy'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}
</script>

<template>
  <div>
    <Teleport to="#header-actions-portal">
      <div class="flex gap-2">
        <div class="flex-1 max-w-md">
          <UInput
            v-model="url"
            placeholder="https://"
            size="lg"
            :disabled="loading"
            autofocus
            @keyup.enter="handleValidate"
          />
        </div>
        <UButton
          size="lg"
          color="primary"
          :loading="loading"
          :disabled="!validateUrl()"
          @click="handleValidate"
        >
          {{ $t('Validate') }}
        </UButton>
      </div>
    </Teleport>

    <div class="flex flex-col gap-6">
      <!--      <div class="flex-1 flex flex-col  p-6 min-h-0"> -->
      <div
        v-if="error"
        class="shrink-0"
      >
        <UAlert
          color="error"
          variant="soft"
          :title="$t('Error')"
          :description="error"
        />
      </div>

      <div
        v-if="metadata"
        class="flex-1 min-h-0 flex flex-col"
      >
        <UTabs
          v-model="activeTab"
          :items="[
            { label: $t('Previews'), value: 'previews' },
            { label: $t('Metatags'), value: 'metatags' }
          ]"
          color="neutral"
        />

        <div
          v-if="activeTab === 'previews'"
          class="flex-1 min-h-0 overflow-auto mt-6"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <OgDebuggerPlatformPreview
              v-for="preview in previews"
              :key="preview.platform"
              :preview="preview"
            />
          </div>
        </div>

        <div
          v-if="activeTab === 'metatags'"
          class="flex-1 min-h-0 overflow-auto mt-6"
        >
          <UCard>
            <div class="p-4">
              <div class="space-y-3">
                <div
                  v-for="tag in metatagsList"
                  :key="tag.name"
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-highlighted">
                      {{ tag.name }}
                    </div>
                    <div class="text-sm text-muted truncate">
                      {{ tag.value }}
                    </div>
                  </div>
                  <UButton
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-copy"
                    @click="copyMetatag(tag)"
                  />
                </div>

                <div
                  v-if="metatagsList.length === 0"
                  class="text-center py-8 text-muted"
                >
                  {{ $t('No metatags found') }}
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <div
        v-else-if="!loading && !error"
        class="flex-1 flex items-center justify-center"
      >
        <div class="text-center text-muted">
          <UIcon
            name="i-lucide-link"
            class="w-16 h-16 mx-auto mb-4 opacity-50"
          />
          <p>{{ $t('Enter a URL above to see how it will appear when shared') }}</p>
        </div>
      </div>
    </div>
    <!--    </div> -->
  </div>
</template>
