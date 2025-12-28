<script setup lang="ts">
import type { PlatformPreview } from '~/composables/useOgDebugger'

interface Props {
  preview: PlatformPreview
}

const props = defineProps<Props>()

const getHostname = computed(() => {
  if (!props.preview.url) return ''
  try {
    const url = new URL(props.preview.url)
    return url.hostname.replace(/^www\./, '').split('.')[0]
  } catch {
    return props.preview.url.replace(/^www\./, '').split('.')[0]
  }
})
</script>

<template>
  <div class="relative flex w-full font-[Slack-Lato,Slack-Fractions,appleLogo,sans-serif] antialiased">
    <div class="w-1 min-w-1 rounded-[8px] bg-[#dddddd] dark:bg-[#35373b]" />
    <div class="flex h-full flex-col items-start justify-center break-words px-3 text-[15px] leading-[22px]">
      <div class="flex items-center justify-center">
        <span class="mr-2 aspect-square h-4 w-4 rounded-[2px] bg-gray-300" />
        <span class="font-black text-[#1d1c1d] dark:text-[#d1d2d3]">
          {{ preview.siteName || getHostname }}
        </span>
      </div>
      <span class="cursor-pointer font-bold text-[#1264a3] hover:text-[#224B88] hover:underline dark:text-[#1d9bd1] dark:hover:text-[#62B0DF]">
        {{ preview.title }}
      </span>
      <span
        v-if="preview.description && preview.description !== 'No description'"
        class="mb-[5px] font-normal text-[#1d1c1d] dark:text-[#d1d2d3]"
      >
        {{ preview.description }}
      </span>
      <div
        v-if="preview.image"
        :style="{
          backgroundImage: `url(${preview.image})`
        }"
        class="aspect-[1.91/1] h-full w-full max-w-[360px] cursor-zoom-in rounded-[8px] bg-cover bg-center bg-no-repeat shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
      />
    </div>
  </div>
</template>
