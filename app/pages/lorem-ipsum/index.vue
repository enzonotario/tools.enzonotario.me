<script setup lang="ts">
import { LoremIpsum } from 'lorem-ipsum'

definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
const toast = useToast()

const paragraphs = ref(3)
const sentencesPerParagraph = ref(5)
const wordsPerSentence = ref(10)
const startWithLoremIpsum = ref(true)
const asHtml = ref(false)
const generatedText = ref('')

const lorem = computed(() => {
  return new LoremIpsum({
    sentencesPerParagraph: {
      max: sentencesPerParagraph.value,
      min: sentencesPerParagraph.value
    },
    wordsPerSentence: {
      max: wordsPerSentence.value,
      min: wordsPerSentence.value
    }
  })
})

const generateLoremIpsum = () => {
  const text = lorem.value.generateParagraphs(paragraphs.value)

  if (asHtml.value) {
    // Convert to HTML paragraphs
    const paragraphsArray = text.split('\n\n')
    generatedText.value = paragraphsArray.map(p => `<p>${p}</p>`).join('\n')
  } else {
    generatedText.value = text
  }

  // If startWithLoremIpsum is false, remove "Lorem ipsum" from the start
  if (!startWithLoremIpsum.value && generatedText.value.toLowerCase().startsWith('lorem ipsum')) {
    // Replace first occurrence of "Lorem ipsum" with a random word
    const randomWords = ['Sed', 'Duis', 'Ut', 'Nam', 'Vestibulum', 'Integer', 'Nulla', 'Pellentesque']
    const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)] || 'Sed'
    generatedText.value = generatedText.value.replace(/^Lorem ipsum/i, randomWord)
  }
}

const copyToClipboard = async () => {
  if (!generatedText.value) return

  try {
    await navigator.clipboard.writeText(generatedText.value)
    toast.add({
      title: t('Copied'),
      description: t('Copied to clipboard'),
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
  } catch (e) {
    console.error('Failed to copy:', e)
    toast.add({
      title: t('Failed to copy'),
      description: t('Failed to copy'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

// Funciones para manejar el scroll del mouse en cada slider
const handleParagraphsWheel = (event: WheelEvent) => {
  event.preventDefault()
  event.stopPropagation()
  const delta = event.deltaY > 0 ? -1 : 1
  const newValue = Math.max(1, Math.min(20, paragraphs.value + delta))
  paragraphs.value = newValue
}

const handleSentencesWheel = (event: WheelEvent) => {
  event.preventDefault()
  event.stopPropagation()
  const delta = event.deltaY > 0 ? -1 : 1
  const newValue = Math.max(1, Math.min(20, sentencesPerParagraph.value + delta))
  sentencesPerParagraph.value = newValue
}

const handleWordsWheel = (event: WheelEvent) => {
  event.preventDefault()
  event.stopPropagation()
  const delta = event.deltaY > 0 ? -1 : 1
  const newValue = Math.max(1, Math.min(30, wordsPerSentence.value + delta))
  wordsPerSentence.value = newValue
}

// Watch for changes and regenerate
watch([paragraphs, sentencesPerParagraph, wordsPerSentence, startWithLoremIpsum, asHtml], () => {
  generateLoremIpsum()
}, { immediate: true })

// Generate on mount
onMounted(() => {
  generateLoremIpsum()
})
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <Teleport to="#header-actions-portal">
      <div class="flex items-center gap-2">
        <UButton
          size="sm"
          icon="i-lucide-copy"
          :disabled="!generatedText"
          @click="copyToClipboard"
        >
          {{ $t('Copy') }}
        </UButton>
        <UButton
          variant="outline"
          size="sm"
          icon="i-lucide-refresh-cw"
          @click="generateLoremIpsum"
        >
          {{ $t('Refresh') }}
        </UButton>
      </div>
    </Teleport>

    <div class="flex-1 flex flex-col gap-6 p-6 min-h-0">
      <UCard class="shrink-0">
        <div class="flex flex-col gap-5 p-6 h-full">
          <UFormField
            :label="$t('Paragraphs')"
            class="cursor-pointer rounded-md p-3 -m-3 transition-all hover:outline hover:outline-2 hover:outline-primary hover:outline-offset-2"
            @wheel.stop.prevent="handleParagraphsWheel"
          >
            <div class="flex items-center gap-4 mt-2">
              <div class="flex-1">
                <USlider
                  v-model="paragraphs"
                  :min="1"
                  :max="20"
                  :step="1"
                  class="w-full"
                />
              </div>
              <span class="text-sm font-medium min-w-12 text-right text-highlighted">{{ paragraphs }}</span>
            </div>
          </UFormField>

          <UFormField
            :label="$t('Sentences per paragraph')"
            class="cursor-pointer rounded-md p-3 -m-3 transition-all hover:outline hover:outline-2 hover:outline-primary hover:outline-offset-2"
            @wheel.stop.prevent="handleSentencesWheel"
          >
            <div class="flex items-center gap-4 mt-2">
              <div class="flex-1">
                <USlider
                  v-model="sentencesPerParagraph"
                  :min="1"
                  :max="20"
                  :step="1"
                  class="w-full"
                />
              </div>
              <span class="text-sm font-medium min-w-12 text-right text-highlighted">{{ sentencesPerParagraph }}</span>
            </div>
          </UFormField>

          <UFormField
            :label="$t('Words per sentence')"
            class="cursor-pointer rounded-md p-3 -m-3 transition-all hover:outline hover:outline-2 hover:outline-primary hover:outline-offset-2"
            @wheel.stop.prevent="handleWordsWheel"
          >
            <div class="flex items-center gap-4 mt-2">
              <div class="flex-1">
                <USlider
                  v-model="wordsPerSentence"
                  :min="1"
                  :max="30"
                  :step="1"
                  class="w-full"
                />
              </div>
              <span class="text-sm font-medium min-w-12 text-right text-highlighted">{{ wordsPerSentence }}</span>
            </div>
          </UFormField>

          <UFormField
            class="cursor-pointer rounded-md p-3 -m-3 transition-all hover:outline hover:outline-2 hover:outline-primary hover:outline-offset-2 pt-3 mt-2"
            @click="startWithLoremIpsum = !startWithLoremIpsum"
          >
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-highlighted">{{ $t('Start with lorem ipsum ?') }}</label>
              <USwitch
                v-model="startWithLoremIpsum"
                @click.stop
              />
            </div>
          </UFormField>

          <UFormField
            class="cursor-pointer rounded-md p-3 -m-3 transition-all hover:outline hover:outline-2 hover:outline-primary hover:outline-offset-2 pt-2"
            @click="asHtml = !asHtml"
          >
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-highlighted">{{ $t('As html?') }}</label>
              <USwitch
                v-model="asHtml"
                @click.stop
              />
            </div>
          </UFormField>
        </div>
      </UCard>

      <div class="flex-1 min-h-0 flex flex-col h-full">
        <UTextarea
          :model-value="generatedText"
          :placeholder="$t('Generated text will appear here...')"
          class="font-mono text-sm h-full"
          :ui="{
            base: 'block w-full resize-none h-full min-h-0'
          }"
          readonly
        />
      </div>
    </div>
  </div>
</template>
