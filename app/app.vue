<script setup>
const { t } = useI18n()
const locale = useI18n()
const route = useRoute()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: locale.locale.value
  }
})

const title = computed(() => t('Tools - enzonotario.me'))
const description = computed(() => t('Useful tools for developers and professionals'))

const baseUrl = 'https://tools.enzonotario.me'

const currentUrl = computed(() => {
  const path = route.path === '/' ? '' : route.path
  return `${baseUrl}${path}`
})

const ogImage = computed(() => `${baseUrl}/assets/og.png`)

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage,
  ogImageAlt: title,
  ogUrl: currentUrl,
  ogType: 'website',
  ogSiteName: 'Tools - enzonotario.me',
  ogLocale: locale.locale.value,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: ogImage,
  twitterImageAlt: title
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
