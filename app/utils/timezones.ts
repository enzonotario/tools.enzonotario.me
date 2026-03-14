export interface TimezoneEntry {
  timezone: string
  country: string
  city: string
  flag: string
  region: string
}

export const TIMEZONES: TimezoneEntry[] = [
  // Americas
  { timezone: 'America/New_York', country: 'United States', city: 'New York', flag: '🇺🇸', region: 'Americas' },
  { timezone: 'America/Chicago', country: 'United States', city: 'Chicago', flag: '🇺🇸', region: 'Americas' },
  { timezone: 'America/Denver', country: 'United States', city: 'Denver', flag: '🇺🇸', region: 'Americas' },
  { timezone: 'America/Los_Angeles', country: 'United States', city: 'Los Angeles', flag: '🇺🇸', region: 'Americas' },
  { timezone: 'America/Anchorage', country: 'United States', city: 'Anchorage', flag: '🇺🇸', region: 'Americas' },
  { timezone: 'Pacific/Honolulu', country: 'United States', city: 'Honolulu', flag: '🇺🇸', region: 'Americas' },
  { timezone: 'America/Toronto', country: 'Canada', city: 'Toronto', flag: '🇨🇦', region: 'Americas' },
  { timezone: 'America/Vancouver', country: 'Canada', city: 'Vancouver', flag: '🇨🇦', region: 'Americas' },
  { timezone: 'America/Mexico_City', country: 'Mexico', city: 'Mexico City', flag: '🇲🇽', region: 'Americas' },
  { timezone: 'America/Sao_Paulo', country: 'Brazil', city: 'São Paulo', flag: '🇧🇷', region: 'Americas' },
  { timezone: 'America/Manaus', country: 'Brazil', city: 'Manaus', flag: '🇧🇷', region: 'Americas' },
  { timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina', city: 'Buenos Aires', flag: '🇦🇷', region: 'Americas' },
  { timezone: 'America/Santiago', country: 'Chile', city: 'Santiago', flag: '🇨🇱', region: 'Americas' },
  { timezone: 'America/Bogota', country: 'Colombia', city: 'Bogotá', flag: '🇨🇴', region: 'Americas' },
  { timezone: 'America/Lima', country: 'Peru', city: 'Lima', flag: '🇵🇪', region: 'Americas' },
  { timezone: 'America/Caracas', country: 'Venezuela', city: 'Caracas', flag: '🇻🇪', region: 'Americas' },
  { timezone: 'America/La_Paz', country: 'Bolivia', city: 'La Paz', flag: '🇧🇴', region: 'Americas' },
  { timezone: 'America/Montevideo', country: 'Uruguay', city: 'Montevideo', flag: '🇺🇾', region: 'Americas' },
  { timezone: 'America/Asuncion', country: 'Paraguay', city: 'Asunción', flag: '🇵🇾', region: 'Americas' },
  { timezone: 'America/Guayaquil', country: 'Ecuador', city: 'Quito', flag: '🇪🇨', region: 'Americas' },
  { timezone: 'America/Havana', country: 'Cuba', city: 'Havana', flag: '🇨🇺', region: 'Americas' },
  { timezone: 'America/Panama', country: 'Panama', city: 'Panama City', flag: '🇵🇦', region: 'Americas' },
  { timezone: 'America/Costa_Rica', country: 'Costa Rica', city: 'San José', flag: '🇨🇷', region: 'Americas' },
  { timezone: 'America/Guatemala', country: 'Guatemala', city: 'Guatemala City', flag: '🇬🇹', region: 'Americas' },
  { timezone: 'America/Santo_Domingo', country: 'Dominican Republic', city: 'Santo Domingo', flag: '🇩🇴', region: 'Americas' },
  // Europe
  { timezone: 'Europe/London', country: 'United Kingdom', city: 'London', flag: '🇬🇧', region: 'Europe' },
  { timezone: 'Europe/Paris', country: 'France', city: 'Paris', flag: '🇫🇷', region: 'Europe' },
  { timezone: 'Europe/Berlin', country: 'Germany', city: 'Berlin', flag: '🇩🇪', region: 'Europe' },
  { timezone: 'Europe/Madrid', country: 'Spain', city: 'Madrid', flag: '🇪🇸', region: 'Europe' },
  { timezone: 'Europe/Rome', country: 'Italy', city: 'Rome', flag: '🇮🇹', region: 'Europe' },
  { timezone: 'Europe/Amsterdam', country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', region: 'Europe' },
  { timezone: 'Europe/Brussels', country: 'Belgium', city: 'Brussels', flag: '🇧🇪', region: 'Europe' },
  { timezone: 'Europe/Zurich', country: 'Switzerland', city: 'Zurich', flag: '🇨🇭', region: 'Europe' },
  { timezone: 'Europe/Vienna', country: 'Austria', city: 'Vienna', flag: '🇦🇹', region: 'Europe' },
  { timezone: 'Europe/Stockholm', country: 'Sweden', city: 'Stockholm', flag: '🇸🇪', region: 'Europe' },
  { timezone: 'Europe/Oslo', country: 'Norway', city: 'Oslo', flag: '🇳🇴', region: 'Europe' },
  { timezone: 'Europe/Copenhagen', country: 'Denmark', city: 'Copenhagen', flag: '🇩🇰', region: 'Europe' },
  { timezone: 'Europe/Helsinki', country: 'Finland', city: 'Helsinki', flag: '🇫🇮', region: 'Europe' },
  { timezone: 'Europe/Warsaw', country: 'Poland', city: 'Warsaw', flag: '🇵🇱', region: 'Europe' },
  { timezone: 'Europe/Prague', country: 'Czech Republic', city: 'Prague', flag: '🇨🇿', region: 'Europe' },
  { timezone: 'Europe/Budapest', country: 'Hungary', city: 'Budapest', flag: '🇭🇺', region: 'Europe' },
  { timezone: 'Europe/Bucharest', country: 'Romania', city: 'Bucharest', flag: '🇷🇴', region: 'Europe' },
  { timezone: 'Europe/Athens', country: 'Greece', city: 'Athens', flag: '🇬🇷', region: 'Europe' },
  { timezone: 'Europe/Lisbon', country: 'Portugal', city: 'Lisbon', flag: '🇵🇹', region: 'Europe' },
  { timezone: 'Europe/Moscow', country: 'Russia', city: 'Moscow', flag: '🇷🇺', region: 'Europe' },
  { timezone: 'Europe/Kiev', country: 'Ukraine', city: 'Kyiv', flag: '🇺🇦', region: 'Europe' },
  { timezone: 'Europe/Istanbul', country: 'Turkey', city: 'Istanbul', flag: '🇹🇷', region: 'Europe' },
  { timezone: 'Europe/Zurich', country: 'Liechtenstein', city: 'Vaduz', flag: '🇱🇮', region: 'Europe' },
  { timezone: 'Europe/Dublin', country: 'Ireland', city: 'Dublin', flag: '🇮🇪', region: 'Europe' },
  // Asia
  { timezone: 'Asia/Tokyo', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', region: 'Asia' },
  { timezone: 'Asia/Shanghai', country: 'China', city: 'Shanghai', flag: '🇨🇳', region: 'Asia' },
  { timezone: 'Asia/Hong_Kong', country: 'Hong Kong', city: 'Hong Kong', flag: '🇭🇰', region: 'Asia' },
  { timezone: 'Asia/Seoul', country: 'South Korea', city: 'Seoul', flag: '🇰🇷', region: 'Asia' },
  { timezone: 'Asia/Singapore', country: 'Singapore', city: 'Singapore', flag: '🇸🇬', region: 'Asia' },
  { timezone: 'Asia/Bangkok', country: 'Thailand', city: 'Bangkok', flag: '🇹🇭', region: 'Asia' },
  { timezone: 'Asia/Jakarta', country: 'Indonesia', city: 'Jakarta', flag: '🇮🇩', region: 'Asia' },
  { timezone: 'Asia/Manila', country: 'Philippines', city: 'Manila', flag: '🇵🇭', region: 'Asia' },
  { timezone: 'Asia/Kuala_Lumpur', country: 'Malaysia', city: 'Kuala Lumpur', flag: '🇲🇾', region: 'Asia' },
  { timezone: 'Asia/Kolkata', country: 'India', city: 'Mumbai', flag: '🇮🇳', region: 'Asia' },
  { timezone: 'Asia/Karachi', country: 'Pakistan', city: 'Karachi', flag: '🇵🇰', region: 'Asia' },
  { timezone: 'Asia/Dhaka', country: 'Bangladesh', city: 'Dhaka', flag: '🇧🇩', region: 'Asia' },
  { timezone: 'Asia/Colombo', country: 'Sri Lanka', city: 'Colombo', flag: '🇱🇰', region: 'Asia' },
  { timezone: 'Asia/Kathmandu', country: 'Nepal', city: 'Kathmandu', flag: '🇳🇵', region: 'Asia' },
  { timezone: 'Asia/Tashkent', country: 'Uzbekistan', city: 'Tashkent', flag: '🇺🇿', region: 'Asia' },
  { timezone: 'Asia/Tehran', country: 'Iran', city: 'Tehran', flag: '🇮🇷', region: 'Asia' },
  { timezone: 'Asia/Riyadh', country: 'Saudi Arabia', city: 'Riyadh', flag: '🇸🇦', region: 'Asia' },
  { timezone: 'Asia/Dubai', country: 'UAE', city: 'Dubai', flag: '🇦🇪', region: 'Asia' },
  { timezone: 'Asia/Qatar', country: 'Qatar', city: 'Doha', flag: '🇶🇦', region: 'Asia' },
  { timezone: 'Asia/Kuwait', country: 'Kuwait', city: 'Kuwait City', flag: '🇰🇼', region: 'Asia' },
  { timezone: 'Asia/Baghdad', country: 'Iraq', city: 'Baghdad', flag: '🇮🇶', region: 'Asia' },
  { timezone: 'Asia/Beirut', country: 'Lebanon', city: 'Beirut', flag: '🇱🇧', region: 'Asia' },
  { timezone: 'Asia/Jerusalem', country: 'Israel', city: 'Tel Aviv', flag: '🇮🇱', region: 'Asia' },
  { timezone: 'Asia/Amman', country: 'Jordan', city: 'Amman', flag: '🇯🇴', region: 'Asia' },
  { timezone: 'Asia/Taipei', country: 'Taiwan', city: 'Taipei', flag: '🇹🇼', region: 'Asia' },
  { timezone: 'Asia/Rangoon', country: 'Myanmar', city: 'Yangon', flag: '🇲🇲', region: 'Asia' },
  { timezone: 'Asia/Ho_Chi_Minh', country: 'Vietnam', city: 'Ho Chi Minh City', flag: '🇻🇳', region: 'Asia' },
  { timezone: 'Asia/Phnom_Penh', country: 'Cambodia', city: 'Phnom Penh', flag: '🇰🇭', region: 'Asia' },
  { timezone: 'Asia/Ulaanbaatar', country: 'Mongolia', city: 'Ulaanbaatar', flag: '🇲🇳', region: 'Asia' },
  // Africa
  { timezone: 'Africa/Cairo', country: 'Egypt', city: 'Cairo', flag: '🇪🇬', region: 'Africa' },
  { timezone: 'Africa/Johannesburg', country: 'South Africa', city: 'Johannesburg', flag: '🇿🇦', region: 'Africa' },
  { timezone: 'Africa/Lagos', country: 'Nigeria', city: 'Lagos', flag: '🇳🇬', region: 'Africa' },
  { timezone: 'Africa/Nairobi', country: 'Kenya', city: 'Nairobi', flag: '🇰🇪', region: 'Africa' },
  { timezone: 'Africa/Accra', country: 'Ghana', city: 'Accra', flag: '🇬🇭', region: 'Africa' },
  { timezone: 'Africa/Casablanca', country: 'Morocco', city: 'Casablanca', flag: '🇲🇦', region: 'Africa' },
  { timezone: 'Africa/Algiers', country: 'Algeria', city: 'Algiers', flag: '🇩🇿', region: 'Africa' },
  { timezone: 'Africa/Tunis', country: 'Tunisia', city: 'Tunis', flag: '🇹🇳', region: 'Africa' },
  { timezone: 'Africa/Addis_Ababa', country: 'Ethiopia', city: 'Addis Ababa', flag: '🇪🇹', region: 'Africa' },
  { timezone: 'Africa/Dar_es_Salaam', country: 'Tanzania', city: 'Dar es Salaam', flag: '🇹🇿', region: 'Africa' },
  { timezone: 'Africa/Luanda', country: 'Angola', city: 'Luanda', flag: '🇦🇴', region: 'Africa' },
  { timezone: 'Africa/Khartoum', country: 'Sudan', city: 'Khartoum', flag: '🇸🇩', region: 'Africa' },
  { timezone: 'Africa/Dakar', country: 'Senegal', city: 'Dakar', flag: '🇸🇳', region: 'Africa' },
  // Oceania
  { timezone: 'Australia/Sydney', country: 'Australia', city: 'Sydney', flag: '🇦🇺', region: 'Oceania' },
  { timezone: 'Australia/Melbourne', country: 'Australia', city: 'Melbourne', flag: '🇦🇺', region: 'Oceania' },
  { timezone: 'Australia/Brisbane', country: 'Australia', city: 'Brisbane', flag: '🇦🇺', region: 'Oceania' },
  { timezone: 'Australia/Perth', country: 'Australia', city: 'Perth', flag: '🇦🇺', region: 'Oceania' },
  { timezone: 'Australia/Adelaide', country: 'Australia', city: 'Adelaide', flag: '🇦🇺', region: 'Oceania' },
  { timezone: 'Pacific/Auckland', country: 'New Zealand', city: 'Auckland', flag: '🇳🇿', region: 'Oceania' },
  { timezone: 'Pacific/Fiji', country: 'Fiji', city: 'Suva', flag: '🇫🇯', region: 'Oceania' },
  { timezone: 'Pacific/Guam', country: 'Guam', city: 'Hagåtña', flag: '🇬🇺', region: 'Oceania' },
  // UTC
  { timezone: 'UTC', country: 'UTC', city: 'Universal Time', flag: '🌐', region: 'Global' }
]

export function getUtcOffset(timezone: string, date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    timeZoneName: 'shortOffset'
  })
  const parts = formatter.formatToParts(date)
  const offsetPart = parts.find(p => p.type === 'timeZoneName')
  return offsetPart?.value ?? 'UTC'
}

export function formatTime(date: Date, timezone: string, hour12: boolean = false): string {
  return new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12
  }).format(date)
}

export function formatDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

export function getHour(date: Date, timezone: string): number {
  return Number(new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false
  }).format(date))
}

export function isDayTime(date: Date, timezone: string): boolean {
  const hour = getHour(date, timezone)
  return hour >= 6 && hour < 20
}

/** Returns the current "HH:MM" string for a date in a given timezone */
export function getTimeHHMM(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date)
  const h = parts.find(p => p.type === 'hour')!.value
  const m = parts.find(p => p.type === 'minute')!.value
  // "24" hour can appear for midnight in some engines — normalize to "00"
  return `${h === '24' ? '00' : h}:${m}`
}

/**
 * Given a "HH:MM" string that represents a local time in `timezone`,
 * returns the UTC Date that corresponds to that local time on the same
 * calendar day as `referenceDate` (expressed in that timezone).
 */
export function parseTimeInTimezone(timeStr: string, timezone: string, referenceDate: Date): Date {
  const [h, m] = timeStr.split(':').map(Number)

  // Helper: extract numeric fields from formatToParts for a given tz
  const getParts = (date: Date, tz: string) => {
    const p = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(date)
    const g = (type: string) => {
      const val = p.find(x => x.type === type)!.value
      return type === 'hour' && val === '24' ? 0 : +val
    }
    return { year: g('year'), month: g('month'), day: g('day'), hour: g('hour'), minute: g('minute'), second: g('second') }
  }

  // Get the calendar date for referenceDate in the target timezone
  const localRef = getParts(referenceDate, timezone)

  // Build the "naive" local timestamp (treated as UTC for arithmetic)
  const naiveLocalMs = Date.UTC(localRef.year, localRef.month - 1, localRef.day, h, m, 0)

  // Compute the UTC offset at referenceDate: offsetMs = UTC_wall - local_wall
  const utcWall = getParts(referenceDate, 'UTC')
  const localWall = getParts(referenceDate, timezone)
  const utcWallMs = Date.UTC(utcWall.year, utcWall.month - 1, utcWall.day, utcWall.hour, utcWall.minute, utcWall.second)
  const localWallMs = Date.UTC(localWall.year, localWall.month - 1, localWall.day, localWall.hour, localWall.minute, localWall.second)
  const offsetMs = utcWallMs - localWallMs

  // UTC = naive_local + offset
  return new Date(naiveLocalMs + offsetMs)
}
