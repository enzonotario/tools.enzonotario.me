/* eslint-disable-next-line @typescript-eslint/triple-slash-reference -- tsconfig.node no incluye types/; el .d.ts debe enlazarse explícitamente */
/// <reference path="../../types/postcss-prefix-selector.d.ts" />
import type { Plugin } from 'vite'
import postcss from 'postcss'
import postcssPrefixSelector from 'postcss-prefix-selector'

const prefixDataVisorSelectors = postcssPrefixSelector({
  prefix: '.dv-unocss-host',
  skipGlobalSelectors: true,
  transform(_prefix: string, selector: string, prefixedSelector: string) {
    const s = selector.trim()
    if (s.startsWith('.dv-unocss-host')) {
      return selector
    }
    return prefixedSelector
  }
})

function isDataVisorBundleStyle(id: string): boolean {
  const n = id.replace(/\\/g, '/')
  return n.includes('data-visor-vue') && n.endsWith('/dist/style.css')
}

export function scopeDataVisorVite(): Plugin {
  return {
    name: 'scope-data-visor-css',
    enforce: 'pre',
    async transform(code, id) {
      if (!isDataVisorBundleStyle(id)) {
        return undefined
      }
      if (code.includes('.dv-unocss-host .pointer-events-auto')) {
        return undefined
      }
      const result = await postcss([prefixDataVisorSelectors]).process(code, { from: id })
      return { code: result.css }
    }
  }
}
