<script setup lang="ts">
import type { PlatformPreview } from '~/composables/useOgDebugger'

interface Props {
  preview: PlatformPreview
}

defineProps<Props>()
</script>

<template>
  <div class="relative flex w-full flex-col rounded-[4px] border-l-4 border-[#e3e5e8] bg-[#f2f3f5] pb-4 pl-3 pr-4 pt-2 font-[Noto_Sans] dark:border-[#1e1f22] dark:bg-[#2b2d31]">
    <span
      v-if="preview.siteName"
      class="mt-2 text-xs font-normal text-[#313338] dark:text-[#dbdee1]"
    >
      {{ preview.siteName }}
    </span>
    <span class="mt-2 cursor-pointer break-words text-base font-semibold leading-[22px] text-[#006ce7] hover:underline dark:text-[#00a8fc]">
      {{ preview.title }}
    </span>
    <span
      v-if="preview.description && preview.description !== 'No description'"
      class="mt-2 whitespace-pre-line text-sm leading-[18px] text-[#313338] dark:text-[#dbdee1]"
    >
      {{ preview.description }}
    </span>
    <img
      v-if="preview.image"
      :src="preview.image"
      :alt="preview.title"
      class="mt-3 aspect-[1.91/1] w-full cursor-pointer rounded-[4px] object-cover"
      @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
    >
  </div>
</template>
