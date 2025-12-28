export interface OgMetadata {
  title?: string
  description?: string
  image?: string
  url?: string
  siteName?: string
  type?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterSite?: string
  twitterCreator?: string
  author?: string
  publishedTime?: string
}

export const useOgMetadataFetcher = () => {
  const fetchMetadata = async (url: string): Promise<OgMetadata> => {
    // Normalizar URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    try {
      // Intentar usar un servicio público de proxy CORS
      // Opción 1: Usar allorigins.win (servicio público)
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`
      const response = await fetch(proxyUrl)

      if (!response.ok) {
        throw new Error('No se pudo obtener los metatags')
      }

      const data = await response.json()
      const html = data.contents

      // Parsear el HTML
      return parseMetadata(html, normalizedUrl)
    } catch (error) {
      console.error('Error fetching metadata:', error)
      throw error
    }
  }

  const parseMetadata = (html: string, baseUrl: string): OgMetadata => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const getMetaContent = (property: string, name?: string) => {
      const byProperty = doc.querySelector(`meta[property="${property}"]`)
      if (byProperty) {
        return byProperty.getAttribute('content')
      }

      if (name) {
        const byName = doc.querySelector(`meta[name="${name}"]`)
        if (byName) {
          return byName.getAttribute('content')
        }
      }

      return null
    }

    const getAbsoluteUrl = (url: string | null | undefined) => {
      if (!url) return undefined
      try {
        return new URL(url, baseUrl).href
      } catch {
        return url
      }
    }

    const title = getMetaContent('og:title') || doc.querySelector('title')?.textContent || undefined
    const description = getMetaContent('og:description') || getMetaContent('description') || undefined
    const image = getAbsoluteUrl(getMetaContent('og:image'))
    const url = getMetaContent('og:url') || baseUrl

    return {
      title,
      description,
      image,
      url,
      siteName: getMetaContent('og:site_name') || undefined,
      type: getMetaContent('og:type') || undefined,
      twitterCard: getMetaContent('twitter:card') || undefined,
      twitterTitle: getMetaContent('twitter:title') || undefined,
      twitterDescription: getMetaContent('twitter:description') || undefined,
      twitterImage: getAbsoluteUrl(getMetaContent('twitter:image')),
      twitterSite: getMetaContent('twitter:site') || undefined,
      twitterCreator: getMetaContent('twitter:creator') || undefined,
      author: getMetaContent('author') || undefined,
      publishedTime: getMetaContent('article:published_time') || undefined
    }
  }

  return {
    fetchMetadata
  }
}
