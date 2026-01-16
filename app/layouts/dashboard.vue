<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()
const { tools, categories } = useTools()
const route = useRoute()

const navigationItems = computed<NavigationMenuItem[][]>(() => {
  const items: NavigationMenuItem[] = []

  categories.value.forEach((category) => {
    const categoryTools = tools.value.filter(tool => tool.category === category.id)

    if (categoryTools.length > 0) {
      items.push({
        label: category.label,
        icon: category.icon,
        defaultOpen: category.defaultOpen ?? false,
        children: categoryTools.map(tool => ({
          label: tool.label,
          icon: tool.icon,
          to: tool.to,
          active: route.path === tool.to || route.path === localePath(tool.to)
        }))
      })
    }
  })

  return [items]
})

const searchGroups = computed(() => {
  return [{
    id: 'tools',
    label: t('Tools'),
    items: tools.value.map(tool => ({
      id: tool.id,
      label: tool.label,
      icon: tool.icon,
      suffix: tool.description,
      to: localePath(tool.to)
    }))
  }]
})
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      collapsible
      resizable
    >
      <template #header="{ collapsed }">
        <NuxtLink
          :to="localePath('/')"
          class="block"
        >
          <div
            v-if="!collapsed"
            class="flex items-center gap-2 px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div class="flex items-center gap-2">
              <div class="size-8 rounded-lg bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <UIcon
                  name="i-lucide-wrench"
                  class="size-5 text-white"
                />
              </div>
              <div>
                <h1 class="font-bold text-lg text-highlighted">
                  {{ $t('Tools') }}
                </h1>
                <p class="text-xs text-muted">
                  enzonotario.me
                </p>
              </div>
            </div>
          </div>
          <div
            v-else
            class="flex items-center justify-center py-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div class="size-8 rounded-lg bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <UIcon
                name="i-lucide-wrench"
                class="size-5 text-white"
              />
            </div>
          </div>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="navigationItems[0]"
          orientation="vertical"
        />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar
          :ui="{
            center: 'w-full'
          }"
        >
          <template #leading>
            <div class="flex items-center gap-2">
              <UDashboardSidebarCollapse />
            </div>
          </template>

          <template #default>
            <div class="flex items-center gap-2">
              <div
                id="header-actions-portal"
                class="flex items-center gap-2"
              />
            </div>
          </template>

          <template #right>
            <div class="flex items-center gap-2">
              <USelectMenu
                :model-value="locale"
                :items="locales"
                value-key="code"
                label-key="name"
                @update:model-value="(value: string) => navigateTo(switchLocalePath(value as 'en' | 'es'))"
              />
              <UColorModeSwitch />
            </div>
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <UDashboardSearch :groups="searchGroups" />
  </UDashboardGroup>
</template>
