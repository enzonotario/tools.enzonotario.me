import type { LocationQuery, LocationQueryValue } from 'vue-router'
import { TIMEZONES } from '~/utils/timezones'

const VALID_TIMEZONE_IDS = new Set(TIMEZONES.map(tz => tz.timezone))

export interface TimezoneSchedulerShareState {
  timezones: string[]
  isLive: boolean
  pinnedDate: Date | null
}

type QueryValue = LocationQueryValue | LocationQueryValue[] | undefined

function parseZonesParam(zonesParam: QueryValue): string[] {
  if (!zonesParam) return []

  const raw = Array.isArray(zonesParam) ? zonesParam : [zonesParam]
  return raw
    .flatMap(value => (value ?? '').split(','))
    .map(zone => zone.trim())
    .filter(zone => zone && zone !== 'UTC' && VALID_TIMEZONE_IDS.has(zone))
}

function parseLiveParam(liveParam: QueryValue): boolean {
  if (liveParam === undefined || liveParam === null) return true
  const value = Array.isArray(liveParam) ? liveParam[0] : liveParam
  if (!value) return true
  return value === '1' || value === 'true'
}

function parseAtParam(atParam: QueryValue): Date | null {
  if (!atParam) return null
  const value = Array.isArray(atParam) ? atParam[0] : atParam
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function parseTimezoneSchedulerShare(query: LocationQuery): TimezoneSchedulerShareState | null {
  const timezones = parseZonesParam(query.zones)
  if (timezones.length === 0) return null

  const isLive = parseLiveParam(query.live)
  const pinnedDate = isLive ? null : parseAtParam(query.at)

  return { timezones, isLive, pinnedDate }
}

export function buildTimezoneSchedulerQuery(state: TimezoneSchedulerShareState): Record<string, string> {
  const zones = state.timezones.filter(zone => zone !== 'UTC')
  const query: Record<string, string> = {
    zones: zones.join(',')
  }

  if (!state.isLive) {
    query.live = '0'
    if (state.pinnedDate) {
      query.at = state.pinnedDate.toISOString()
    }
  }

  return query
}
