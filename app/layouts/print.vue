<script setup lang="ts">
// Forzar modo light en el layout de impresión
const colorMode = useColorMode()
const previousColorMode = ref<string | null>(null)

onMounted(() => {
  if (import.meta.client) {
    // Guardar el modo anterior
    previousColorMode.value = colorMode.value
    // Forzar modo light
    colorMode.preference = 'light'
  }
})

onUnmounted(() => {
  if (import.meta.client && previousColorMode.value) {
    // Restaurar el modo anterior al salir del layout
    colorMode.preference = previousColorMode.value
  }
})
</script>

<template>
  <div class="light">
    <slot />
  </div>
</template>

<style>
/* Forzar modo light en todo el layout de impresión */
.light,
.light :deep(*) {
  color-scheme: light;
}

@media print {
  @page {
    margin: 0;
    size: A4;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: white;
  }
}
</style>
