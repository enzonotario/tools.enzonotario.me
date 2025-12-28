<script setup lang="ts">
interface Props {
  split?: 'vertical' | 'horizontal'
  minPercent?: number
  maxPercent?: number
  defaultPercent?: number
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  split: 'vertical',
  minPercent: 10,
  maxPercent: 90,
  defaultPercent: 50,
  storageKey: undefined
})

const splitPaneStore = props.storageKey ? useSplitPaneStore() : null
const percent = ref(props.defaultPercent)
const isDragging = ref(false)

const containerRef = ref<HTMLElement | null>(null)

const onMouseDown = () => {
  isDragging.value = true
  document.body.style.cursor = props.split === 'vertical' ? 'col-resize' : 'row-resize'
  document.body.style.userSelect = 'none'
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const newPercent = props.split === 'vertical'
    ? ((e.clientX - rect.left) / rect.width) * 100
    : ((e.clientY - rect.top) / rect.height) * 100

  if (newPercent >= props.minPercent && newPercent <= props.maxPercent) {
    percent.value = newPercent
    // Save to store and localStorage if storageKey is provided
    if (props.storageKey && splitPaneStore) {
      splitPaneStore.setSize(props.storageKey, newPercent)
    }
  }
}

const onMouseUp = () => {
  isDragging.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onMounted(() => {
  if (import.meta.client) {
    // Load saved size from store if storageKey is provided
    if (props.storageKey && splitPaneStore) {
      const savedPercent = splitPaneStore.getSize(props.storageKey, props.defaultPercent)
      percent.value = savedPercent
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="split-pane-container"
    :class="[`split-${split}`]"
  >
    <div
      class="split-pane-left"
      :style="split === 'vertical' ? { width: `${percent}%` } : { height: `${percent}%` }"
    >
      <slot name="paneL" />
    </div>

    <div
      class="split-pane-resizer"
      :class="[`resizer-${split}`]"
      @mousedown="onMouseDown"
    />

    <div
      class="split-pane-right"
      :style="split === 'vertical' ? { width: `${100 - percent}%` } : { height: `${100 - percent}%` }"
    >
      <slot name="paneR" />
    </div>

    <div
      v-if="isDragging"
      class="split-pane-mask"
    />
  </div>
</template>

<style scoped>
.split-pane-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
}

.split-pane-container.split-vertical {
  flex-direction: row;
}

.split-pane-container.split-horizontal {
  flex-direction: column;
}

.split-pane-left,
.split-pane-right {
  overflow: auto;
  position: relative;
}

.split-pane-left {
  flex-shrink: 0;
}

.split-pane-right {
  flex: 1;
}

.split-pane-resizer {
  flex-shrink: 0;
  background: transparent;
  position: relative;
  z-index: 1;
  transition: background-color 0.2s;
}

.split-pane-resizer:hover {
  background: rgba(0, 0, 0, 0.1);
}

.split-pane-resizer.resizer-vertical {
  width: 4px;
  cursor: col-resize;
  margin: 0 -2px;
}

.split-pane-resizer.resizer-horizontal {
  height: 4px;
  cursor: row-resize;
  margin: -2px 0;
}

.split-pane-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  cursor: col-resize;
}

.split-vertical .split-pane-mask {
  cursor: col-resize;
}

.split-horizontal .split-pane-mask {
  cursor: row-resize;
}
</style>
