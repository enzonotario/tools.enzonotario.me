<script setup lang="ts">
import { DataVisor } from 'data-visor-vue'

interface Props {
  data: unknown[]
}

const props = defineProps<Props>()

const colorMode = useColorMode()
const isVisorDark = computed(() => colorMode.value === 'dark')

type Row = Record<string, unknown>
type KeyValueRow = { key: string, value: unknown }
type IndexValueRow = { index: number, value: unknown }

const tableData = computed(() => {
  if (props.data.length === 0) return null

  // Flatten: if single item that's an array, use it
  const items = props.data.length === 1 && Array.isArray(props.data[0])
    ? (props.data[0] as unknown[])
    : props.data

  if (items.length === 0) return null

  // Array of objects
  if (items.every(item => item !== null && typeof item === 'object' && !Array.isArray(item))) {
    const columns = Array.from(
      new Set(items.flatMap(item => Object.keys(item as Row)))
    )
    return {
      type: 'objects' as const,
      columns,
      rows: items as Row[]
    }
  }

  // Single object (not array)
  if (items.length === 1 && items[0] !== null && typeof items[0] === 'object' && !Array.isArray(items[0])) {
    const obj = items[0] as Row
    return {
      type: 'single-object' as const,
      columns: ['key', 'value'],
      rows: Object.entries(obj).map(([key, value]) => ({ key, value }))
    }
  }

  // Array of primitives or mixed
  return {
    type: 'primitives' as const,
    columns: ['index', 'value'],
    rows: items.map((value, index) => ({ index, value }))
  }
})

const jsonForVisor = (value: unknown): string => JSON.stringify(value, null, 2)

const isComplex = (value: unknown): boolean =>
  value !== null && typeof value === 'object'

function cellAt(row: Row | KeyValueRow | IndexValueRow, col: string): unknown {
  return (row as Record<string, unknown>)[col]
}
</script>

<template>
  <div
    v-if="!tableData"
    class="flex-1 flex items-center justify-center text-muted text-sm"
  >
    {{ $t('No data to display') }}
  </div>
  <div
    v-else
    class="flex-1 min-h-0 overflow-auto"
  >
    <table class="w-full text-sm border-collapse">
      <thead class="sticky top-0 z-10">
        <tr class="bg-gray-100 dark:bg-gray-800">
          <th
            v-for="col in tableData.columns"
            :key="col"
            class="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap"
          >
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in tableData.rows"
          :key="rowIndex"
          class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30"
        >
          <td
            v-for="col in tableData.columns"
            :key="col"
            class="px-3 py-2 align-top"
          >
            <div
              v-if="isComplex(cellAt(row, col))"
              class="w-full min-w-0 max-h-96 overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40"
            >
              <DataVisorHost compact>
                <DataVisor
                  :data="jsonForVisor(cellAt(row, col))"
                  lang="json"
                  :is-dark="isVisorDark"
                  :show-line-numbers="false"
                  :show-toolbar="false"
                  :show-breadcrumb="false"
                  max-height="max-content"
                  class="text-sm"
                />
              </DataVisorHost>
            </div>
            <span
              v-else-if="cellAt(row, col) === null"
              class="text-gray-400 dark:text-gray-500 italic text-xs"
            >null</span>
            <span
              v-else-if="typeof cellAt(row, col) === 'boolean'"
              :class="cellAt(row, col) ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'"
              class="font-mono text-xs"
            >
              {{ cellAt(row, col) }}
            </span>
            <span
              v-else-if="typeof cellAt(row, col) === 'number'"
              class="font-mono text-xs text-blue-600 dark:text-blue-400"
            >
              {{ cellAt(row, col) }}
            </span>
            <span v-else>{{ cellAt(row, col) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
