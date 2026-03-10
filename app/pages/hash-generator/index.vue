<script setup lang="ts">
import { computeAll } from '~/utils/hash'

definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
const toast = useToast()
const { share, getSharedData } = useShare()

const input = ref('')
const hashes = ref<{ md5: string, sha1: string, sha256: string, sha512: string } | null>(null)

const handleShare = () => {
  share({ input: input.value })
}

onMounted(() => {
  const sharedData = getSharedData<any>()
  if (sharedData?.input) {
    input.value = sharedData.input
  }
})

watchEffect(() => {
  const text = input.value
  if (!text) {
    hashes.value = null
    return
  }
  computeAll(text).then((result) => {
    hashes.value = result
  })
})

const copyHash = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    toast.add({
      title: t('Copied'),
      description: t('Copied to clipboard'),
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch (e) {
    toast.add({
      title: t('Copy failed'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

const clearAll = () => {
  input.value = ''
  hashes.value = null
}
</script>

<template>
  <Teleport to="#header-actions-portal">
    <div class="flex items-center gap-2">
      <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
        {{ $t('Hash Generator') }}
      </span>
      <UButton
        variant="outline"
        size="sm"
        icon="i-lucide-share-2"
        @click="handleShare"
      >
        {{ $t('Share') }}
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

  <div class="w-full h-full split-pane-wrapper">
    <ClientOnly>
      <SplitPane
        split="vertical"
        :min-percent="20"
        :default-percent="50"
        storage-key="hash-generator"
        class="h-full"
      >
        <template #paneL>
          <div class="flex flex-col h-full p-1 space-y-2">
            <div class="flex-1 flex flex-col min-h-0">
              <UTextarea
                v-model="input"
                :placeholder="$t('hashPlaceholder')"
                class="font-mono text-sm flex-1"
                :ui="{ base: 'block w-full h-full resize-none' }"
                autofocus
              />
            </div>
          </div>
        </template>
        <template #paneR>
          <div class="flex flex-col h-full p-1 space-y-2">
            <div class="flex-1 flex flex-col min-h-0 overflow-auto">
              <div class="h-full rounded-lg border border-default bg-muted/50 dark:bg-muted/20 overflow-auto p-4 space-y-3">
                <template v-if="hashes">
                  <div
                    v-for="(value, key) in hashes"
                    :key="key"
                    class="flex flex-col gap-1"
                  >
                    <span class="text-xs font-medium text-muted uppercase">{{ key }}</span>
                    <div class="flex items-center gap-2 font-mono text-sm break-all">
                      <span class="flex-1 min-w-0">{{ value }}</span>
                      <UButton
                        size="xs"
                        variant="ghost"
                        icon="i-lucide-copy"
                        @click="copyHash(value)"
                      />
                    </div>
                  </div>
                </template>
                <p
                  v-else
                  class="text-muted text-sm"
                >
                  {{ $t('hashPlaceholder') }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </SplitPane>
      <template #fallback>
        <div class="flex gap-6 h-full">
          <div class="flex-1 flex flex-col p-1 min-h-0">
            <UTextarea
              v-model="input"
              :placeholder="$t('hashPlaceholder')"
              class="font-mono text-sm flex-1"
              :ui="{ base: 'block w-full h-full resize-none' }"
            />
          </div>
          <div class="flex-1 flex flex-col min-h-0 overflow-auto rounded-lg border border-default bg-muted/50 dark:bg-muted/20 p-4 items-center justify-center">
            <p class="text-muted text-sm">
              {{ $t('Loading...') }}
            </p>
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
