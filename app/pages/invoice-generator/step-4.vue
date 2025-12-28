<script setup lang="ts">
const invoiceStore = useInvoiceStore()

// Use toRefs to make nested properties reactive
const payment = toRefs(invoiceStore.invoiceData).payment

// Watch for changes and save to localStorage
watch(payment, () => {
  invoiceStore.saveToLocalStorage()
}, { deep: true })
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">
      Detalles de Pago
    </h2>

    <div class="space-y-4">
      <UFormField label="Nombre del Banco">
        <UInput
          v-model="payment.bankName"
          placeholder="Nombre del banco"
        />
      </UFormField>

      <UFormField label="Número de Cuenta">
        <UInput
          v-model="payment.accountNumber"
          placeholder="Número de cuenta"
        />
      </UFormField>

      <UFormField label="Nombre de la Cuenta">
        <UInput
          v-model="payment.accountName"
          placeholder="Nombre del titular de la cuenta"
        />
      </UFormField>

      <UFormField label="IFSC Code">
        <UInput
          v-model="payment.ifscCode"
          placeholder="IFSC Code"
        />
      </UFormField>

      <UFormField label="Routing Number">
        <UInput
          v-model="payment.routingNumber"
          placeholder="Routing Number"
        />
      </UFormField>

      <UFormField label="Swift Code">
        <UInput
          v-model="payment.swiftCode"
          placeholder="Swift Code"
        />
      </UFormField>
    </div>
  </div>
</template>
