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
  <div class="flex w-full flex-col gap-2">
    <div class="relative w-full cursor-pointer">
      <div
        v-if="preview.image"
        class="absolute bottom-3 left-3 right-3 line-clamp-1 w-fit"
      >
        <div class="flex h-5 items-center justify-center self-start rounded bg-black/30 px-1">
          <span class="line-clamp-1 break-words break-all text-left text-[13px] font-normal leading-4 text-white">
            {{ preview.title }}
          </span>
        </div>
      </div>
      <img
        v-if="preview.image"
        :src="preview.image"
        :alt="preview.title"
        class="aspect-[1.91/1] w-full rounded-2xl border border-[#cfd9de] object-cover dark:border-[#38444d]"
        @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
      >
    </div>
    <span class="cursor-pointer break-words text-[15px] font-normal leading-5 tracking-tight text-[#536471] hover:underline dark:text-[#71767b]">
      From {{ getHostname }}
    </span>
  </div>
</template>
