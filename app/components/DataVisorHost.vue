<template>
  <div
    class="dv-unocss-host dv-host-isolated h-full min-h-0 w-full flex flex-col flex-1"
  >
    <slot />
  </div>
</template>

<style scoped>
.dv-host-isolated {
  isolation: isolate;
}
</style>
