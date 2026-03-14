import LZString from 'lz-string'

export const useShare = () => {
  const { t } = useI18n()
  const toast = useToast()
  const route = useRoute()
  const router = useRouter()

  const share = async (data: unknown) => {
    try {
      const jsonStr = JSON.stringify(data)
      const compressed = LZString.compressToEncodedURIComponent(jsonStr)

      const url = new URL(window.location.href)
      url.searchParams.set('s', compressed)

      // Update the URL in the address bar without reloading
      await router.replace({ query: { ...route.query, s: compressed } })

      await navigator.clipboard.writeText(url.toString())

      toast.add({
        title: t('Shared'),
        description: t('Link copied to clipboard'),
        icon: 'i-lucide-share-2',
        color: 'success'
      })
    } catch (err) {
      console.error('Failed to share:', err)
      toast.add({
        title: t('Error'),
        description: t('Failed to generate share link'),
        icon: 'i-lucide-alert-circle',
        color: 'error'
      })
    }
  }

  const getSharedData = <T>(): T | null => {
    const shared = route.query.s as string
    if (!shared) return null

    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(shared)
      if (!decompressed) return null
      return JSON.parse(decompressed) as T
    } catch (err) {
      console.error('Failed to parse shared data:', err)
      return null
    }
  }

  return {
    share,
    getSharedData
  }
}
