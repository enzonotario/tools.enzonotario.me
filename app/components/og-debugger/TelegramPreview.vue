<script setup lang="ts">
import type { PlatformPreview } from '~/composables/useOgDebugger'

interface Props {
  preview: PlatformPreview
}

defineProps<Props>()
</script>

<template>
  <div
    class="relative flex w-full flex-col rounded-[15px] bg-[#e3fee0] px-2 pb-[5px] pt-1 font-[Roboto] antialiased dark:bg-[#8774e1]"
    :style="{ boxShadow: 'rgba(16, 35, 47, 0.15) 0px 1px 2px 0px' }"
  >
    <span class="cursor-pointer overflow-clip break-words text-base font-normal leading-[21px] text-[#5ca853] underline dark:text-white">
      {{ preview.url }}
    </span>
    <div class="my-1 flex w-full cursor-pointer flex-col rounded-[4px] border-l-[3px] border-[#5ca853] bg-[#5ca8531a] py-1 pl-1.5 pr-1.5 hover:bg-[rgba(92,168,83,0.2)] dark:border-white dark:bg-[#ffffff1a] dark:hover:bg-[rgba(255,255,255,0.2)]">
      <span
        v-if="preview.siteName"
        class="text-sm font-medium leading-[18px] text-[#5ca853] hover:underline dark:text-white"
      >
        {{ preview.siteName }}
      </span>
      <span class="cursor-pointer break-words text-sm font-medium leading-[18px] text-black dark:text-white">
        {{ preview.title }}
      </span>
      <span
        v-if="preview.description && preview.description !== 'No description'"
        class="whitespace-pre-line text-sm font-normal leading-[18px] text-black dark:text-white"
      >
        {{ preview.description }}
      </span>
      <img
        v-if="preview.image"
        :src="preview.image"
        :alt="preview.title"
        class="my-[3px] aspect-[1.91/1] w-full cursor-pointer rounded-[4px] object-cover"
        @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
      >
    </div>
  </div>
</template>
