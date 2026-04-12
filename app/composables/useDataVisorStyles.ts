let dataVisorStylesPromise: Promise<void> | null = null

export function useDataVisorStyles(): void {
  if (!import.meta.client) return
  if (!dataVisorStylesPromise) {
    dataVisorStylesPromise = import('data-visor-vue/style.css').then(() => {})
  }
  onMounted(() => {
    void dataVisorStylesPromise
  })
}
