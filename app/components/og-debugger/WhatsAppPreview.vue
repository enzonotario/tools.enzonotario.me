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
  <div
    class="relative flex w-full flex-col rounded-[7.5px] bg-[#d9fdd3] px-1 pb-2 pt-1 dark:bg-[#005c4b]"
    :style="{ boxShadow: 'rgba(11, 20, 26, 0.13) 0px 1px 0.5px 0px' }"
  >
    <img
      v-if="preview.image"
      :src="preview.image"
      :alt="preview.title"
      class="aspect-[1.91/1] w-full cursor-pointer rounded-t-[6px] object-cover"
      @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
    >
    <div class="mb-1.5 flex w-full cursor-pointer flex-col rounded-[4px] bg-[#d1f4cc] px-2.5 py-1.5 dark:bg-[#025144]">
      <span class="mb-0.5 line-clamp-2 cursor-pointer text-ellipsis break-words text-[13px] font-normal leading-[19px] text-black dark:text-[#e9edefe0]">
        {{ preview.title }}
      </span>
      <span
        v-if="preview.description && preview.description !== 'No description'"
        class="line-clamp-2 whitespace-pre-line text-xs font-normal leading-[19px] text-black dark:text-[#e9edefe0]"
      >
        {{ preview.description }}
      </span>
      <span class="pt-[1px] text-xs font-normal leading-[19px] text-[#111b214d] hover:underline dark:text-[#e9edef4d]">
        {{ getHostname }}
      </span>
    </div>
    <span class="cursor-pointer overflow-clip break-words px-1 text-[14px] font-normal leading-[19px] text-[#027eb5] underline dark:text-[#53bdeb]">
      {{ preview.url }}
    </span>
  </div>
</template>
