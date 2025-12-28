<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const { tools, categories } = useTools()

const toolsByCategory = computed(() => {
  return categories.value.map(category => ({
    ...category,
    tools: tools.value.filter(tool => tool.category === category.id)
  })).filter(category => category.tools.length > 0)
})
</script>

<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-highlighted mb-2">
        {{ $t('Tools') }}
      </h1>
      <p class="text-muted">
        {{ $t('Collection of useful tools for developers and professionals') }}
      </p>
    </div>

    <div
      v-for="category in toolsByCategory"
      :key="category.id"
      class="mb-8"
    >
      <div class="flex items-center gap-2 mb-4">
        <UIcon
          :name="category.icon"
          class="size-5 text-primary"
        />
        <h2 class="text-xl font-semibold text-highlighted">
          {{ category.label }}
        </h2>
      </div>

      <UPageGrid>
        <NuxtLink
          v-for="tool in category.tools"
          :key="tool.id"
          :to="tool.to"
          class="block"
        >
          <UCard
            class="hover:shadow-lg transition-shadow cursor-pointer h-full"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <UIcon
                    :name="tool.icon"
                    class="size-5 text-primary"
                  />
                </div>
                <div>
                  <h3 class="font-semibold text-highlighted">
                    {{ tool.label }}
                  </h3>
                </div>
              </div>
            </template>

            <p class="text-sm text-muted">
              {{ tool.description }}
            </p>
          </UCard>
        </NuxtLink>
      </UPageGrid>
    </div>

    <div
      v-if="toolsByCategory.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-lucide-wrench"
        class="size-12 text-muted mx-auto mb-4"
      />
      <p class="text-muted">
        {{ $t('No tools available yet') }}
      </p>
    </div>
  </div>
</template>
