<script setup lang="ts">
type LatencyUnit = 'ns' | 'us' | 'ms' | 's' | 'min'
type SpeedMapping = 'log' | 'linear'
type EditorView = 'cards' | 'table'

interface LatencyItem {
  id: string
  label: string
  latency: number
  unit: LatencyUnit
  delay: number
  color: string
  imageFile: File | null
  imageDataUrl: string
  imageName: string
}

interface CanvasPoint {
  x: number
  y: number
}

definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
useSeoMeta({ title: t('Latency Animator') })
const toast = useToast()

let nextItemId = 0
let animationFrame = 0
let resizeObserver: ResizeObserver | null = null
let lastFrameTimestamp = 0
const minPlaybackSpeed = 1
const maxPlaybackSpeed = 20

const previewCanvas = ref<HTMLCanvasElement | null>(null)
const previewWrap = ref<HTMLElement | null>(null)
const isPlaying = ref(true)
const isExporting = ref(false)
const isRecording = ref(false)
const exportCountdown = ref<number | null>(null)
const recordingProgress = ref(0)
const elapsedMs = ref(0)
const animationTitle = ref(t('latencyAnimatorTitle'))
const sourceLabel = ref('CPU')
const sourceImageFile = ref<File | null>(null)
const sourceImageDataUrl = ref('')
const sourceImageName = ref('')
let sourceImageElement: HTMLImageElement | null = null
const playbackSpeed = ref(1)
const speedMapping = ref<SpeedMapping>('log')
const editorView = ref<EditorView>('table')
const fastestLoopSeconds = ref(1.2)
const slowestLoopSeconds = ref(7)
const exportDurationSeconds = ref(8)
const canvasWidth = ref(1280)
const canvasHeight = ref(720)
const imageElements = new Map<string, HTMLImageElement>()

const units: Array<{ label: string, value: LatencyUnit }> = [
  { label: 'ns', value: 'ns' },
  { label: 'µs', value: 'us' },
  { label: 'ms', value: 'ms' },
  { label: 's', value: 's' },
  { label: 'min', value: 'min' }
]

const mappingOptions = computed(() => [
  { label: t('latencyAnimatorLogScale'), value: 'log' },
  { label: t('latencyAnimatorLinearScale'), value: 'linear' }
])

const createItem = (item: Omit<LatencyItem, 'id' | 'imageFile' | 'imageDataUrl' | 'imageName'> & Partial<Pick<LatencyItem, 'imageFile' | 'imageDataUrl' | 'imageName'>>): LatencyItem => ({
  id: `latency-item-${++nextItemId}`,
  imageFile: null,
  imageDataUrl: '',
  imageName: '',
  ...item
})

const getDefaultItems = (): LatencyItem[] => [
  createItem({ label: t('latencyAnimatorDefaultNvme'), latency: 50, unit: 'us', delay: 0, color: '#06aeca' }),
  createItem({ label: t('latencyAnimatorDefaultSata'), latency: 100, unit: 'us', delay: 0.1, color: '#7c4df0' }),
  createItem({ label: t('latencyAnimatorDefaultEbs'), latency: 1, unit: 'ms', delay: 0.2, color: '#20bf61' }),
  createItem({ label: t('latencyAnimatorDefaultHdd'), latency: 10, unit: 'ms', delay: 0.3, color: '#f0ad00' }),
  createItem({ label: t('latencyAnimatorDefaultS3'), latency: 25, unit: 'ms', delay: 0.4, color: '#ff3b3f' })
]

const items = ref<LatencyItem[]>(getDefaultItems())

const latencyToMs = (item: LatencyItem): number => {
  if (item.unit === 'ns') return item.latency / 1000000
  if (item.unit === 'us') return item.latency / 1000
  if (item.unit === 's') return item.latency * 1000
  if (item.unit === 'min') return item.latency * 60000
  return item.latency
}

const formatLatency = (item: LatencyItem): string => {
  const unitLabels: Record<LatencyUnit, string> = {
    ns: 'ns',
    us: 'µs',
    ms: 'ms',
    s: 's',
    min: 'min'
  }
  const unit = unitLabels[item.unit]
  return `${item.latency || 0} ${unit}`
}

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)

const visualDurations = computed(() => {
  const minDuration = clamp(fastestLoopSeconds.value, 0.2, 30) * 1000
  const maxDuration = Math.max(clamp(slowestLoopSeconds.value, 0.2, 60) * 1000, minDuration + 100)
  const latencies = items.value.map(item => Math.max(latencyToMs(item), 0.000001))
  const minLatency = Math.min(...latencies)
  const maxLatency = Math.max(...latencies)

  return new Map(items.value.map((item) => {
    const latency = Math.max(latencyToMs(item), 0.000001)
    let ratio = 0.5

    if (maxLatency !== minLatency) {
      if (speedMapping.value === 'log') {
        const minLog = Math.log10(minLatency)
        const maxLog = Math.log10(maxLatency)
        ratio = (Math.log10(latency) - minLog) / (maxLog - minLog)
      } else {
        ratio = (latency - minLatency) / (maxLatency - minLatency)
      }
    }

    return [item.id, minDuration + ratio * (maxDuration - minDuration)]
  }))
})

const addItem = () => {
  const colors = ['#06aeca', '#7c4df0', '#20bf61', '#f0ad00', '#ff3b3f', '#14b8a6', '#ec4899']
  items.value.push(createItem({
    label: t('latencyAnimatorNewRow'),
    latency: 5,
    unit: 'ms',
    delay: 0,
    color: colors[items.value.length % colors.length] ?? '#06aeca'
  }))
}

const removeItem = (id: string) => {
  if (items.value.length <= 1) return
  imageElements.delete(id)
  items.value = items.value.filter(item => item.id !== id)
}

const resetItems = () => {
  imageElements.clear()
  nextItemId = 0
  items.value = getDefaultItems()
  sourceImageFile.value = null
  sourceImageDataUrl.value = ''
  sourceImageName.value = ''
  sourceImageElement = null
  resetPlayback()
}

const resetPlayback = () => {
  elapsedMs.value = 0
  lastFrameTimestamp = 0
}

const togglePlayback = () => {
  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    lastFrameTimestamp = 0
  }
}

const getRowPosition = (index: number, count: number, width: number, height: number): CanvasPoint => {
  const top = height * 0.27
  const bottom = height * 0.73
  const gap = count <= 1 ? 0 : (bottom - top) / (count - 1)
  return {
    x: width * 0.24,
    y: top + gap * index
  }
}

const drawRoundRect = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

const drawWrappedText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
  const words = text.split(' ')
  let line = ''
  let lineY = y

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, lineY)
      line = word
      lineY += lineHeight
    } else {
      line = testLine
    }
  }

  if (line) {
    context.fillText(line, x, lineY)
  }
}

const drawRowImage = (context: CanvasRenderingContext2D, item: LatencyItem, x: number, y: number, size: number) => {
  const image = imageElements.get(item.id)

  context.save()
  drawRoundRect(context, x, y, size, size, 16)
  context.clip()

  if (image && image.complete) {
    const scale = Math.max(size / image.width, size / image.height)
    const imageWidth = image.width * scale
    const imageHeight = image.height * scale
    context.drawImage(image, x + (size - imageWidth) / 2, y + (size - imageHeight) / 2, imageWidth, imageHeight)
  } else {
    context.fillStyle = item.color
    context.fillRect(x, y, size, size)
    context.fillStyle = '#ffffff'
    context.font = `700 ${Math.round(size * 0.34)}px ui-sans-serif, system-ui, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(item.label.slice(0, 2).toUpperCase(), x + size / 2, y + size / 2)
  }

  context.restore()
}

const renderScene = (canvas: HTMLCanvasElement, timeMs: number) => {
  const context = canvas.getContext('2d')
  if (!context) return

  const width = canvas.width
  const height = canvas.height
  const centerX = width / 2
  const startX = width * 0.24
  const endX = width * 0.69
  const sourceX = width * 0.07
  const sourceY = height * 0.28
  const sourceW = width * 0.12
  const sourceH = height * 0.45
  const rowCount = items.value.length

  context.clearRect(0, 0, width, height)

  const background = context.createLinearGradient(0, 0, width, height)
  background.addColorStop(0, '#f9fafb')
  background.addColorStop(0.58, '#ffffff')
  background.addColorStop(1, '#e0f2fe')
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  context.globalAlpha = 0.4
  context.fillStyle = '#dbeafe'
  context.beginPath()
  context.arc(width * 0.86, height * 0.1, width * 0.22, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#fef3c7'
  context.beginPath()
  context.arc(width * 0.08, height * 0.92, width * 0.18, 0, Math.PI * 2)
  context.fill()
  context.globalAlpha = 1

  context.fillStyle = '#111827'
  context.font = '800 46px ui-sans-serif, system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'alphabetic'
  context.fillText(animationTitle.value || t('latencyAnimatorTitle'), centerX, height * 0.13)

  context.strokeStyle = '#cbd5e1'
  context.lineWidth = 2
  context.fillStyle = 'rgba(255,255,255,0.74)'
  drawRoundRect(context, sourceX, sourceY, sourceW, sourceH, 18)
  context.fill()
  context.stroke()

  if (sourceImageElement && sourceImageElement.complete) {
    const avatarSize = Math.min(Math.round(sourceW * 0.5), Math.round(sourceH * 0.28), 80)
    const gap = Math.round(sourceH * 0.05)
    const groupHeight = avatarSize + gap + Math.round(height * 0.032)
    const avatarX = sourceX + (sourceW - avatarSize) / 2
    const avatarY = sourceY + (sourceH - groupHeight) / 2

    context.save()
    drawRoundRect(context, avatarX, avatarY, avatarSize, avatarSize, Math.round(avatarSize * 0.2))
    context.clip()

    const scale = Math.max(avatarSize / sourceImageElement.width, avatarSize / sourceImageElement.height)
    const imageWidth = sourceImageElement.width * scale
    const imageHeight = sourceImageElement.height * scale
    context.drawImage(sourceImageElement, avatarX + (avatarSize - imageWidth) / 2, avatarY + (avatarSize - imageHeight) / 2, imageWidth, imageHeight)
    context.restore()

    context.fillStyle = '#111827'
    context.font = '800 22px ui-sans-serif, system-ui, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(sourceLabel.value || t('latencyAnimatorSource'), sourceX + sourceW / 2, avatarY + avatarSize + gap + Math.round(height * 0.016))
  } else {
    context.fillStyle = '#111827'
    context.font = '800 25px ui-sans-serif, system-ui, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(sourceLabel.value || t('latencyAnimatorSource'), sourceX + sourceW / 2, sourceY + sourceH / 2)
  }

  for (const [index, item] of items.value.entries()) {
    const row = getRowPosition(index, rowCount, width, height)
    const y = row.y
    const duration = visualDurations.value.get(item.id) || 1000
    const cycleDuration = duration * 2
    const cycleProgress = ((timeMs + item.delay * 1000) % cycleDuration) / duration
    const progress = cycleProgress <= 1 ? cycleProgress : 2 - cycleProgress
    const circleX = startX + (endX - startX) * progress
    const circleRadius = Math.max(16, Math.min(28, height / 29))

    context.strokeStyle = '#cbd5e1'
    context.lineWidth = 8
    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(startX, y)
    context.lineTo(endX, y)
    context.stroke()

    context.strokeStyle = item.color
    context.globalAlpha = 0.18
    context.beginPath()
    context.moveTo(startX, y)
    context.lineTo(circleX, y)
    context.stroke()
    context.globalAlpha = 1

    context.fillStyle = '#ffffff'
    context.shadowColor = 'rgba(15, 23, 42, 0.18)'
    context.shadowBlur = 18
    context.shadowOffsetY = 7
    context.beginPath()
    context.arc(circleX, y, circleRadius + 4, 0, Math.PI * 2)
    context.fill()

    context.shadowBlur = 12
    context.shadowColor = item.color
    context.fillStyle = item.color
    context.beginPath()
    context.arc(circleX, y, circleRadius, 0, Math.PI * 2)
    context.fill()
    context.shadowBlur = 0
    context.shadowOffsetY = 0

    drawRowImage(context, item, endX + width * 0.06, y - 30, 60)

    context.fillStyle = '#111827'
    context.font = '800 22px ui-sans-serif, system-ui, sans-serif'
    context.textAlign = 'left'
    context.textBaseline = 'alphabetic'
    drawWrappedText(context, item.label, endX + width * 0.12, y - 6, width * 0.18, 24)

    context.fillStyle = '#475569'
    context.font = '700 18px ui-sans-serif, system-ui, sans-serif'
    context.fillText(formatLatency(item), endX + width * 0.12, y + 24)
  }

  const scrubX = width * 0.15
  const scrubY = height * 0.82
  const scrubW = width * 0.7
  const speedProgress = (playbackSpeed.value - minPlaybackSpeed) / (maxPlaybackSpeed - minPlaybackSpeed)
  const speedText = playbackSpeed.value === minPlaybackSpeed
    ? t('latencyAnimatorBaseSpeed')
    : `${Number(playbackSpeed.value.toFixed(2))}x`

  context.strokeStyle = '#cbd5e1'
  context.lineWidth = 10
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(scrubX, scrubY)
  context.lineTo(scrubX + scrubW, scrubY)
  context.stroke()

  context.fillStyle = '#334155'
  context.beginPath()
  context.arc(scrubX + scrubW * speedProgress, scrubY, 29, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = '#111827'
  context.font = '700 18px ui-sans-serif, system-ui, sans-serif'
  context.textAlign = 'left'
  context.fillText(`${t('latencyAnimatorPlaybackSpeed')}: ${speedText}`, scrubX, scrubY + 46)
  context.fillStyle = '#64748b'
  context.font = '700 15px ui-sans-serif, system-ui, sans-serif'
  context.fillText(t('latencyAnimatorBaseSpeed'), scrubX, scrubY - 20)
  context.textAlign = 'right'
  context.fillText(`${maxPlaybackSpeed}x`, scrubX + scrubW, scrubY - 20)
}

const resizeCanvas = () => {
  const canvas = previewCanvas.value
  const wrap = previewWrap.value
  if (!canvas || !wrap) return

  const ratio = 16 / 9
  const availableWidth = Math.max(320, Math.floor(wrap.clientWidth - 24))
  const availableHeight = Math.max(180, Math.floor(wrap.clientHeight - 24))
  let width = availableWidth
  let height = Math.floor(width / ratio)

  if (height > availableHeight) {
    height = availableHeight
    width = Math.floor(height * ratio)
  }

  canvasWidth.value = width
  canvasHeight.value = height
  canvas.width = 1280
  canvas.height = 720
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  renderScene(canvas, elapsedMs.value)
}

const tick = (timestamp: number) => {
  if (isPlaying.value) {
    if (lastFrameTimestamp) {
      elapsedMs.value += (timestamp - lastFrameTimestamp) * playbackSpeed.value
    }
    lastFrameTimestamp = timestamp
  } else {
    lastFrameTimestamp = 0
  }

  const canvas = previewCanvas.value
  if (canvas) {
    renderScene(canvas, elapsedMs.value)
  }

  animationFrame = requestAnimationFrame(tick)
}

const setPlaybackSpeedFromCanvasEvent = (event: PointerEvent): boolean => {
  const canvas = previewCanvas.value
  if (!canvas) return false

  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const scrubX = canvas.width * 0.15
  const scrubY = canvas.height * 0.82
  const scrubW = canvas.width * 0.7

  if (y < scrubY - 60 || y > scrubY + 70 || x < scrubX - 40 || x > scrubX + scrubW + 40) {
    return false
  }

  const ratio = clamp((x - scrubX) / scrubW, 0, 1)
  playbackSpeed.value = Math.round((minPlaybackSpeed + ratio * (maxPlaybackSpeed - minPlaybackSpeed)) * 4) / 4
  renderScene(canvas, elapsedMs.value)
  return true
}

const stopCanvasSpeedDrag = () => {
  window.removeEventListener('pointermove', handleCanvasSpeedDrag)
  window.removeEventListener('pointerup', stopCanvasSpeedDrag)
}

const handleCanvasSpeedDrag = (event: PointerEvent) => {
  setPlaybackSpeedFromCanvasEvent(event)
}

const handleCanvasPointerDown = (event: PointerEvent) => {
  if (!setPlaybackSpeedFromCanvasEvent(event)) return
  window.addEventListener('pointermove', handleCanvasSpeedDrag)
  window.addEventListener('pointerup', stopCanvasSpeedDrag)
}

const handleImageFile = (item: LatencyItem, file?: File | null) => {
  item.imageFile = file ?? null
  if (!file) {
    removeImage(item)
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = typeof reader.result === 'string' ? reader.result : ''
    item.imageDataUrl = dataUrl
    item.imageName = file.name

    const image = new Image()
    image.onload = () => {
      if (previewCanvas.value) renderScene(previewCanvas.value, elapsedMs.value)
    }
    image.src = dataUrl
    imageElements.set(item.id, image)
  }
  reader.readAsDataURL(file)
}

const handleImageFileUpdate = (item: LatencyItem, value?: File | File[] | null) => {
  handleImageFile(item, Array.isArray(value) ? value[0] : value)
}

const removeImage = (item: LatencyItem) => {
  item.imageFile = null
  item.imageDataUrl = ''
  item.imageName = ''
  imageElements.delete(item.id)
}

const handleSourceImageFile = (file?: File | null) => {
  sourceImageFile.value = file ?? null
  if (!file) {
    removeSourceImage()
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = typeof reader.result === 'string' ? reader.result : ''
    sourceImageDataUrl.value = dataUrl
    sourceImageName.value = file.name

    const image = new Image()
    image.onload = () => {
      if (previewCanvas.value) renderScene(previewCanvas.value, elapsedMs.value)
    }
    image.src = dataUrl
    sourceImageElement = image
  }
  reader.readAsDataURL(file)
}

const handleSourceImageFileUpdate = (value?: File | File[] | null) => {
  handleSourceImageFile(Array.isArray(value) ? value[0] : value)
}

const removeSourceImage = () => {
  sourceImageFile.value = null
  sourceImageDataUrl.value = ''
  sourceImageName.value = ''
  sourceImageElement = null
  if (previewCanvas.value) renderScene(previewCanvas.value, elapsedMs.value)
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

const exportAnimation = async () => {
  if (!import.meta.client || isExporting.value) return

  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = 1280
  exportCanvas.height = 720

  const captureCanvas = exportCanvas as HTMLCanvasElement & { captureStream?: (frameRate?: number) => MediaStream }

  if (!captureCanvas.captureStream || !window.MediaRecorder) {
    toast.add({
      title: t('Error'),
      description: t('latencyAnimatorExportUnsupported'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
    return
  }

  isExporting.value = true
  exportCountdown.value = 3
  recordingProgress.value = 0
  let stream: MediaStream | null = null
  const chunks: BlobPart[] = []
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm'
  const durationMs = clamp(exportDurationSeconds.value, 1, 30) * 1000

  try {
    for (const count of [3, 2, 1]) {
      exportCountdown.value = count
      await sleep(1000)
    }

    exportCountdown.value = null
    isRecording.value = true
    stream = captureCanvas.captureStream(60)
    const recorder = new MediaRecorder(stream, { mimeType })

    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data)
    }

    await new Promise<void>((resolve, reject) => {
      recorder.onerror = event => reject(event)
      recorder.onstop = () => resolve()
      recorder.start()

      const start = performance.now()
      const render = (timestamp: number) => {
        const localElapsed = timestamp - start
        recordingProgress.value = clamp(localElapsed / durationMs, 0, 1)
        renderScene(exportCanvas, localElapsed * playbackSpeed.value)

        if (localElapsed < durationMs) {
          requestAnimationFrame(render)
        } else {
          recorder.stop()
          stream?.getTracks().forEach(track => track.stop())
        }
      }

      requestAnimationFrame(render)
    })
  } catch (error) {
    console.error('Export failed:', error)
    toast.add({
      title: t('Error'),
      description: t('latencyAnimatorExportFailed'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  } finally {
    stream?.getTracks().forEach(track => track.stop())
    exportCountdown.value = null
    isRecording.value = false
    recordingProgress.value = 0
    isExporting.value = false
  }

  if (chunks.length) {
    downloadBlob(new Blob(chunks, { type: mimeType }), 'latency-animation.webm')
    toast.add({
      title: t('latencyAnimatorExportReady'),
      description: t('latencyAnimatorExportReadyDesc'),
      icon: 'i-lucide-download',
      color: 'success'
    })
  }
}

const exportPng = () => {
  const canvas = previewCanvas.value
  if (!canvas) return

  canvas.toBlob((blob) => {
    if (!blob) return
    downloadBlob(blob, 'latency-animation-frame.png')
  }, 'image/png')
}

watch([items, speedMapping, fastestLoopSeconds, slowestLoopSeconds, sourceLabel, sourceImageDataUrl], () => {
  const canvas = previewCanvas.value
  if (canvas) renderScene(canvas, elapsedMs.value)
}, { deep: true })

onMounted(() => {
  resizeCanvas()
  resizeObserver = new ResizeObserver(resizeCanvas)
  if (previewWrap.value) resizeObserver.observe(previewWrap.value)
  animationFrame = requestAnimationFrame(tick)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
  stopCanvasSpeedDrag()
  resizeObserver?.disconnect()
})
</script>

<template>
  <div class="w-full h-full split-pane-wrapper">
    <ClientOnly>
      <Teleport
        defer
        to="#header-actions-portal"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
            {{ $t('Latency Animator') }}
          </span>
          <UButton
            size="sm"
            :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
            color="neutral"
            variant="outline"
            @click="togglePlayback"
          >
            {{ isPlaying ? $t('Pause') : $t('Play') }}
          </UButton>
          <UButton
            size="sm"
            icon="i-lucide-image-down"
            color="neutral"
            variant="outline"
            @click="exportPng"
          >
            {{ $t('latencyAnimatorExportPng') }}
          </UButton>
          <UButton
            size="sm"
            icon="i-lucide-download"
            :loading="isExporting"
            @click="exportAnimation"
          >
            {{ $t('latencyAnimatorExportWebm') }}
          </UButton>
          <UButton
            variant="outline"
            size="sm"
            icon="i-lucide-x"
            @click="resetItems"
          >
            {{ $t('Clear') }}
          </UButton>
        </div>
      </Teleport>

      <SplitPane
        split="vertical"
        :min-percent="28"
        :default-percent="42"
        storage-key="latency-animator"
        class="h-full"
      >
        <template #paneL>
          <div class="h-full min-h-0 overflow-auto p-3 space-y-3">
            <UCard>
              <template #header>
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 class="font-semibold text-highlighted">
                      {{ $t('latencyAnimatorRows') }}
                    </h2>
                    <p class="text-sm text-muted mt-1">
                      {{ $t('latencyAnimatorRowsHint') }}
                    </p>
                  </div>

                  <UFieldGroup size="xs">
                    <UButton
                      :variant="editorView === 'table' ? 'solid' : 'outline'"
                      color="neutral"
                      icon="i-lucide-table"
                      @click="editorView = 'table'"
                    >
                      {{ $t('latencyAnimatorTableView') }}
                    </UButton>
                    <UButton
                      :variant="editorView === 'cards' ? 'solid' : 'outline'"
                      color="neutral"
                      icon="i-lucide-panels-top-left"
                      @click="editorView = 'cards'"
                    >
                      {{ $t('latencyAnimatorCardsView') }}
                    </UButton>
                  </UFieldGroup>
                </div>
              </template>

              <div
                v-if="editorView === 'cards'"
                class="space-y-3"
              >
                <div
                  v-for="(item, index) in items"
                  :key="item.id"
                  class="rounded-xl border border-default bg-elevated/50 p-3 space-y-3"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <span
                        class="size-3 rounded-full shrink-0"
                        :style="{ backgroundColor: item.color }"
                      />
                      <span class="text-sm font-semibold text-highlighted truncate">
                        {{ $t('latencyAnimatorRow') }} {{ index + 1 }}
                      </span>
                    </div>
                    <UButton
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="ghost"
                      size="xs"
                      :disabled="items.length <= 1"
                      :aria-label="$t('latencyAnimatorRemoveRow')"
                      @click="removeItem(item.id)"
                    />
                  </div>

                  <UFormField :label="$t('latencyAnimatorTextLabel')">
                    <UInput
                      v-model="item.label"
                      :placeholder="$t('latencyAnimatorTextPlaceholder')"
                    />
                  </UFormField>

                  <div class="grid grid-cols-2 gap-2">
                    <UFormField :label="$t('latencyAnimatorLatency')">
                      <input
                        v-model.number="item.latency"
                        type="number"
                        min="0.001"
                        step="0.001"
                        class="form-input"
                      >
                    </UFormField>
                    <UFormField :label="$t('latencyAnimatorUnit')">
                      <UFieldGroup
                        size="xs"
                        class="flex flex-wrap"
                      >
                        <UButton
                          v-for="unit in units"
                          :key="unit.value"
                          :variant="item.unit === unit.value ? 'solid' : 'outline'"
                          color="neutral"
                          @click="item.unit = unit.value"
                        >
                          {{ unit.label }}
                        </UButton>
                      </UFieldGroup>
                    </UFormField>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <UFormField :label="$t('latencyAnimatorDelay')">
                      <input
                        v-model.number="item.delay"
                        type="number"
                        min="0"
                        step="0.1"
                        class="form-input"
                      >
                    </UFormField>
                    <UFormField :label="$t('latencyAnimatorColor')">
                      <input
                        v-model="item.color"
                        type="color"
                        class="h-10 w-full rounded-md border border-default bg-default p-1"
                      >
                    </UFormField>
                  </div>

                  <UFormField :label="$t('latencyAnimatorImage')">
                    <UFileUpload
                      :model-value="item.imageFile"
                      accept="image/*"
                      size="sm"
                      layout="list"
                      position="inside"
                      :label="$t('latencyAnimatorUploadImage')"
                      :description="$t('latencyAnimatorUploadImageDesc')"
                      icon="i-lucide-image-up"
                      class="w-full"
                      @update:model-value="file => handleImageFileUpdate(item, file)"
                    />
                    <p
                      v-if="item.imageName"
                      class="text-xs text-muted mt-1 truncate"
                    >
                      {{ item.imageName }}
                    </p>
                  </UFormField>
                </div>
              </div>

              <div
                v-else
                class="overflow-x-auto rounded-xl border border-default"
              >
                <table class="latency-table">
                  <thead>
                    <tr>
                      <th>{{ $t('latencyAnimatorTextLabel') }}</th>
                      <th>{{ $t('latencyAnimatorLatency') }}</th>
                      <th>{{ $t('latencyAnimatorUnit') }}</th>
                      <th>{{ $t('latencyAnimatorDelayShort') }}</th>
                      <th>{{ $t('latencyAnimatorColor') }}</th>
                      <th>{{ $t('latencyAnimatorImage') }}</th>
                      <th>
                        <span class="sr-only">{{ $t('Actions') }}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in items"
                      :key="item.id"
                    >
                      <td class="min-w-52">
                        <input
                          v-model="item.label"
                          type="text"
                          class="table-input"
                          :placeholder="$t('latencyAnimatorTextPlaceholder')"
                        >
                      </td>
                      <td class="min-w-28">
                        <input
                          v-model.number="item.latency"
                          type="number"
                          min="0.001"
                          step="0.001"
                          class="table-input font-mono"
                        >
                      </td>
                      <td class="min-w-28">
                        <USelect
                          v-model="item.unit"
                          :items="units"
                          value-key="value"
                          label-key="label"
                          size="sm"
                        />
                      </td>
                      <td class="min-w-24">
                        <input
                          v-model.number="item.delay"
                          type="number"
                          min="0"
                          step="0.1"
                          class="table-input font-mono"
                        >
                      </td>
                      <td class="min-w-20">
                        <input
                          v-model="item.color"
                          type="color"
                          class="h-9 w-14 rounded-md border border-default bg-default p-1"
                        >
                      </td>
                      <td class="min-w-56">
                        <UFileUpload
                          :model-value="item.imageFile"
                          accept="image/*"
                          size="xs"
                          layout="list"
                          position="inside"
                          :label="$t('latencyAnimatorUploadImage')"
                          :description="$t('latencyAnimatorDropImage')"
                          icon="i-lucide-image-up"
                          class="w-full"
                          :ui="{
                            base: 'min-h-16 p-2',
                            wrapper: 'px-2 py-1',
                            label: 'mt-1',
                            description: 'mt-0.5',
                            file: 'px-2 py-1'
                          }"
                          @update:model-value="file => handleImageFileUpdate(item, file)"
                        />
                      </td>
                      <td class="w-10">
                        <UButton
                          icon="i-lucide-trash-2"
                          color="error"
                          variant="ghost"
                          size="xs"
                          :disabled="items.length <= 1"
                          :aria-label="$t('latencyAnimatorRemoveRow')"
                          @click="removeItem(item.id)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <template #footer>
                <UButton
                  block
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="outline"
                  @click="addItem"
                >
                  {{ $t('latencyAnimatorAddRow') }}
                </UButton>
              </template>
            </UCard>

            <UCard>
              <template #header>
                <h2 class="font-semibold text-highlighted">
                  {{ $t('latencyAnimatorAnimationSettings') }}
                </h2>
              </template>

              <div class="space-y-3">
                <UFormField :label="$t('latencyAnimatorTitleLabel')">
                  <UInput
                    v-model="animationTitle"
                    :placeholder="$t('latencyAnimatorTitle')"
                  />
                </UFormField>

                <UFormField :label="$t('latencyAnimatorSourceLabel')">
                  <UInput
                    v-model="sourceLabel"
                    :placeholder="$t('latencyAnimatorSourcePlaceholder')"
                  />
                </UFormField>

                <UFormField :label="$t('latencyAnimatorSourceImage')">
                  <UFileUpload
                    :model-value="sourceImageFile"
                    accept="image/*"
                    size="sm"
                    layout="list"
                    position="inside"
                    :label="$t('latencyAnimatorUploadImage')"
                    :description="$t('latencyAnimatorUploadImageDesc')"
                    icon="i-lucide-image-up"
                    class="w-full"
                    @update:model-value="handleSourceImageFileUpdate"
                  />
                  <div
                    v-if="sourceImageName"
                    class="flex items-center justify-between mt-1"
                  >
                    <p class="text-xs text-muted truncate">
                      {{ sourceImageName }}
                    </p>
                    <UButton
                      icon="i-lucide-x"
                      color="error"
                      variant="ghost"
                      size="xs"
                      @click="removeSourceImage"
                    >
                      {{ $t('latencyAnimatorRemoveImage') }}
                    </UButton>
                  </div>
                </UFormField>

                <UFormField :label="$t('latencyAnimatorSpeedMapping')">
                  <USelect
                    v-model="speedMapping"
                    :items="mappingOptions"
                    value-key="value"
                    label-key="label"
                  />
                </UFormField>

                <UFormField :label="$t('latencyAnimatorPlaybackSpeed')">
                  <div class="flex items-center gap-3">
                    <input
                      v-model.number="playbackSpeed"
                      type="range"
                      :min="minPlaybackSpeed"
                      :max="maxPlaybackSpeed"
                      step="0.25"
                      class="speed-input"
                    >
                    <span class="w-14 text-right font-mono text-sm font-semibold text-highlighted">
                      {{ playbackSpeed === minPlaybackSpeed ? $t('latencyAnimatorBaseSpeed') : `${Number(playbackSpeed.toFixed(2))}x` }}
                    </span>
                  </div>
                </UFormField>

                <div class="grid grid-cols-2 gap-2">
                  <UFormField :label="$t('latencyAnimatorFastestLoop')">
                    <input
                      v-model.number="fastestLoopSeconds"
                      type="number"
                      min="0.2"
                      max="30"
                      step="0.1"
                      class="form-input"
                    >
                  </UFormField>
                  <UFormField :label="$t('latencyAnimatorSlowestLoop')">
                    <input
                      v-model.number="slowestLoopSeconds"
                      type="number"
                      min="0.3"
                      max="60"
                      step="0.1"
                      class="form-input"
                    >
                  </UFormField>
                </div>

                <UFormField :label="$t('latencyAnimatorExportDuration')">
                  <input
                    v-model.number="exportDurationSeconds"
                    type="number"
                    min="1"
                    max="30"
                    step="1"
                    class="form-input"
                  >
                </UFormField>
              </div>
            </UCard>
          </div>
        </template>

        <template #paneR>
          <div class="h-full min-h-0 overflow-hidden bg-slate-950 p-4 latency-preview-shell">
            <div
              ref="previewWrap"
              class="mx-auto flex h-full min-h-0 w-full items-center justify-center"
            >
              <div
                class="recording-frame relative rounded-[2rem] border bg-white/10 p-3 shadow-2xl shadow-sky-950/60 backdrop-blur"
                :class="isExporting ? 'border-red-400 shadow-red-500/30 recording-frame-active' : 'border-white/15'"
              >
                <canvas
                  ref="previewCanvas"
                  class="block w-full cursor-pointer rounded-[1.4rem] bg-white shadow-xl"
                  width="1280"
                  height="720"
                  @pointerdown="handleCanvasPointerDown"
                />

                <div
                  v-if="exportCountdown"
                  class="absolute inset-3 z-20 flex flex-col items-center justify-center rounded-[1.4rem] bg-slate-950/55 text-white backdrop-blur-sm"
                >
                  <p class="text-sm font-bold uppercase tracking-[0.35em] text-red-200">
                    {{ $t('latencyAnimatorRecordingArea') }}
                  </p>
                  <div class="mt-4 text-8xl font-black tabular-nums drop-shadow-2xl">
                    {{ exportCountdown }}
                  </div>
                  <p class="mt-3 text-sm font-semibold text-slate-200">
                    {{ $t('latencyAnimatorRecordingStarts') }}
                  </p>
                </div>

                <div
                  v-if="isRecording"
                  class="absolute inset-3 z-20 pointer-events-none rounded-[1.4rem] ring-4 ring-red-500/90 ring-offset-4 ring-offset-slate-950"
                >
                  <div class="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-white shadow-lg shadow-red-950/40">
                    <span class="size-3 animate-pulse rounded-full bg-white" />
                    {{ $t('latencyAnimatorRecording') }}
                  </div>
                  <div class="absolute inset-x-5 bottom-5 overflow-hidden rounded-full bg-slate-950/45 p-1">
                    <div
                      class="h-2 rounded-full bg-red-500 transition-[width]"
                      :style="{ width: `${recordingProgress * 100}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </SplitPane>

      <template #fallback>
        <div class="grid h-full grid-cols-2 gap-4 p-4">
          <div class="rounded-lg border border-default bg-elevated p-4">
            {{ $t('Loading...') }}
          </div>
          <div class="rounded-lg border border-default bg-elevated p-4">
            {{ $t('Loading...') }}
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.split-pane-wrapper {
  position: relative;
  height: 100%;
}

.form-input {
  width: 100%;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  padding: 0 0.75rem;
  color: var(--ui-text-highlighted);
  outline: none;
}

.form-input:focus {
  border-color: var(--ui-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ui-primary) 22%, transparent);
}

.speed-input {
  width: 100%;
  accent-color: var(--ui-primary);
}

.latency-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.latency-table th {
  background: var(--ui-bg-elevated);
  color: var(--ui-text-muted);
  font-weight: 700;
  padding: 0.625rem;
  text-align: left;
  white-space: nowrap;
}

.latency-table td {
  border-top: 1px solid var(--ui-border);
  padding: 0.5rem;
  vertical-align: middle;
}

.table-input {
  width: 100%;
  height: 2.25rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  background: transparent;
  padding: 0 0.5rem;
  color: var(--ui-text-highlighted);
  outline: none;
}

.table-input:hover,
.table-input:focus {
  border-color: var(--ui-border);
  background: var(--ui-bg);
}

.recording-frame {
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.recording-frame-active {
  animation: recording-pulse 1s ease-in-out infinite;
}

@keyframes recording-pulse {
  0%,
  100% {
    box-shadow: 0 24px 80px rgba(127, 29, 29, 0.28);
  }

  50% {
    box-shadow: 0 24px 100px rgba(239, 68, 68, 0.48);
  }
}

.latency-preview-shell {
  background:
    radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.22), transparent 28rem),
    radial-gradient(circle at 78% 8%, rgba(168, 85, 247, 0.2), transparent 24rem),
    linear-gradient(135deg, #020617, #0f172a 52%, #082f49);
}
</style>
