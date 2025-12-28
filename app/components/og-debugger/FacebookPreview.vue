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
  <div class="relative w-full cursor-pointer font-['Helvetica'] antialiased shadow-[0_1px_2px_rgb(0_0_0_/_0.2)]">
    <img
      v-if="preview.image"
      :src="preview.image"
      :alt="preview.title"
      class="aspect-[1.91/1] w-full object-cover"
      @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
    >
    <div class="flex flex-col items-start justify-center bg-[#EBECED] px-3 py-2.5 dark:bg-[#3a3b3c]">
      <span class="text-left text-xs font-normal uppercase leading-[11px] text-[#606770] dark:text-[#b0b3b8]">
        {{ getHostname }}
      </span>
      <span class="mt-1.5 line-clamp-1 text-ellipsis text-left text-base font-semibold leading-5 text-[#1d2129] dark:text-[#e4e6eb]">
        {{ preview.title }}
      </span>
      <span
        v-if="preview.description && preview.description !== 'No description'"
        class="leading-[18px] line-clamp-1 text-ellipsis text-left text-sm font-normal text-[#606770] dark:text-[#b0b3b8]"
      >
        {{ preview.description }}
      </span>
    </div>
  </div>
</template>
