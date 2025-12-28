<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
const tokenStore = useTokenGeneratorStore()
const toast = useToast()

const handleLengthWheel = (event: WheelEvent) => {
  event.preventDefault()
  event.stopPropagation()
  const delta = event.deltaY > 0 ? -1 : 1
  tokenStore.setLength(tokenStore.length + delta)
}

const copyToClipboard = async () => {
  if (!tokenStore.generatedToken) return

  try {
    await navigator.clipboard.writeText(tokenStore.generatedToken)
    toast.add({
      title: t('Token copied'),
      description: t('Token has been copied to clipboard'),
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch (e) {
    console.error('Failed to copy:', e)
    toast.add({
      title: t('Copy failed'),
      description: t('Failed to copy token to clipboard'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

// Generate on mount
onMounted(() => {
  tokenStore.generateToken()
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          {{ $t('Options') }}
        </h3>
      </template>

      <UFormField
        :label="`${$t('Length')} (${tokenStore.length})`"
        class="cursor-pointer rounded-md p-3 transition-all hover:outline-2 hover:outline-primary hover:outline-offset-2"
        @wheel.stop.prevent="handleLengthWheel"
        @click.stop
      >
        <template #default>
          <USlider
            :model-value="tokenStore.length"
            :min="1"
            :max="512"
            :step="1"
            class="mt-2"
            @update:model-value="(value: number | undefined) => tokenStore.setLength(value ?? tokenStore.length)"
          />
          <div class="flex items-center justify-between mt-2">
            <span class="text-sm text-muted">{{ $t('1 character') }}</span>
            <span class="text-lg font-semibold text-highlighted">{{ tokenStore.length }}</span>
            <span class="text-sm text-muted">{{ $t('512 characters') }}</span>
          </div>
        </template>
      </UFormField>

      <div class="space-y-3 mt-6">
        <UFormField
          :label="$t('Uppercase (ABC...)')"
          class="cursor-pointer rounded-md p-3 transition-all hover:outline-2 hover:outline-primary hover:outline-offset-2"
          @click="tokenStore.setIncludeUppercase(!tokenStore.includeUppercase)"
        >
          <template #default>
            <USwitch
              :model-value="tokenStore.includeUppercase"
              class="mt-2"
              @update:model-value="tokenStore.setIncludeUppercase"
              @click.stop
            />
          </template>
        </UFormField>

        <UFormField
          :label="$t('Lowercase (abc...)')"
          class="cursor-pointer rounded-md p-3 transition-all hover:outline-2 hover:outline-primary hover:outline-offset-2"
          @click="tokenStore.setIncludeLowercase(!tokenStore.includeLowercase)"
        >
          <template #default>
            <USwitch
              :model-value="tokenStore.includeLowercase"
              class="mt-2"
              @update:model-value="tokenStore.setIncludeLowercase"
              @click.stop
            />
          </template>
        </UFormField>

        <UFormField
          :label="$t('Numbers (123...)')"
          class="cursor-pointer rounded-md p-3 transition-all hover:outline-2 hover:outline-primary hover:outline-offset-2"
          @click="tokenStore.setIncludeNumbers(!tokenStore.includeNumbers)"
        >
          <template #default>
            <USwitch
              :model-value="tokenStore.includeNumbers"
              class="mt-2"
              @update:model-value="tokenStore.setIncludeNumbers"
              @click.stop
            />
          </template>
        </UFormField>

        <UFormField
          :label="$t('Symbols (!-;...)')"
          class="cursor-pointer rounded-md p-3 transition-all hover:outline-2 hover:outline-primary hover:outline-offset-2"
          @click="tokenStore.setIncludeSymbols(!tokenStore.includeSymbols)"
        >
          <template #default>
            <USwitch
              :model-value="tokenStore.includeSymbols"
              class="mt-2"
              @update:model-value="tokenStore.setIncludeSymbols"
              @click.stop
            />
          </template>
        </UFormField>
      </div>

      <template #footer>
        <UButton
          block
          size="lg"
          color="neutral"
          @click="tokenStore.generateToken"
        >
          {{ $t('Refresh') }}
        </UButton>
      </template>
    </UCard>

    <UCard class="flex flex-col min-h-0">
      <div class="space-y-4 flex-1 flex flex-col min-h-0">
        <div>
          <UFormField
            :label="$t('Generated Token')"
          >
            <UTextarea
              :model-value="tokenStore.generatedToken"
              readonly
              class="font-mono text-sm"
              :ui="{
                root: 'block w-full'
              }"
              :placeholder="$t('Generated token will appear here...')"
              autoresize
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton
              size="lg"
              color="primary"
              icon="i-lucide-copy"
              :disabled="!tokenStore.generatedToken"
              @click="copyToClipboard"
            >
              {{ $t('Copy') }}
            </UButton>
          </div>
        </div>

        <div
          v-if="!tokenStore.generatedToken"
          class="text-center py-8 text-muted"
        >
          <UIcon
            name="i-lucide-key"
            class="w-16 h-16 mx-auto mb-4 opacity-50"
          />
          <p>{{ $t('Configure options and click Refresh to generate a token') }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>
