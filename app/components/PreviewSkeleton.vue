<template>
  <div class="invoice-preview-wrapper">
    <div class="invoice-preview max-w-4xl mx-auto bg-white">
      <!-- Header Skeleton -->
      <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
        <div>
          <USkeleton class="h-3 w-20 mb-2" />
          <USkeleton class="h-6 w-16" />
        </div>
        <div class="flex gap-8 items-center">
          <div class="text-right">
            <USkeleton class="h-3 w-16 mb-2" />
            <USkeleton class="h-5 w-24" />
          </div>
          <div class="text-right">
            <USkeleton class="h-3 w-16 mb-2" />
            <USkeleton class="h-5 w-24" />
          </div>
        </div>
      </div>

      <!-- From/To Section Skeleton -->
      <div class="grid grid-cols-2 gap-12 mb-6">
        <div>
          <USkeleton class="h-4 w-12 mb-3" />
          <div class="space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-4 w-40" />
            <USkeleton class="h-4 w-36" />
            <USkeleton class="h-4 w-20" />
          </div>
        </div>
        <div>
          <USkeleton class="h-4 w-8 mb-3" />
          <div class="space-y-2">
            <USkeleton class="h-4 w-28" />
            <USkeleton class="h-4 w-44" />
            <USkeleton class="h-4 w-40" />
            <USkeleton class="h-4 w-24" />
          </div>
        </div>
      </div>

      <!-- Items Table Skeleton -->
      <div class="mb-6">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="border border-gray-200 px-3 py-2">
                <USkeleton class="h-4 w-20" />
              </th>
              <th class="border border-gray-200 px-3 py-2">
                <USkeleton class="h-4 w-12 mx-auto" />
              </th>
              <th class="border border-gray-200 px-3 py-2">
                <USkeleton class="h-4 w-16 ml-auto" />
              </th>
              <th class="border border-gray-200 px-3 py-2">
                <USkeleton class="h-4 w-16 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="i in 2"
              :key="i"
            >
              <td class="border border-gray-200 px-3 py-2">
                <USkeleton class="h-4 w-full" />
              </td>
              <td class="border border-gray-200 px-3 py-2">
                <USkeleton class="h-4 w-8 mx-auto" />
              </td>
              <td class="border border-gray-200 px-3 py-2">
                <USkeleton class="h-4 w-16 ml-auto" />
              </td>
              <td class="border border-gray-200 px-3 py-2">
                <USkeleton class="h-4 w-16 ml-auto" />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td
                colspan="3"
                class="border border-gray-200 px-3 py-2"
              >
                <USkeleton class="h-4 w-16 ml-auto" />
              </td>
              <td class="border border-gray-200 px-3 py-2">
                <USkeleton class="h-4 w-20 ml-auto" />
              </td>
            </tr>
            <tr>
              <td
                colspan="3"
                class="border border-gray-200 px-3 py-2"
              >
                <USkeleton class="h-5 w-12 ml-auto" />
              </td>
              <td class="border border-gray-200 px-3 py-2">
                <USkeleton class="h-5 w-20 ml-auto" />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Note Skeleton -->
      <div class="mb-6">
        <USkeleton class="h-4 w-16 mb-2" />
        <USkeleton class="h-4 w-32" />
      </div>

      <!-- Payment Details and Payable In Skeleton -->
      <div class="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200">
        <div>
          <USkeleton class="h-4 w-24 mb-3" />
          <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            <USkeleton class="h-4 w-20" />
            <USkeleton class="h-4 w-28" />
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-4 w-20" />
            <USkeleton class="h-4 w-36" />
          </div>
        </div>
        <div>
          <USkeleton class="h-4 w-20 mb-2" />
          <div class="flex items-center gap-2">
            <USkeleton class="w-8 h-8 rounded-full" />
            <div class="flex flex-col gap-1">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invoice-preview-wrapper {
  padding: 0;
  min-height: 100vh;
  background-color: transparent;
}

.invoice-preview {
  padding: 2.5rem;
  box-shadow: none;
}

@media print {
  .invoice-preview-wrapper {
    padding: 0;
    background-color: white;
  }

  .invoice-preview {
    padding: 2rem;
    max-width: 100%;
    box-shadow: none;
  }
}
</style>
