<script setup lang="ts">
const invoiceStore = useInvoiceStore()

// Use toRefs to make nested properties reactive
const details = toRefs(invoiceStore.invoiceData).details

// Watch for changes and save to localStorage
watch(details, () => {
  invoiceStore.saveToLocalStorage()
}, { deep: true })

const currencies = [
  { label: 'USD - United States Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'ARS - Argentine Peso', value: 'ARS' }
]
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">
      Detalles de la Factura
    </h2>

    <div class="space-y-6">
      <UFormField label="Moneda">
        <USelectMenu
          v-model="details.currency"
          :items="currencies"
          value-key="value"
        />
      </UFormField>

      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">
            Items
          </h3>
          <UButton
            icon="i-lucide-plus"
            @click="invoiceStore.addItem()"
          >
            Agregar Item
          </UButton>
        </div>

        <div class="space-y-4">
          <div
            v-for="item in details.items"
            :key="item.id"
            class="p-4 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4"
          >
            <div class="flex justify-between items-start">
              <h4 class="font-medium">
                Item #{{ details.items.indexOf(item) + 1 }}
              </h4>
              <UButton
                icon="i-lucide-trash"
                color="error"
                variant="ghost"
                size="sm"
                @click="invoiceStore.removeItem(item.id)"
              />
            </div>

            <UFormField label="Descripción">
              <UInput
                :model-value="item.description"
                placeholder="Descripción del item"
                @update:model-value="invoiceStore.updateItem(item.id, 'description', $event)"
              />
            </UFormField>

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="Cantidad">
                <UInput
                  :model-value="item.quantity"
                  type="number"
                  @update:model-value="invoiceStore.updateItem(item.id, 'quantity', Number($event))"
                />
              </UFormField>
              <UFormField label="Precio">
                <UInput
                  :model-value="item.price"
                  type="number"
                  @update:model-value="invoiceStore.updateItem(item.id, 'price', Number($event))"
                />
              </UFormField>
              <UFormField label="Total">
                <UInput
                  :model-value="item.amount"
                  disabled
                />
              </UFormField>
            </div>
          </div>

          <div
            v-if="details.items.length === 0"
            class="text-center py-8 text-muted"
          >
            No hay items. Haz clic en "Agregar Item" para comenzar.
          </div>
        </div>
      </div>

      <UFormField label="Nota">
        <UTextarea
          v-model="details.note"
          placeholder="Nota adicional (opcional)"
          :rows="3"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Descuento (%)">
          <UInput
            v-model.number="details.discount"
            type="number"
            min="0"
            max="100"
          />
        </UFormField>
        <UFormField label="Impuesto (%)">
          <UInput
            v-model.number="details.tax"
            type="number"
            min="0"
            max="100"
          />
        </UFormField>
      </div>
    </div>
  </div>
</template>
