export interface ToolDefinition {
  id: string
  labelKey: string
  descriptionKey: string
  icon: string
  category: 'development' | 'design' | 'utilities'
  to: string
}

export interface Tool extends ToolDefinition {
  label: string
  description: string
}

export interface ToolCategory {
  id: string
  label: string
  icon: string
  defaultOpen?: boolean
}

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: 'formatter',
    labelKey: 'Formatter',
    descriptionKey: 'Format, validate and minify your JSON, XML, YAML and TOML code',
    icon: 'i-lucide-braces',
    category: 'development',
    to: '/formatter'
  },
  {
    id: 'text-diff',
    labelKey: 'Text Diff Comparison',
    descriptionKey: 'Compare and visualize differences between text, JSON, XML, and other formats',
    icon: 'i-lucide-git-compare',
    category: 'development',
    to: '/text-diff'
  },
  {
    id: 'og-debugger',
    labelKey: 'OG Debugger',
    descriptionKey: 'Debug and preview Open Graph tags for social media sharing',
    icon: 'i-lucide-share-2',
    category: 'development',
    to: '/og-debugger'
  },
  {
    id: 'string-escape',
    labelKey: 'String Escape',
    descriptionKey: 'Escape and unescape strings: JSON, HTML, URL, Base64, Unicode',
    icon: 'i-lucide-quote',
    category: 'development',
    to: '/string-escape'
  },
  {
    id: 'hash-generator',
    labelKey: 'Hash Generator',
    descriptionKey: 'Generate MD5, SHA-1, SHA-256 and SHA-512 hashes from text',
    icon: 'i-lucide-fingerprint',
    category: 'development',
    to: '/hash-generator'
  },
  {
    id: 'case-converter',
    labelKey: 'Case Converter',
    descriptionKey: 'Convert text between camelCase, snake_case, kebab-case and more',
    icon: 'i-lucide-case-sensitive',
    category: 'development',
    to: '/case-converter'
  },
  {
    id: 'curl-builder',
    labelKey: 'Curl Builder',
    descriptionKey: 'Build curl commands with method, URL, headers, params and body',
    icon: 'i-lucide-terminal-square',
    category: 'development',
    to: '/curl-builder'
  },
  {
    id: 'lorem-ipsum',
    labelKey: 'Lorem Ipsum Generator',
    descriptionKey: 'Generate placeholder text for your designs',
    icon: 'i-lucide-type',
    category: 'design',
    to: '/lorem-ipsum'
  },
  {
    id: 'ascii-art',
    labelKey: 'Text to ASCII Art',
    descriptionKey: 'Generate text in ASCII art styles, block/terminal style',
    icon: 'i-lucide-square-dashed-mouse-pointer',
    category: 'design',
    to: '/ascii-art'
  },
  {
    id: 'markdown-preview',
    labelKey: 'Markdown Preview',
    descriptionKey: 'Preview your markdown code with synchronized scrolling',
    icon: 'i-lucide-file-text',
    category: 'design',
    to: '/markdown-preview'
  },
  {
    id: 'mermaid-preview',
    labelKey: 'Mermaid Preview',
    descriptionKey: 'Preview Mermaid diagrams with beautiful SVG or ASCII rendering',
    icon: 'i-lucide-git-branch',
    category: 'design',
    to: '/mermaid-preview'
  },
  {
    id: 'latency-animator',
    labelKey: 'Latency Animator',
    descriptionKey: 'Create animated latency races with custom labels, images and speeds',
    icon: 'i-lucide-gauge',
    category: 'design',
    to: '/latency-animator'
  },
  {
    id: 'password-generator',
    labelKey: 'Password Generator',
    descriptionKey: 'Generate secure, random passwords with customizable options',
    icon: 'i-lucide-lock',
    category: 'utilities',
    to: '/password-generator'
  },
  {
    id: 'token-generator',
    labelKey: 'Token Generator',
    descriptionKey: 'Generate random string with the chars you want, uppercase or lowercase letters, numbers and/or symbols.',
    icon: 'i-lucide-key',
    category: 'utilities',
    to: '/token-generator'
  },
  {
    id: 'invoice-generator',
    labelKey: 'Invoice Generator',
    descriptionKey: 'Create professional invoices in minutes',
    icon: 'i-lucide-file-text',
    category: 'utilities',
    to: '/invoice-generator'
  },
  {
    id: 'timezone-scheduler',
    labelKey: 'Timezone Scheduler',
    descriptionKey: 'Compare times across countries and timezones worldwide',
    icon: 'i-lucide-globe',
    category: 'utilities',
    to: '/timezone-scheduler'
  }
]

export const useTools = () => {
  const { t } = useI18n()

  const categories = computed<ToolCategory[]>(() => [
    {
      id: 'development',
      label: t('Development'),
      icon: 'i-lucide-code',
      defaultOpen: true
    },
    {
      id: 'design',
      label: t('Design'),
      icon: 'i-lucide-palette',
      defaultOpen: true
    },
    {
      id: 'utilities',
      label: t('Utilities'),
      icon: 'i-lucide-wrench',
      defaultOpen: true
    }
  ])

  const tools = computed<Tool[]>(() =>
    TOOL_DEFINITIONS.map(def => ({
      ...def,
      label: t(def.labelKey),
      description: t(def.descriptionKey)
    }))
  )

  const getToolById = (id: string) => {
    return tools.value.find(tool => tool.id === id)
  }

  const getToolsByCategory = (categoryId: string) => {
    return tools.value.filter(tool => tool.category === categoryId)
  }

  return {
    tools,
    categories,
    getToolById,
    getToolsByCategory
  }
}
