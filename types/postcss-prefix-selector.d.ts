declare module 'postcss-prefix-selector' {
  import type { Plugin } from 'postcss'

  interface Options {
    prefix: string
    exclude?: (string | RegExp)[]
    transform?: (prefix: string, selector: string, prefixedSelector: string) => string
    ignoreFiles?: (string | RegExp)[]
    includeFiles?: (string | RegExp)[]
    skipGlobalSelectors?: boolean
  }

  function postcssPrefixSelector(options: Options): Plugin
  export default postcssPrefixSelector
}
