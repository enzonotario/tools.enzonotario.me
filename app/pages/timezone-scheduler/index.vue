<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { TIMEZONES, formatTime, formatDate, isDayTime, getUtcOffset, getTimeHHMM, parseTimeInTimezone, type TimezoneEntry } from '~/utils/timezones'

definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
useSeoMeta({ title: t('Timezone Scheduler') })
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

/** Returns "YYYY-MM-DD" for a timezone */
function getDateKey(tz: TimezoneEntry, date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

interface CardGroup {
  dateKey: string
  dateLabel: string
  timezones: TimezoneEntry[]
}

// UTC is always included as a reference card, sorted with the rest
const allTimezones = computed(() => {
  const hasUtc = selectedTimezones.value.some(tz => tz.timezone === 'UTC')
  return hasUtc ? selectedTimezones.value : [UTC_TZ, ...selectedTimezones.value]
})

const groupedTimezones = computed((): CardGroup[] => {
  const date = displayDate.value

  const sorted = [...allTimezones.value].sort((a, b) =>
    getSortKey(a, date).localeCompare(getSortKey(b, date))
  )

  const groups: CardGroup[] = []
  for (const tz of sorted) {
    const dateKey = getDateKey(tz, date)
    const last = groups[groups.length - 1]
    if (last && last.dateKey === dateKey) {
      last.timezones.push(tz)
    } else {
      // Use the first timezone of the group to get the human-readable date label
      groups.push({ dateKey, dateLabel: formatDate(date, tz.timezone), timezones: [tz] })
    }
  }
  return groups
})

const hasMultipleDays = computed(() => groupedTimezones.value.length > 1)

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
    await navigator.clipboard.writeText(`${tz.city} (${tz.timezone}): ${time} - ${date}`)
    toast.add({ title: t('Copied'), description: t('Copied to clipboard'), icon: 'i-lucide-check', color: 'success' })
  } catch {
    toast.add({ title: t('Failed to copy'), icon: 'i-lucide-alert-circle', color: 'error' })
  }
}
</script>

<template>
  <div>
    <Teleport to="#header-actions-portal">
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
                        {{ tz.city }}
                      </div>
                      <div class="text-xs text-muted truncate">
                        {{ tz.country }}
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
                >{{ $t('timezoneEditHint') }}</span>
              </div>

              <!-- Cards area -->
              <div class="flex-1 overflow-auto p-2">
                <!-- Empty state hint (UTC always visible, just show hint below it) -->
                <div
                  v-if="selectedTimezones.length === 0"
                  class="flex flex-col items-center justify-center gap-2 py-6 text-muted"
                >
                  <UIcon
                    name="i-lucide-globe"
                    class="size-8 opacity-30"
                  />
                  <p class="text-sm">
                    {{ $t('timezoneEmptyState') }}
                  </p>
                </div>

                <!-- Grouped vertical list (UTC always included, sorted with the rest) -->
                <div class="flex flex-col gap-2">
                  <template
                    v-for="group in groupedTimezones"
                    :key="group.dateKey"
                  >
                    <!-- Date divider -->
                    <div
                      v-if="hasMultipleDays"
                      class="flex items-center gap-3 px-1 py-1"
                    >
                      <div class="flex-1 h-px bg-default" />
                      <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-default bg-muted/40 dark:bg-muted/20">
                        <UIcon
                          name="i-lucide-calendar"
                          class="size-3 text-muted"
                        />
                        <span class="text-xs font-medium text-muted whitespace-nowrap">{{ group.dateLabel }}</span>
                      </div>
                      <div class="flex-1 h-px bg-default" />
                    </div>

                    <!-- Cards -->
                    <div
                      v-for="tz in group.timezones"
                      :key="tz.timezone"
                      class="rounded-xl border overflow-hidden transition-colors"
                      :class="[
                        tz.timezone === 'UTC'
                          ? (editingCard === 'UTC'
                            ? 'border-primary/60 ring-1 ring-primary/30 bg-primary/5 dark:bg-primary/10'
                            : 'border-primary/30 bg-primary/5 dark:bg-primary/10')
                          : [
                            isDayTime(displayDate, tz.timezone)
                              ? 'bg-gradient-to-r from-amber-50 to-sky-50 dark:from-amber-950/20 dark:to-sky-950/20'
                              : 'bg-gradient-to-r from-slate-900/5 to-indigo-950/20 dark:from-slate-900/60 dark:to-indigo-950/40',
                            editingCard === tz.timezone ? 'border-primary/60 ring-1 ring-primary/30' : 'border-default'
                          ]
                      ]"
                    >
                      <div class="flex items-center gap-4 px-4 py-3">
                        <!-- Flag + name (+ reference badge for UTC) -->
                        <div class="flex items-center gap-2.5 w-36 shrink-0">
                          <span class="text-2xl leading-none">{{ tz.flag }}</span>
                          <div class="min-w-0">
                            <div class="flex items-center gap-1.5 flex-wrap">
                              <span class="font-semibold text-sm truncate">{{ tz.city }}</span>
                              <span
                                v-if="tz.timezone === 'UTC'"
                                class="text-[10px] font-medium px-1 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-wide leading-none shrink-0"
                              >
                                {{ $t('timezoneReference') }}
                              </span>
                            </div>
                            <div class="text-xs text-muted truncate">
                              {{ tz.country }}
                            </div>
                          </div>
                        </div>

                        <!-- Time (editable) -->
                        <div class="flex-1 flex items-center gap-2 min-w-0">
                          <template v-if="editingCard === tz.timezone">
                            <input
                              :value="editingValue"
                              type="text"
                              inputmode="numeric"
                              placeholder="HH:MM"
                              maxlength="5"
                              autofocus
                              class="font-mono font-bold tabular-nums bg-transparent border-b-2 border-primary outline-none text-2xl w-28"
                              :class="editingValue && !isValidTime(editingValue) ? 'border-red-500 text-red-500' : ''"
                              @input="handleTimeInput"
                              @keydown="handleTimeKeydown($event, tz)"
                              @blur="commitEdit(tz)"
                            >
                            <UButton
                              size="xs"
                              variant="ghost"
                              icon="i-lucide-check"
                              color="success"
                              @mousedown.prevent="commitEdit(tz)"
                            />
                            <UButton
                              size="xs"
                              variant="ghost"
                              icon="i-lucide-x"
                              @mousedown.prevent="cancelEdit"
                            />
                          </template>
                          <template v-else>
                            <button
                              class="group flex items-center gap-2 cursor-pointer"
                              :title="$t('timezoneClickToEdit')"
                              @click="startEditing(tz)"
                            >
                              <span class="font-mono font-bold tabular-nums text-2xl group-hover:text-primary transition-colors">
                                {{ formatTime(displayDate, tz.timezone, false) }}
                              </span>
                              <UIcon
                                name="i-lucide-pencil"
                                class="size-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              />
                            </button>
                            <UIcon
                              v-if="tz.timezone !== 'UTC'"
                              :name="isDayTime(displayDate, tz.timezone) ? 'i-lucide-sun' : 'i-lucide-moon'"
                              class="size-4 shrink-0"
                              :class="isDayTime(displayDate, tz.timezone) ? 'text-amber-500' : 'text-indigo-400'"
                            />
                          </template>
                        </div>

                        <!-- Offset + actions -->
                        <div class="flex items-center gap-2 shrink-0">
                          <span class="text-xs font-mono text-muted bg-muted/50 dark:bg-muted/20 px-1.5 py-0.5 rounded hidden sm:inline">
                            {{ getUtcOffset(tz.timezone, displayDate) }}
                          </span>
                          <UButton
                            size="xs"
                            variant="ghost"
                            icon="i-lucide-copy"
                            @click="copyTime(tz)"
                          />
                          <UButton
                            v-if="tz.timezone !== 'UTC'"
                            size="xs"
                            variant="ghost"
                            icon="i-lucide-x"
                            @click="removeTimezone(tz)"
                          />
                        </div>
                      </div>
                    </div>
                  </template>
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
