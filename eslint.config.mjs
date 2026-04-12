// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  files: [
    'app/components/json-xml-formatter/CodeHighlight.vue',
    'app/pages/markdown-preview/index.vue'
  ],
  rules: {
    'vue/no-v-html': 'off'
  }
})
