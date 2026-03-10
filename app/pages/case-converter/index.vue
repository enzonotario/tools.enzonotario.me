<script setup lang="ts">
import { toCamel, toPascal, toSnake, toKebab, toConstant, toTitle } from '~/utils/caseConverter'

definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
const toast = useToast()
const { share, getSharedData } = useShare()

const input = ref('')

const handleShare = () => {
  share({ input: input.value })
}

onMounted(() => {
  const sharedData = getSharedData<any>()
  if (sharedData?.input) {
    input.value = sharedData.input
  }
})

const conversions = computed(() => {
  const text = input.value.trim()
  if (!text) return []
  return [
    { label: 'camelCase', value: toCamel(text) },
    { label: 'PascalCase', value: toPascal(text) },
    { label: 'snake_case', value: toSnake(text) },
    { label: 'kebab-case', value: toKebab(text) },
    { label: 'CONSTANT_CASE', value: toConstant(text) },
    { label: 'Title Case', value: toTitle(text) }
  ]
})

const copyValue = async (value: string) => {
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
}
</script>

<template>
  <Teleport to="#header-actions-portal">
    <div class="flex items-center gap-2">
      <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
        {{ $t('Case Converter') }}
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
        storage-key="case-converter"
        class="h-full"
      >
        <template #paneL>
          <div class="flex flex-col h-full p-1 space-y-2">
            <div class="flex-1 flex flex-col min-h-0">
              <UTextarea
                v-model="input"
                :placeholder="$t('caseConverterPlaceholder')"
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
                <template v-if="conversions.length">
                  <div
                    v-for="item in conversions"
                    :key="item.label"
                    class="flex flex-col gap-1"
                  >
                    <span class="text-xs font-medium text-muted">{{ item.label }}</span>
                    <div class="flex items-center gap-2 font-mono text-sm break-all">
                      <span class="flex-1 min-w-0">{{ item.value }}</span>
                      <UButton
                        size="xs"
                        variant="ghost"
                        icon="i-lucide-copy"
                        @click="copyValue(item.value)"
                      />
                    </div>
                  </div>
                </template>
                <p
                  v-else
                  class="text-muted text-sm"
                >
                  {{ $t('caseConverterPlaceholder') }}
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
              :placeholder="$t('caseConverterPlaceholder')"
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
