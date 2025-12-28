<script setup lang="ts">
import type { PlatformPreview as PlatformPreviewType } from '~/composables/useOgDebugger'
import TwitterPreview from './TwitterPreview.vue'
import FacebookPreview from './FacebookPreview.vue'
import LinkedInPreview from './LinkedInPreview.vue'
import SlackPreview from './SlackPreview.vue'
import DiscordPreview from './DiscordPreview.vue'
import TelegramPreview from './TelegramPreview.vue'
import WhatsAppPreview from './WhatsAppPreview.vue'

interface Props {
  preview: PlatformPreviewType
}

const props = defineProps<Props>()

const platformComponents: Record<string, Component> = {
  twitter: TwitterPreview,
  x: TwitterPreview,
  facebook: FacebookPreview,
  linkedin: LinkedInPreview,
  slack: SlackPreview,
  discord: DiscordPreview,
  telegram: TelegramPreview,
  whatsapp: WhatsAppPreview
}

const platformComponent = computed(() => {
  const platformLower = props.preview.platform.toLowerCase()
  return platformComponents[platformLower] || TwitterPreview
})

const platformIconMap: Record<string, string> = {
  twitter: '/icons/x.svg',
  x: '/icons/x.svg',
  facebook: '/icons/facebook.svg',
  linkedin: '/icons/linkedin.svg',
  slack: '/icons/slack.svg',
  discord: '/icons/discord.svg',
  telegram: '/icons/telegram.svg',
  whatsapp: '/icons/whatsapp.svg'
}

const platformIcon = computed(() => {
  const platformLower = props.preview.platform.toLowerCase()
  return platformIconMap[platformLower] || '/icons/x.svg'
})

const platformName = computed(() => {
  return props.preview.platform
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <img
        :src="platformIcon"
        :alt="platformName"
        class="h-5 w-5"
      >
      <span class="text-sm font-medium text-highlighted">{{ platformName }}</span>
    </div>
    <component
      :is="platformComponent"
      :preview="preview"
    />
  </div>
</template>
