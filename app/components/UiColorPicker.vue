<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const format = ref<'hex' | 'rgb' | 'hsl'>('hex')

const formatOptions = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' }
]

const hexInput = ref(props.modelValue)
const parts = ref<[number, number, number]>([0, 0, 0])

function parseColorToRgb(value: string): [number, number, number] | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#000000'
  ctx.fillStyle = value
  const computed = ctx.fillStyle
  if (computed === '#000000' && value.trim().toLowerCase() !== '#000000' && value.trim().toLowerCase() !== 'black') return null
  ctx.fillRect(0, 0, 1, 1)
  const data = ctx.getImageData(0, 0, 1, 1).data
  return [data[0]!, data[1]!, data[2]!]
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
        break
      case gn:
        h = ((bn - rn) / d + 2) / 6
        break
      case bn:
        h = ((rn - gn) / d + 4) / 6
        break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function convertColorTo(value: string, toFormat: 'hex' | 'rgb' | 'hsl'): string {
  const rgb = parseColorToRgb(value)
  if (!rgb) return value
  const [r, g, b] = rgb
  if (toFormat === 'hex') return rgbToHex(r, g, b)
  if (toFormat === 'rgb') return `rgb(${r}, ${g}, ${b})`
  const [h, s, l] = rgbToHsl(r, g, b)
  return `hsl(${h}, ${s}%, ${l}%)`
}

function syncFromModelValue(value: string, fmt: typeof format.value) {
  if (fmt === 'hex') {
    hexInput.value = value
  } else if (fmt === 'rgb') {
    const rgb = parseColorToRgb(value)
    if (rgb) parts.value = rgb
  } else if (fmt === 'hsl') {
    const rgb = parseColorToRgb(value)
    if (rgb) parts.value = rgbToHsl(...rgb)
  }
}

watch(() => props.modelValue, (val) => {
  syncFromModelValue(val, format.value)
})

watch(format, (newFormat) => {
  const converted = convertColorTo(props.modelValue, newFormat)
  emit('update:modelValue', converted)
  syncFromModelValue(converted, newFormat)
})

onMounted(() => syncFromModelValue(props.modelValue, format.value))

const pickerColor = computed({
  get: () => props.modelValue,
  set: (val) => {
    syncFromModelValue(val, format.value)
    emit('update:modelValue', val)
  }
})

function onHexInput(val: string) {
  const rgb = parseColorToRgb(val)
  if (rgb) emit('update:modelValue', convertColorTo(val, 'hex'))
}

function onHexBlur() {
  const rgb = parseColorToRgb(hexInput.value)
  if (rgb) {
    const converted = convertColorTo(hexInput.value, 'hex')
    hexInput.value = converted
    emit('update:modelValue', converted)
  } else {
    hexInput.value = props.modelValue
  }
}

const partMeta = {
  rgb: [
    { label: 'R', min: 0, max: 255 },
    { label: 'G', min: 0, max: 255 },
    { label: 'B', min: 0, max: 255 }
  ],
  hsl: [
    { label: 'H', min: 0, max: 360 },
    { label: 'S', min: 0, max: 100 },
    { label: 'L', min: 0, max: 100 }
  ]
}

function onPartChange(index: number, raw: string | number) {
  const meta = partMeta[format.value as 'rgb' | 'hsl'][index]
  if (!meta) return
  const val = Math.min(meta.max, Math.max(0, Number(raw)))
  if (Number.isNaN(val)) return
  const updated = [...parts.value] as [number, number, number]
  updated[index] = val
  parts.value = updated
  let color: string
  if (format.value === 'rgb') {
    color = `rgb(${updated[0]}, ${updated[1]}, ${updated[2]})`
  } else {
    color = `hsl(${updated[0]}, ${updated[1]}%, ${updated[2]}%)`
  }
  emit('update:modelValue', color)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <UTabs
      v-model="format"
      :content="false"
      :items="formatOptions"
      size="xs"
      color="neutral"
      variant="pill"
    />
    <div class="flex items-start gap-3">
      <UColorPicker
        v-model="pickerColor"
        :format="format"
        size="xs"
      />
      <div class="flex flex-col gap-1.5">
        <template v-if="format === 'hex'">
          <UInput
            v-model="hexInput"
            size="xs"
            class="font-mono w-32"
            @update:model-value="onHexInput"
            @blur="onHexBlur"
          />
        </template>
        <template v-else>
          <div
            v-for="(meta, i) in partMeta[format as 'rgb' | 'hsl']"
            :key="meta.label"
            class="flex items-center gap-1.5"
          >
            <span class="text-xs text-muted w-3 text-right font-mono">{{ meta.label }}</span>
            <UInput
              :model-value="parts[i]"
              type="number"
              :min="meta.min"
              :max="meta.max"
              size="xs"
              class="font-mono w-20"
              @update:model-value="onPartChange(i, $event)"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
