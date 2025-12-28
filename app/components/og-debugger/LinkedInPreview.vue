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
    return url.hostname.replace(/^www\./, '')
  } catch {
    return props.preview.url.replace(/^www\./, '')
  }
})
</script>

<template>
  <div class="relative w-full">
    <img
      v-if="preview.image"
      :src="preview.image"
      :alt="preview.title"
      class="aspect-[1.91/1] w-full cursor-pointer object-cover"
      @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
    >
    <div class="flex flex-col items-start justify-center bg-[#EEF3F7] px-3 py-2 dark:bg-[#3A434E]">
      <span class="mb-2 line-clamp-2 w-full cursor-pointer text-ellipsis text-left text-sm font-semibold leading-5 text-[#000000e6] dark:text-[#ffffffe6]">
        {{ preview.title }}
      </span>
      <span class="w-full cursor-pointer text-left text-xs font-normal leading-[15px] text-[#00000099] dark:text-[#ffffff99]">
        {{ getHostname }}<span v-if="preview.additionalInfo"> • {{ preview.additionalInfo }}</span><span v-else> • 1 min read</span>
      </span>
    </div>
  </div>
</template>
