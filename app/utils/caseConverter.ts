function splitWords(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/[\s_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

export function toCamel(s: string): string {
  const words = splitWords(s)
  if (words.length === 0) return s
  const first = words[0]
  if (first === undefined) return s
  return first.toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
}

export function toPascal(s: string): string {
  return splitWords(s).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
}

export function toSnake(s: string): string {
  return splitWords(s).map(w => w.toLowerCase()).join('_')
}

export function toKebab(s: string): string {
  return splitWords(s).map(w => w.toLowerCase()).join('-')
}

export function toConstant(s: string): string {
  return splitWords(s).map(w => w.toUpperCase()).join('_')
}

export function toTitle(s: string): string {
  return splitWords(s).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}
