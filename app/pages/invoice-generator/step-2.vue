<script setup lang="ts">
const invoiceStore = useInvoiceStore()

// Use toRefs to make nested properties reactive
const to = toRefs(invoiceStore.invoiceData).to

// Watch for changes and save to localStorage
watch(to, () => {
  invoiceStore.saveToLocalStorage()
}, { deep: true })
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">
      Detalles de la Empresa (Para)
    </h2>

    <div class="space-y-6">
      <UFormField
        label="E-mail"
        help="Llenaremos los detalles de facturación automáticamente si encontramos la empresa"
      >
        <UInput
          v-model="to.email"
          placeholder="E-mail de la empresa"
        />
      </UFormField>

      <div>
        <h3 class="text-lg font-semibold mb-4">
          Detalles de facturación
        </h3>

        <div class="space-y-4">
          <UFormField label="Nombre de la Empresa">
            <UInput
              v-model="to.companyName"
              placeholder="Nombre de la empresa"
            />
          </UFormField>

          <UFormField label="Logo">
            <UInput
              v-model="to.logo"
              placeholder="URL del logo"
            />
          </UFormField>

          <UFormField label="Dirección">
            <UInput
              v-model="to.address"
              placeholder="Dirección"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Ciudad">
              <UInput
                v-model="to.city"
                placeholder="Ciudad"
              />
            </UFormField>
            <UFormField label="Estado/Provincia">
              <UInput
                v-model="to.state"
                placeholder="Estado/Provincia"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Código Postal">
              <UInput
                v-model="to.zip"
                placeholder="Código Postal"
              />
            </UFormField>
            <UFormField label="País">
              <UInput
                v-model="to.country"
                placeholder="País"
              />
            </UFormField>
          </div>

          <UFormField label="Tax ID">
            <UInput
              v-model="to.taxId"
              placeholder="Tax ID"
            />
          </UFormField>
        </div>
      </div>
    </div>
  </div>
</template>
