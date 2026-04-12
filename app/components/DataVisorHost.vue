<script setup lang="ts">
withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  { compact: false }
)
</script>

<template>
  <div
    class="dv-unocss-host dv-host-isolated min-h-0 w-full flex flex-col"
    :class="compact ? 'h-auto flex-none' : 'h-full flex-1'"
  >
    <slot />
  </div>
</template>

<style scoped>
.dv-host-isolated {
  isolation: isolate;
}
</style>
