export interface OgMetadata {
  title?: string
  description?: string
  image?: string
  url?: string
  siteName?: string
  type?: string
  // Twitter specific
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterSite?: string
  twitterCreator?: string
  // Additional
  author?: string
  publishedTime?: string
}

export interface PlatformPreview {
  platform: string
  title: string
  description: string
  image: string
  url: string
  siteName?: string
  additionalInfo?: string
}

export const useOgDebugger = () => {
  const { t } = useI18n()
  const metadata = ref<OgMetadata | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { fetchMetadata } = useOgMetadataFetcher()

  const fetchOgMetadata = async (url: string) => {
    if (!url) {
      error.value = t('Please enter a URL')
      return
    }

    loading.value = true
    error.value = null
    metadata.value = null

    try {
      const data = await fetchMetadata(url)
      metadata.value = data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : t('Error fetching metatags')
      console.error('Error fetching OG metadata:', err)
    } finally {
      loading.value = false
    }
  }

  const getPlatformPreview = (platform: string): PlatformPreview | null => {
    if (!metadata.value) return null

    const meta = metadata.value
    const isTwitter = platform.toLowerCase().includes('twitter') || platform.toLowerCase().includes('x')

    return {
      platform,
      title: isTwitter ? (meta.twitterTitle || meta.title || t('No title')) : (meta.title || t('No title')),
      description: isTwitter
        ? (meta.twitterDescription || meta.description || t('No description'))
        : (meta.description || t('No description')),
      image: isTwitter ? (meta.twitterImage || meta.image || '') : (meta.image || ''),
      url: meta.url || '',
      siteName: meta.siteName || '',
      additionalInfo: meta.publishedTime || meta.author || undefined
    }
  }

  return {
    metadata: readonly(metadata),
    loading: readonly(loading),
    error: readonly(error),
    fetchOgMetadata,
    getPlatformPreview
  }
}
