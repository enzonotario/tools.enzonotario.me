import type { Plugin } from 'vite'
import postcss from 'postcss'
import postcssPrefixSelector from 'postcss-prefix-selector'

const prefixDataVisorSelectors = postcssPrefixSelector({
  prefix: '.dv-unocss-host',
  skipGlobalSelectors: true,
  transform(_prefix, selector, prefixedSelector) {
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
        return null
      }
      if (code.includes('.dv-unocss-host .pointer-events-auto')) {
        return null
      }
      const result = await postcss([prefixDataVisorSelectors]).process(code, { from: id })
      return { code: result.css, map: result.map }
    }
  }
}
