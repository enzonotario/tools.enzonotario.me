<script setup lang="ts">
import { FileDiff, type FileContents } from '@pierre/diffs'

const props = defineProps<{
  left: string
  right: string
  diffStyle: 'split' | 'unified'
  themeType: 'light' | 'dark'
  filename: string
}>()

const host = ref<HTMLElement | null>(null)
let fileDiff: FileDiff | undefined

const buildFiles = (): { oldFile: FileContents, newFile: FileContents } => ({
  oldFile: { name: props.filename, contents: props.left },
  newFile: { name: props.filename, contents: props.right }
})

const baseOptions = () => ({
  diffStyle: props.diffStyle,
  themeType: props.themeType,
  theme: { dark: 'pierre-dark' as const, light: 'pierre-light' as const },
  overflow: 'scroll' as const
})

const updateDiff = () => {
  const el = host.value
  if (!el) return

  if (!fileDiff) {
    fileDiff = new FileDiff(baseOptions())
  } else {
    fileDiff.setOptions({
      ...fileDiff.options,
      ...baseOptions()
    })
  }

  const { oldFile, newFile } = buildFiles()
  fileDiff.render({
    oldFile,
    newFile,
    containerWrapper: el
  })
}

watch(
  () => [host.value, props.left, props.right, props.diffStyle, props.themeType, props.filename] as const,
  () => {
    nextTick(() => updateDiff())
  },
  { flush: 'post' }
)

onBeforeUnmount(() => {
  fileDiff?.cleanUp()
  fileDiff = undefined
})
</script>

<template>
  <div
    ref="host"
    class="pierre-diff-host h-full min-h-[12rem] w-full min-w-0 flex flex-col"
  />
</template>

<style scoped>
.pierre-diff-host :deep(diffs-container) {
  display: block;
  flex: 1 1 0%;
  min-height: 0;
  min-width: 0;
}
</style>
