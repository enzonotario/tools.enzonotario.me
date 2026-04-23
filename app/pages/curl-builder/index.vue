<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

interface KeyValueItem {
  id: number
  key: string
  value: string
}

interface CurlBuilderShareRow {
  key: string
  value: string
}

interface CurlBuilderSharePayload {
  method?: string
  url?: string
  body?: string
  headers?: CurlBuilderShareRow[]
  queryParams?: CurlBuilderShareRow[]
}

const { t } = useI18n()
useSeoMeta({ title: t('Curl Builder') })
const toast = useToast()
const { share, getSharedData } = useShare()

const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
const method = ref('GET')
const url = ref('')
const body = ref('')
const nextId = ref(2)

const headers = ref<KeyValueItem[]>([
  { id: 0, key: '', value: '' }
])

const queryParams = ref<KeyValueItem[]>([
  { id: 1, key: '', value: '' }
])

const handleShare = () => {
  share({
    method: method.value,
    url: url.value,
    body: body.value,
    headers: headers.value.map(({ key, value }) => ({ key, value })),
    queryParams: queryParams.value.map(({ key, value }) => ({ key, value }))
  })
}

onMounted(() => {
  const d = getSharedData<CurlBuilderSharePayload>()
  if (!d) return

  if (d.method && methodOptions.includes(d.method)) {
    method.value = d.method
  }
  if (d.url !== undefined) url.value = d.url
  if (d.body !== undefined) body.value = d.body

  let id = 0
  queryParams.value = d.queryParams?.length
    ? d.queryParams.map(row => ({ id: id++, key: row.key ?? '', value: row.value ?? '' }))
    : [{ id: id++, key: '', value: '' }]
  headers.value = d.headers?.length
    ? d.headers.map(row => ({ id: id++, key: row.key ?? '', value: row.value ?? '' }))
    : [{ id: id++, key: '', value: '' }]
  nextId.value = id
})

const shellEscape = (value: string): string => {
  if (!value) return '\'\''
  const escapedSingleQuote = '\'\\\'\''
  return `'${value.replace(/'/g, escapedSingleQuote)}'`
}

const activeHeaders = computed(() => headers.value.filter(item => item.key.trim()))
const activeParams = computed(() => queryParams.value.filter(item => item.key.trim()))

const curlOneLine = ref(false)

const curlCommandParts = computed((): string[] | null => {
  if (!url.value.trim()) return null

  const queryString = activeParams.value
    .map((item) => {
      const key = encodeURIComponent(item.key.trim())
      const value = encodeURIComponent(item.value.trim())
      return `${key}=${value}`
    })
    .join('&')

  const requestUrl = queryString
    ? `${url.value.trim()}${url.value.includes('?') ? '&' : '?'}${queryString}`
    : url.value.trim()

  const commandParts: string[] = ['curl']

  if (method.value !== 'GET') {
    commandParts.push(`-X ${method.value}`)
  }

  commandParts.push(shellEscape(requestUrl))

  for (const item of activeHeaders.value) {
    const headerLine = `${item.key.trim()}: ${item.value.trim()}`
    commandParts.push(`-H ${shellEscape(headerLine)}`)
  }

  if (body.value.trim() && !['GET', 'HEAD'].includes(method.value)) {
    commandParts.push(`--data-raw ${shellEscape(body.value)}`)
  }

  return commandParts
})

const curlCommand = computed(() => {
  const parts = curlCommandParts.value
  if (!parts) return ''
  return curlOneLine.value
    ? parts.join(' ')
    : parts.join(' \\\n  ')
})

const addHeader = () => {
  headers.value.push({ id: nextId.value++, key: '', value: '' })
}

const addQueryParam = () => {
  queryParams.value.push({ id: nextId.value++, key: '', value: '' })
}

const removeHeader = (id: number) => {
  headers.value = headers.value.filter(item => item.id !== id)
  if (!headers.value.length) addHeader()
}

const removeQueryParam = (id: number) => {
  queryParams.value = queryParams.value.filter(item => item.id !== id)
  if (!queryParams.value.length) addQueryParam()
}

const clearAll = () => {
  method.value = 'GET'
  url.value = ''
  body.value = ''
  headers.value = [{ id: 0, key: '', value: '' }]
  queryParams.value = [{ id: 1, key: '', value: '' }]
  nextId.value = 2
}

const copyCommand = async () => {
  if (!curlCommand.value) return

  try {
    await navigator.clipboard.writeText(curlCommand.value)
    toast.add({
      title: t('Copied'),
      description: t('Copied to clipboard'),
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch {
    toast.add({
      title: t('Copy failed'),
      description: t('Failed to copy'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="w-full h-full split-pane-wrapper">
    <Teleport
      defer
      to="#header-actions-portal"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
          {{ $t('Curl Builder') }}
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

    <ClientOnly>
      <SplitPane
        split="vertical"
        :min-percent="20"
        :default-percent="55"
        storage-key="curl-builder"
        class="h-full"
      >
        <template #paneL>
          <div class="flex flex-col h-full p-1 gap-3 overflow-auto">
            <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2">
              <USelectMenu
                v-model="method"
                :items="methodOptions"
              />
              <UInput
                v-model="url"
                :placeholder="$t('curlBuilderUrlPlaceholder')"
                icon="i-lucide-link"
              />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">{{ $t('curlBuilderQueryParams') }}</span>
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-plus"
                  @click="addQueryParam"
                >
                  {{ $t('Add') }}
                </UButton>
              </div>
              <div
                v-for="item in queryParams"
                :key="item.id"
                class="grid grid-cols-[1fr_1fr_auto] gap-2"
              >
                <UInput
                  v-model="item.key"
                  :placeholder="$t('Key')"
                />
                <UInput
                  v-model="item.value"
                  :placeholder="$t('Value')"
                />
                <UButton
                  size="sm"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-trash-2"
                  @click="removeQueryParam(item.id)"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">{{ $t('curlBuilderHeaders') }}</span>
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-plus"
                  @click="addHeader"
                >
                  {{ $t('Add') }}
                </UButton>
              </div>
              <div
                v-for="item in headers"
                :key="item.id"
                class="grid grid-cols-[1fr_1fr_auto] gap-2"
              >
                <UInput
                  v-model="item.key"
                  :placeholder="$t('Key')"
                />
                <UInput
                  v-model="item.value"
                  :placeholder="$t('Value')"
                />
                <UButton
                  size="sm"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-trash-2"
                  @click="removeHeader(item.id)"
                />
              </div>
            </div>

            <div class="space-y-2 flex-1 min-h-0 flex-col">
              <span class="text-sm font-medium">{{ $t('Body') }}</span>
              <UTextarea
                v-model="body"
                :placeholder="$t('curlBuilderBodyPlaceholder')"
                class="font-mono text-sm w-full"
              />
            </div>
          </div>
        </template>

        <template #paneR>
          <div class="flex flex-col h-full p-1 space-y-2">
            <div class="flex flex-wrap items-center gap-3 justify-between">
              <div class="flex flex-wrap items-center gap-3 min-w-0">
                <UFormField
                  :label="$t('Minified')"
                  orientation="horizontal"
                  :disabled="!curlCommand"
                >
                  <USwitch v-model="curlOneLine" />
                </UFormField>
              </div>
              <UButton
                size="sm"
                icon="i-lucide-copy"
                :disabled="!curlCommand"
                @click="copyCommand"
              >
                {{ $t('Copy') }}
              </UButton>
            </div>
            <div class="flex-1 flex flex-col min-h-0 overflow-auto">
              <div class="h-full rounded-lg border border-default bg-muted/50 dark:bg-muted/20 overflow-auto p-3">
                <pre
                  v-if="curlCommand"
                  class="font-mono text-sm break-all"
                  :class="curlOneLine ? 'whitespace-normal' : 'whitespace-pre-wrap'"
                >{{ curlCommand }}</pre>
                <p
                  v-else
                  class="text-muted text-sm"
                >
                  {{ $t('curlBuilderEmpty') }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </SplitPane>
      <template #fallback>
        <div class="flex gap-6 h-full">
          <div class="flex-1 flex flex-col p-1 min-h-0">
            <UInput
              v-model="url"
              :placeholder="$t('curlBuilderUrlPlaceholder')"
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
