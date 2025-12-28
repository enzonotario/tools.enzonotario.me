<script setup lang="ts">
const invoiceStore = useInvoiceStore()
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">
      Tu factura está lista
    </h2>

    <p class="text-muted mb-6">
      Por favor revisa los detalles cuidadosamente antes de descargar tu factura.
    </p>

    <div class="space-y-4">
      <UCard>
        <template #header>
          <h3 class="font-semibold">
            Resumen
          </h3>
        </template>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Subtotal:</span>
            <span>{{ invoiceStore.invoiceData.details.currency }} {{ invoiceStore.subtotal.toFixed(2) }}</span>
          </div>
          <div
            v-if="invoiceStore.invoiceData.details.discount > 0"
            class="flex justify-between"
          >
            <span>Descuento ({{ invoiceStore.invoiceData.details.discount }}%):</span>
            <span>- {{ invoiceStore.invoiceData.details.currency }} {{ invoiceStore.discountAmount.toFixed(2) }}</span>
          </div>
          <div
            v-if="invoiceStore.invoiceData.details.tax > 0"
            class="flex justify-between"
          >
            <span>Impuesto ({{ invoiceStore.invoiceData.details.tax }}%):</span>
            <span>{{ invoiceStore.invoiceData.details.currency }} {{ invoiceStore.taxAmount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total:</span>
            <span>{{ invoiceStore.invoiceData.details.currency }} {{ invoiceStore.total.toFixed(2) }}</span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
