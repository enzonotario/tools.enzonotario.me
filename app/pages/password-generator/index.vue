<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
const passwordStore = usePasswordGeneratorStore()
const toast = useToast()

const handleLengthWheel = (event: WheelEvent) => {
  event.preventDefault()
  event.stopPropagation()
  const delta = event.deltaY > 0 ? -1 : 1
  passwordStore.setLength(passwordStore.length + delta)
}

const copyToClipboard = async () => {
  if (!passwordStore.generatedPassword) return

  try {
    await navigator.clipboard.writeText(passwordStore.generatedPassword)
    toast.add({
      title: t('Password copied'),
      description: t('Password has been copied to clipboard'),
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch (e) {
    console.error('Failed to copy:', e)
    toast.add({
      title: t('Copy failed'),
      description: t('Failed to copy password to clipboard'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

const passwordStrength = computed(() => {
  const strength = passwordStore.passwordStrength
  return {
    ...strength,
    label: strength.labelKey ? t(strength.labelKey) : ''
  }
})

// Generate on mount
onMounted(() => {
  passwordStore.generatePassword()
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          {{ $t('Password Generator') }}
        </h3>
      </template>

      <UFormField
        :label="$t('Length')"
        class="cursor-pointer rounded-md p-3 transition-all hover:outline-2 hover:outline-primary hover:outline-offset-2"
        @wheel.stop.prevent="handleLengthWheel"
        @click.stop
      >
        <template #default>
          <USlider
            :model-value="passwordStore.length"
            :min="8"
            :max="128"
            :step="1"
            class="mt-2"
            @update:model-value="(value: number | undefined) => passwordStore.setLength(value ?? passwordStore.length)"
          />
          <div class="flex items-center justify-between mt-2">
            <span class="text-sm text-muted">{{ $t('8 characters') }}</span>
            <span class="text-lg font-semibold text-highlighted">{{ passwordStore.length }}</span>
            <span class="text-sm text-muted">{{ $t('128 characters') }}</span>
          </div>
        </template>
      </UFormField>

      <div class="space-y-3">
        <UFormField
          :label="$t('Include uppercase letters')"
          class="cursor-pointer rounded-md p-3 transition-all hover:outline-2 hover:outline-primary hover:outline-offset-2"
          @click="passwordStore.setIncludeUppercase(!passwordStore.includeUppercase)"
        >
          <template #default>
            <USwitch
              :model-value="passwordStore.includeUppercase"
              class="mt-2"
              @update:model-value="passwordStore.setIncludeUppercase"
              @click.stop
            />
          </template>
        </UFormField>

        <UFormField
          :label="$t('Include lowercase letters')"
          class="cursor-pointer rounded-md p-3 transition-all hover:outline-2 hover:outline-primary hover:outline-offset-2"
          @click="passwordStore.setIncludeLowercase(!passwordStore.includeLowercase)"
        >
          <template #default>
            <USwitch
              :model-value="passwordStore.includeLowercase"
              class="mt-2"
              @update:model-value="passwordStore.setIncludeLowercase"
              @click.stop
            />
          </template>
        </UFormField>

        <UFormField
          :label="$t('Include numbers')"
          class="cursor-pointer rounded-md p-3 transition-all hover:outline-2 hover:outline-primary hover:outline-offset-2"
          @click="passwordStore.setIncludeNumbers(!passwordStore.includeNumbers)"
        >
          <template #default>
            <USwitch
              :model-value="passwordStore.includeNumbers"
              class="mt-2"
              @update:model-value="passwordStore.setIncludeNumbers"
              @click.stop
            />
          </template>
        </UFormField>

        <UFormField
          :label="$t('Include simple symbols')"
          class="cursor-pointer rounded-md p-3 transition-all hover:outline-2 hover:outline-primary hover:outline-offset-2"
          @click="passwordStore.setIncludeSimpleSymbols(!passwordStore.includeSimpleSymbols)"
        >
          <template #default>
            <USwitch
              :model-value="passwordStore.includeSimpleSymbols"
              class="mt-2"
              @update:model-value="passwordStore.setIncludeSimpleSymbols"
              @click.stop
            />
          </template>
        </UFormField>

        <UFormField
          :label="$t('Include all symbols')"
          class="cursor-pointer rounded-md p-3 transition-all hover:outline-2 hover:outline-primary hover:outline-offset-2"
          @click="passwordStore.setIncludeAllSymbols(!passwordStore.includeAllSymbols)"
        >
          <template #default>
            <USwitch
              :model-value="passwordStore.includeAllSymbols"
              class="mt-2"
              @update:model-value="passwordStore.setIncludeAllSymbols"
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
          @click="passwordStore.generatePassword"
        >
          {{ $t('Generate') }}
        </UButton>
      </template>
    </UCard>

    <UCard>
      <div class="p-4 space-y-4">
        <div>
          <label class="text-sm font-medium text-highlighted mb-2 block">
            {{ $t('Generated Password') }}
          </label>
          <div class="flex gap-2">
            <UInput
              :model-value="passwordStore.generatedPassword"
              readonly
              size="lg"
              class="flex-1 font-mono"
            />
            <UButton
              size="lg"
              color="primary"
              icon="i-lucide-copy"
              :disabled="!passwordStore.generatedPassword"
              @click="copyToClipboard"
            >
              {{ $t('Copy') }}
            </UButton>
          </div>
        </div>

        <div class="flex justify-end">
          <UButton
            color="neutral"
            leading-icon="i-lucide-refresh-cw"
            @click="passwordStore.generatePassword"
          >
            {{ $t('Regenerate') }}
          </UButton>
        </div>

        <div v-if="passwordStore.generatedPassword">
          <label class="text-sm font-medium text-highlighted mb-2 block">
            {{ $t('Password Strength') }}
          </label>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted">{{ passwordStrength.label }}</span>
              <span class="text-xs text-muted">{{ $t('Level') }}: {{ passwordStrength.level }}/4</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all"
                :class="{
                  'bg-red-500': passwordStrength.color === 'red',
                  'bg-orange-500': passwordStrength.color === 'orange',
                  'bg-yellow-500': passwordStrength.color === 'yellow',
                  'bg-green-500': passwordStrength.color === 'green'
                }"
                :style="{ width: `${(passwordStrength.level / 4) * 100}%` }"
              />
            </div>
          </div>
        </div>

        <div
          v-else
          class="text-center py-8 text-muted"
        >
          <UIcon
            name="i-lucide-lock"
            class="w-16 h-16 mx-auto mb-4 opacity-50"
          />
          <p>{{ $t('Configure options and click Generate to create a password') }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>
