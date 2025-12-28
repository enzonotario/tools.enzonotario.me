<script setup lang="ts">
const invoiceStore = useInvoiceStore()

// Use toRefs to make nested properties reactive
const from = toRefs(invoiceStore.invoiceData).from

// Watch for changes and save to localStorage
watch(from, () => {
  invoiceStore.saveToLocalStorage()
}, { deep: true })
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">
      Tus Detalles (De)
    </h2>

    <div class="space-y-6">
      <UFormField
        label="E-mail"
      >
        <UInput
          v-model="from.email"
          placeholder="Tu E-mail"
        />
      </UFormField>

      <div>
        <h3 class="text-lg font-semibold mb-4">
          Detalles de facturación
        </h3>

        <div class="space-y-4">
          <UFormField label="Tu Nombre">
            <UInput
              v-model="from.name"
              placeholder="Tu nombre completo"
            />
          </UFormField>

          <UFormField label="Logo">
            <UInput
              v-model="from.logo"
              placeholder="URL del logo"
            />
          </UFormField>

          <UFormField label="Dirección">
            <UInput
              v-model="from.address"
              placeholder="Dirección"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Ciudad">
              <UInput
                v-model="from.city"
                placeholder="Ciudad"
              />
            </UFormField>
            <UFormField label="Estado/Provincia">
              <UInput
                v-model="from.state"
                placeholder="Estado/Provincia"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Código Postal">
              <UInput
                v-model="from.zip"
                placeholder="Código Postal"
              />
            </UFormField>
            <UFormField label="País">
              <UInput
                v-model="from.country"
                placeholder="País"
              />
            </UFormField>
          </div>

          <UFormField label="Tax ID">
            <UInput
              v-model="from.taxId"
              placeholder="Tax ID"
            />
          </UFormField>
        </div>
      </div>
    </div>
  </div>
</template>
