import cruftless from 'cruftless'
import { DOMParser } from 'xmldom'

const ATTRS_KEY = '_attrs'

type CruftlessApi = ReturnType<typeof cruftless>
type CruftlessElement = ReturnType<CruftlessApi['element']>
type BindMode = 'single' | 'array' | 'values'

function getCruftless(): CruftlessApi {
  return cruftless({ types: {} })
}

function parseXmlDocument(xml: string): Document {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml.trim(), 'text/xml')
  const error = doc.getElementsByTagName('parsererror')[0]
  if (error) {
    throw new Error(error.textContent?.trim() || 'Invalid XML')
  }
  return doc
}

function isLeafTextElement(node: Element): boolean {
  return Array.from(node.childNodes).every(n => n.nodeType !== 1)
}

function getTextContent(node: Element): string {
  return Array.from(node.childNodes)
    .filter(n => n.nodeType === 3 || n.nodeType === 4)
    .map(n => n.textContent ?? '')
    .join('')
}

function applyBindMode(el: CruftlessElement, mode: BindMode, tagName: string): CruftlessElement {
  if (mode === 'array') {
    return el.bind(tagName).array()
  }
  if (mode === 'values') {
    return el.bind(tagName).values()
  }
  return el
}

function buildTemplateFromElement(node: Element, mode: BindMode = 'single'): CruftlessElement {
  const { element, text, attr } = getCruftless()
  const tagName = node.tagName

  const attrBindings = []
  for (let i = 0; i < node.attributes.length; i++) {
    const attribute = node.attributes.item(i)
    if (!attribute) continue
    if (attribute.name === 'xmlns' || attribute.name.startsWith('xmlns:')) continue
    attrBindings.push(attr(attribute.name).bind(`${ATTRS_KEY}.${attribute.name}`))
  }

  const childElements = Array.from(node.childNodes).filter(n => n.nodeType === 1) as Element[]

  if (childElements.length === 0) {
    const el = element(tagName)
    if (attrBindings.length > 0) {
      el.attrs(...attrBindings)
    }
    const textContent = getTextContent(node)
    if (textContent) {
      el.content(text().bind(tagName))
    }
    return applyBindMode(el, mode, tagName)
  }

  const groups = new Map<string, Element[]>()
  for (const child of childElements) {
    const list = groups.get(child.tagName) ?? []
    list.push(child)
    groups.set(child.tagName, list)
  }

  const content: CruftlessElement[] = []
  for (const [childTag, nodes] of groups) {
    if (nodes.length > 1) {
      if (nodes.every(isLeafTextElement)) {
        content.push(
          element(childTag).bind(childTag).values().content(text().bind('value'))
        )
      } else {
        const prototype = nodes[0]
        if (!prototype) continue
        content.push(buildTemplateFromElement(prototype, 'array'))
      }
    } else {
      const prototype = nodes[0]
      if (!prototype) continue
      content.push(buildTemplateFromElement(prototype, 'single'))
    }
  }

  const el = element(tagName)
  if (attrBindings.length > 0) {
    el.attrs(...attrBindings)
  }
  el.content(...content)
  return applyBindMode(el, mode, tagName)
}

function isScalar(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

function buildTemplateFromJson(tagName: string, value: unknown, mode: BindMode = 'single'): CruftlessElement {
  const { element, text, attr } = getCruftless()

  if (isScalar(value)) {
    const el = element(tagName).content(text().bind(tagName))
    return applyBindMode(el, mode, tagName)
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return applyBindMode(element(tagName), mode, tagName)
    }
    if (value.every(isScalar)) {
      return element(tagName).bind(tagName).values().content(text().bind('value'))
    }
    return buildTemplateFromJson(tagName, value[0], 'array')
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    const attrBindings = []
    const content: CruftlessElement[] = []

    if (obj[ATTRS_KEY] && typeof obj[ATTRS_KEY] === 'object' && !Array.isArray(obj[ATTRS_KEY])) {
      for (const [attrName, attrValue] of Object.entries(obj[ATTRS_KEY] as Record<string, unknown>)) {
        if (isScalar(attrValue)) {
          attrBindings.push(attr(attrName).bind(`${ATTRS_KEY}.${attrName}`))
        }
      }
    }

    for (const [key, val] of Object.entries(obj)) {
      if (key === ATTRS_KEY) {
        continue
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          content.push(element(key))
        } else if (val.every(isScalar)) {
          content.push(element(key).bind(key).values().content(text().bind('value')))
        } else {
          content.push(buildTemplateFromJson(key, val[0], 'array'))
        }
      } else if (typeof val === 'object' && val !== null) {
        content.push(buildTemplateFromJson(key, val, 'single'))
      } else if (isScalar(val)) {
        content.push(element(key).content(text().bind(key)))
      }
    }

    const el = element(tagName)
    if (attrBindings.length > 0) {
      el.attrs(...attrBindings)
    }
    if (content.length > 0) {
      el.content(...content)
    }
    return applyBindMode(el, mode, tagName)
  }

  return applyBindMode(element(tagName), mode, tagName)
}

function buildInnerData(tagName: string, value: unknown): Record<string, unknown> {
  if (isScalar(value)) {
    return { [tagName]: String(value) }
  }
  if (Array.isArray(value)) {
    return { [tagName]: value }
  }
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>
  }
  return {}
}

export function prettyPrintXml(xml: string, indent = '  '): string {
  const compact = xml.replace(/>\s+</g, '><').trim()
  let result = ''
  let depth = 0

  const tokens = compact.match(/<[^>]+>|[^<]+/g) ?? []
  for (const token of tokens) {
    if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1)
      result += `${indent.repeat(depth)}${token}\n`
    } else if (token.startsWith('<') && !token.startsWith('<?') && !token.endsWith('/>') && !token.includes('</')) {
      result += `${indent.repeat(depth)}${token}\n`
      depth += 1
    } else {
      result += `${indent.repeat(depth)}${token}\n`
    }
  }

  return result.trimEnd()
}

export function xmlToJson(xml: string): unknown {
  const doc = parseXmlDocument(xml)
  const root = doc.documentElement
  const template = buildTemplateFromElement(root)
  const inner = template.fromXML(xml.trim())
  return { [root.tagName]: inner }
}

export function jsonToXml(json: unknown): string {
  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    throw new Error('Invalid JSON for XML conversion')
  }

  const keys = Object.keys(json)
  if (keys.length !== 1) {
    throw new Error('JSON must have a single root element')
  }

  const rootTag = keys[0]!
  const value = (json as Record<string, unknown>)[rootTag]
  const template = buildTemplateFromJson(rootTag, value)
  const innerData = buildInnerData(rootTag, value)
  const xml = template.toXML(innerData)

  return `<?xml version="1.0" encoding="UTF-8"?>\n${prettyPrintXml(xml)}`
}

export function formatXml(xml: string): string {
  return jsonToXml(xmlToJson(xml))
}
