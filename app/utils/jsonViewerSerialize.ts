import { Formatter } from 'fracturedjsonjs'
import type { ViewerDisplayMode } from 'data-visor-vue'

const formatter = new Formatter()

export function sortObjectKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeysDeep)
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObjectKeysDeep((obj as Record<string, unknown>)[key])
        return result
      }, {} as Record<string, unknown>)
  }
  return obj
}

export function serializeJsonForViewerMode(value: unknown, mode: ViewerDisplayMode): string {
  if (mode === 'minified') {
    return JSON.stringify(value)
  }
  if (mode === 'fractured') {
    return formatter.Serialize(value) ?? JSON.stringify(value, null, 2)
  }
  return JSON.stringify(value, null, 2)
}
