<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import {
  TIMEZONES,
  formatTime,
  formatDate,
  formatDateShort,
  formatTimeShort,
  getUtcOffset,
  getTimeHHMM,
  parseTimeInTimezone,
  localizeCity,
  localizeCountry,
  generateTimelineUtcSlots,
  buildTimelineRow,
  type TimezoneEntry,
  type TimelineCell
} from '~/utils/timezones'

definePageMeta({ layout: 'dashboard' })

const { t, locale } = useI18n()
useSeoMeta({ title: t('Timezone Scheduler') })

const tzCity = (tz: TimezoneEntry) => localizeCity(tz, locale.value)
const tzCountry = (tz: TimezoneEntry) => localizeCountry(tz.countryCode, locale.value) || tz.country
const toast = useToast()
const { share, getSharedData } = useShare()

// ── Live clock ────────────────────────────────────────────────────────────────
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)

  const sharedData = getSharedData<{ timezones: string[], pinnedDate?: string | null }>()
  if (sharedData?.timezones) {
    selectedTimezoneIds.value = sharedData.timezones
  }
  if (sharedData?.pinnedDate) {
    const d = new Date(sharedData.pinnedDate)
    if (!isNaN(d.getTime())) {
      pinnedDate.value = d
      isLive.value = false
    }
  }

  scrollTimelineToSelected()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// ── Reference / pinned time ───────────────────────────────────────────────────
const isLive = ref(true)
const pinnedDate = ref(new Date())
const displayDate = computed(() => isLive.value ? now.value : pinnedDate.value)

function resumeLive() {
  isLive.value = true
  editingCard.value = null
}

// ── Inline card editing ───────────────────────────────────────────────────────
const editingCard = ref<string | null>(null)
const editingValue = ref('')

function startEditing(tz: TimezoneEntry) {
  if (isLive.value) {
    pinnedDate.value = now.value
    isLive.value = false
  }
  editingCard.value = tz.timezone
  editingValue.value = getTimeHHMM(displayDate.value, tz.timezone)
}

function commitEdit(tz: TimezoneEntry) {
  if (!editingValue.value || !isValidTime(editingValue.value)) {
    cancelEdit()
    return
  }
  pinnedDate.value = parseTimeInTimezone(editingValue.value, tz.timezone, displayDate.value)
  editingCard.value = null
}

function cancelEdit() {
  editingCard.value = null
}

function handleTimeKeydown(e: KeyboardEvent, tz: TimezoneEntry) {
  if (e.key === 'Enter') commitEdit(tz)
  if (e.key === 'Escape') cancelEdit()
}

function handleTimeInput(e: Event) {
  const input = e.target as HTMLInputElement
  let val = input.value.replace(/[^0-9]/g, '')
  if (val.length > 4) val = val.slice(0, 4)
  if (val.length >= 3) val = val.slice(0, 2) + ':' + val.slice(2)
  editingValue.value = val
  // Keep cursor at end
  nextTick(() => {
    input.setSelectionRange(val.length, val.length)
  })
}

function isValidTime(val: string): boolean {
  const m = val.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  return !!m
}

// ── Timezone list ─────────────────────────────────────────────────────────────
const UTC_TZ = TIMEZONES.find(tz => tz.timezone === 'UTC')!

const search = ref('')
const selectedTimezoneIds = useStorage<string[]>('timezone-scheduler-selected', [])

const selectedTimezones = computed(() => {
  return selectedTimezoneIds.value
    .map(tzId => TIMEZONES.find(t => t.timezone === tzId))
    .filter(Boolean) as TimezoneEntry[]
})

const filteredTimezones = computed(() => {
  const q = search.value.toLowerCase()
  // UTC is always a pinned reference card — exclude it from the selectable list
  const list = TIMEZONES.filter(tz => tz.timezone !== 'UTC')
  if (!q) return list
  return list.filter(tz =>
    tz.country.toLowerCase().includes(q)
    || tz.city.toLowerCase().includes(q)
    || tzCity(tz).toLowerCase().includes(q)
    || tzCountry(tz).toLowerCase().includes(q)
    || tz.timezone.toLowerCase().includes(q)
    || tz.region.toLowerCase().includes(q)
  )
})

const regions = computed(() => [...new Set(filteredTimezones.value.map(tz => tz.region))])

function timezonesByRegion(region: string) {
  return filteredTimezones.value.filter(tz => tz.region === region)
}

function isSelected(tz: TimezoneEntry) {
  return selectedTimezoneIds.value.includes(tz.timezone)
}

function toggleTimezone(tz: TimezoneEntry) {
  if (isSelected(tz)) {
    selectedTimezoneIds.value = selectedTimezoneIds.value.filter(id => id !== tz.timezone)
  } else {
    selectedTimezoneIds.value = [...selectedTimezoneIds.value, tz.timezone]
  }
}

function removeTimezone(tz: TimezoneEntry) {
  selectedTimezoneIds.value = selectedTimezoneIds.value.filter(id => id !== tz.timezone)
}

function clearAll() {
  selectedTimezoneIds.value = []
  search.value = ''
  resumeLive()
}

// ── Sort & group by date ──────────────────────────────────────────────────────
/** Returns "YYYY-MM-DD HH:MM" for a timezone, used for sorting */
function getSortKey(tz: TimezoneEntry, date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

// UTC is always included as a reference card, sorted with the rest
const allTimezones = computed(() => {
  const hasUtc = selectedTimezones.value.some(tz => tz.timezone === 'UTC')
  return hasUtc ? selectedTimezones.value : [UTC_TZ, ...selectedTimezones.value]
})

// ── Horizontal timeline ───────────────────────────────────────────────────────
const sortedTimezones = computed(() => {
  const date = displayDate.value
  return [...allTimezones.value].sort((a, b) =>
    getSortKey(a, date).localeCompare(getSortKey(b, date))
  )
})

const timelineSlots = computed(() => generateTimelineUtcSlots(displayDate.value))

interface TimelineRow {
  tz: TimezoneEntry
  cells: TimelineCell[]
}

const timelineRows = computed((): TimelineRow[] => {
  const slots = timelineSlots.value
  const ref = displayDate.value
  const loc = locale.value
  return sortedTimezones.value.map(tz => ({
    tz,
    cells: buildTimelineRow(tz.timezone, slots, ref, loc)
  }))
})

const ROW_HEIGHT = '3.75rem'

const timelineScrollRef = ref<HTMLElement | null>(null)
const infoScrollRef = ref<HTMLElement | null>(null)
function onTimelineScroll() {
  if (infoScrollRef.value && timelineScrollRef.value) {
    infoScrollRef.value.scrollTop = timelineScrollRef.value.scrollTop
  }
}

function hourCellClass(cell: TimelineCell): string[] {
  if (cell.isDay) {
    return [
      'bg-linear-to-b from-amber-50 to-sky-100/80',
      'text-amber-950',
      'dark:from-amber-400/25 dark:to-sky-500/20',
      'dark:text-amber-100',
      'hover:from-amber-100 hover:to-sky-100',
      'dark:hover:from-amber-400/35 dark:hover:to-sky-500/30',
      cell.isSelected
        ? 'ring-2 ring-inset ring-primary from-amber-100 to-sky-200/90 dark:from-amber-400/40 dark:to-sky-500/35'
        : ''
    ]
  }
  return [
    'bg-linear-to-b from-zinc-300/70 to-zinc-400/50',
    'text-zinc-800',
    'dark:from-zinc-800 dark:to-indigo-950/55',
    'dark:text-zinc-400',
    'hover:from-zinc-400/70 hover:to-zinc-500/50',
    'dark:hover:from-zinc-700 dark:hover:to-indigo-900/65',
    cell.isSelected
      ? 'ring-2 ring-inset ring-primary from-zinc-400/80 to-zinc-500/60 dark:from-zinc-700 dark:to-indigo-900/70'
      : ''
  ]
}

function selectTimelineHour(utcDate: Date) {
  if (isLive.value) {
    pinnedDate.value = utcDate
    isLive.value = false
  } else {
    pinnedDate.value = utcDate
  }
  editingCard.value = null
  scrollTimelineToSelected()
}

function scrollTimelineToSelected() {
  nextTick(() => {
    const container = timelineScrollRef.value
    if (!container) return
    const selected = container.querySelector('[data-hour-selected]') as HTMLElement | null
    if (!selected) return
    const containerRect = container.getBoundingClientRect()
    const selectedRect = selected.getBoundingClientRect()
    const offset = selectedRect.left - containerRect.left - containerRect.width / 2 + selectedRect.width / 2
    container.scrollLeft += offset
  })
}

watch(() => selectedTimezoneIds.value.length, scrollTimelineToSelected)

// ── Share / copy ──────────────────────────────────────────────────────────────
function handleShare() {
  share({
    timezones: selectedTimezones.value.map(tz => tz.timezone),
    pinnedDate: isLive.value ? null : pinnedDate.value.toISOString()
  })
}

async function copyTime(tz: TimezoneEntry) {
  const time = formatTime(displayDate.value, tz.timezone, false)
  const date = formatDate(displayDate.value, tz.timezone)
  try {
    await navigator.clipboard.writeText(`${tzCity(tz)} (${tz.timezone}): ${time} - ${date}`)
    toast.add({ title: t('Copied'), description: t('Copied to clipboard'), icon: 'i-lucide-check', color: 'success' })
  } catch {
    toast.add({ title: t('Failed to copy'), icon: 'i-lucide-alert-circle', color: 'error' })
  }
}
</script>

<template>
  <div>
    <Teleport
      defer
      to="#header-actions-portal"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
          {{ $t('Timezone Scheduler') }}
        </span>
        <UButton
          variant="outline"
          size="sm"
          icon="i-lucide-share-2"
          :disabled="selectedTimezones.length === 0"
          @click="handleShare"
        >
          {{ $t('Share') }}
        </UButton>
        <UButton
          variant="outline"
          size="sm"
          icon="i-lucide-x"
          :disabled="selectedTimezones.length === 0"
          @click="clearAll"
        >
          {{ $t('Clear') }}
        </UButton>
      </div>
    </Teleport>

    <div class="w-full h-full split-pane-wrapper">
      <ClientOnly>
        <SplitPane
          split="vertical"
          :min-percent="20"
          :default-percent="35"
          storage-key="timezone-scheduler"
          class="h-full"
        >
          <!-- ── Left: Timezone selector ── -->
          <template #paneL>
            <div class="flex flex-col h-full p-1 gap-2 min-h-0">
              <UInput
                v-model="search"
                :placeholder="$t('timezoneSearchPlaceholder')"
                icon="i-lucide-search"
                class="shrink-0"
              />

              <!-- Timezone list -->
              <div class="flex-1 overflow-y-auto min-h-0 rounded-lg border border-default">
                <div
                  v-for="region in regions"
                  :key="region"
                  class="border-b border-default last:border-b-0"
                >
                  <div class="sticky top-0 z-10 bg-muted/80 dark:bg-muted/40 backdrop-blur-sm px-3 py-1.5">
                    <span class="text-xs font-semibold text-muted uppercase tracking-wider">{{ $t(region) }}</span>
                  </div>
                  <button
                    v-for="tz in timezonesByRegion(region)"
                    :key="tz.timezone"
                    class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors cursor-pointer"
                    :class="isSelected(tz) ? 'bg-primary/10 dark:bg-primary/10' : ''"
                    @click="toggleTimezone(tz)"
                  >
                    <span class="text-lg leading-none shrink-0">{{ tz.flag }}</span>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium truncate">
                        {{ tzCity(tz) }}
                      </div>
                      <div class="text-xs text-muted truncate">
                        {{ tzCountry(tz) }}
                      </div>
                    </div>
                    <span class="text-xs font-mono text-muted shrink-0">{{ getUtcOffset(tz.timezone) }}</span>
                    <UIcon
                      v-if="isSelected(tz)"
                      name="i-lucide-check"
                      class="text-primary shrink-0"
                      size="14"
                    />
                  </button>
                </div>
                <div
                  v-if="filteredTimezones.length === 0"
                  class="p-6 text-center text-muted text-sm"
                >
                  {{ $t('timezoneNoResults') }}
                </div>
              </div>
            </div>
          </template>

          <!-- ── Right: Clock cards ── -->
          <template #paneR>
            <div class="flex flex-col h-full min-h-0">
              <!-- Live / paused bar (always visible) -->
              <div class="shrink-0 flex items-center justify-between px-3 py-1.5 border-b border-default text-xs">
                <div class="flex items-center gap-1.5">
                  <span
                    class="inline-block size-2 rounded-full"
                    :class="isLive ? 'bg-green-500 animate-pulse' : 'bg-amber-400'"
                  />
                  <span :class="isLive ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'">
                    {{ isLive ? $t('timezoneLive') : $t('timezonePaused') }}
                  </span>
                </div>
                <UButton
                  v-if="!isLive"
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-play"
                  @click="resumeLive"
                >
                  {{ $t('timezoneResumeLive') }}
                </UButton>
                <span
                  v-else
                  class="text-muted"
                >{{ $t('timezoneTimelineHint') }}</span>
              </div>

              <!-- Timeline area -->
              <div
                v-if="selectedTimezones.length === 0"
                class="flex-1 flex flex-col items-center justify-center gap-2 text-muted"
              >
                <UIcon
                  name="i-lucide-globe"
                  class="size-8 opacity-30"
                />
                <p class="text-sm">
                  {{ $t('timezoneEmptyState') }}
                </p>
              </div>

              <div
                v-else
                class="flex flex-1 min-h-0 overflow-hidden"
              >
                <div
                  ref="infoScrollRef"
                  class="w-52 sm:w-60 shrink-0 overflow-hidden border-r border-default"
                >
                  <div
                    v-for="row in timelineRows"
                    :key="`info-${row.tz.timezone}`"
                    class="timeline-info-row flex items-center gap-2 px-3 border-b border-default shrink-0 overflow-hidden"
                    :class="row.tz.timezone === 'UTC' ? 'bg-primary/5 dark:bg-primary/10' : 'bg-default'"
                    :style="{ height: ROW_HEIGHT }"
                  >
                    <span class="text-xl leading-none shrink-0">{{ row.tz.flag }}</span>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1 min-w-0">
                        <span class="font-semibold text-sm truncate">{{ tzCity(row.tz) }}</span>
                        <span
                          v-if="row.tz.timezone === 'UTC'"
                          class="text-[9px] font-medium px-1 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-wide leading-none shrink-0"
                        >
                          {{ $t('timezoneReference') }}
                        </span>
                      </div>
                      <div class="text-[11px] text-muted truncate">
                        {{ tzCountry(row.tz) }} · {{ getUtcOffset(row.tz.timezone, displayDate) }}
                      </div>
                      <template v-if="editingCard === row.tz.timezone">
                        <div class="flex items-center gap-1">
                          <input
                            :value="editingValue"
                            type="text"
                            inputmode="numeric"
                            placeholder="HH:MM"
                            maxlength="5"
                            autofocus
                            class="font-mono font-bold tabular-nums bg-transparent border-b-2 border-primary outline-none text-base w-20"
                            :class="editingValue && !isValidTime(editingValue) ? 'border-red-500 text-red-500' : ''"
                            @input="handleTimeInput"
                            @keydown="handleTimeKeydown($event, row.tz)"
                            @blur="commitEdit(row.tz)"
                          >
                          <UButton
                            size="xs"
                            variant="ghost"
                            icon="i-lucide-check"
                            color="success"
                            @mousedown.prevent="commitEdit(row.tz)"
                          />
                          <UButton
                            size="xs"
                            variant="ghost"
                            icon="i-lucide-x"
                            @mousedown.prevent="cancelEdit"
                          />
                        </div>
                      </template>
                      <template v-else>
                        <button
                          class="group flex items-baseline gap-1 cursor-pointer text-left"
                          :title="$t('timezoneClickToEdit')"
                          @click="startEditing(row.tz)"
                        >
                          <span class="font-mono font-bold tabular-nums text-lg group-hover:text-primary transition-colors">
                            {{ formatTimeShort(displayDate, row.tz.timezone) }}
                          </span>
                          <span class="text-[10px] text-muted truncate">
                            {{ formatDateShort(displayDate, row.tz.timezone, locale) }}
                          </span>
                        </button>
                      </template>
                    </div>
                    <div class="flex flex-col gap-0.5 shrink-0">
                      <UButton
                        size="xs"
                        variant="ghost"
                        icon="i-lucide-copy"
                        @click="copyTime(row.tz)"
                      />
                      <UButton
                        v-if="row.tz.timezone !== 'UTC'"
                        size="xs"
                        variant="ghost"
                        icon="i-lucide-x"
                        @click="removeTimezone(row.tz)"
                      />
                    </div>
                  </div>
                </div>

                <div
                  ref="timelineScrollRef"
                  class="flex-1 overflow-auto min-h-0 min-w-0"
                  @scroll="onTimelineScroll"
                >
                  <div class="min-w-max">
                    <div
                      v-for="row in timelineRows"
                      :key="row.tz.timezone"
                      class="timeline-row flex border-b border-default shrink-0 overflow-hidden isolate"
                      :class="row.tz.timezone === 'UTC' ? 'bg-primary/5 dark:bg-primary/10' : ''"
                      :style="{ height: ROW_HEIGHT }"
                    >
                      <div class="flex h-full">
                        <button
                          v-for="(cell, cellIndex) in row.cells"
                          :key="`${row.tz.timezone}-${cellIndex}`"
                          type="button"
                          class="relative flex flex-col items-center justify-center shrink-0 w-9 h-full border-r border-default/40 transition-colors cursor-pointer overflow-hidden"
                          :class="hourCellClass(cell)"
                          :data-hour-selected="cell.isSelected ? '' : undefined"
                          :title="formatTime(cell.utcDate, row.tz.timezone, true)"
                          @click="selectTimelineHour(cell.utcDate)"
                        >
                          <span
                            v-if="cell.isNewDay && cell.dayLabel"
                            class="w-full px-0.5 text-[7px] font-bold leading-none text-muted uppercase tracking-tighter truncate text-center"
                          >
                            {{ cell.dayLabel }}
                          </span>
                          <span
                            v-else
                            class="h-[9px]"
                          />
                          <span class="text-sm font-semibold tabular-nums leading-none">{{ cell.hour }}</span>
                          <span
                            class="text-[9px] uppercase leading-none"
                            :class="cell.isDay ? 'text-amber-800/70 dark:text-amber-200/70' : 'text-zinc-700/80 dark:text-zinc-500'"
                          >{{ cell.period }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </SplitPane>

        <template #fallback>
          <div class="flex items-center justify-center h-full text-muted text-sm">
            {{ $t('Loading...') }}
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
.split-pane-wrapper {
  position: relative;
  height: 100%;
}
</style>
