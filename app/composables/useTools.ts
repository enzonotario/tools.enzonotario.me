export interface Tool {
  id: string
  label: string
  description: string
  icon: string
  category: string
  to: string
}

export interface ToolCategory {
  id: string
  label: string
  icon: string
  defaultOpen?: boolean
}

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

  const tools = computed<Tool[]>(() => [
    {
      id: 'formatter',
      label: t('Formatter'),
      description: t('Format, validate and minify your JSON, XML, YAML and TOML code'),
      icon: 'i-lucide-braces',
      category: 'development',
      to: '/json-xml-yaml-toml-format'
    },
    {
      id: 'text-diff',
      label: t('Text Diff Comparison'),
      description: t('Compare and visualize differences between text, JSON, XML, and other formats'),
      icon: 'i-lucide-git-compare',
      category: 'development',
      to: '/text-diff'
    },
    {
      id: 'og-debugger',
      label: t('OG Debugger'),
      description: t('Debug and preview Open Graph tags for social media sharing'),
      icon: 'i-lucide-share-2',
      category: 'development',
      to: '/og-debugger'
    },
    {
      id: 'string-escape',
      label: t('String Escape'),
      description: t('Escape and unescape strings: JSON, HTML, URL, Base64, Unicode'),
      icon: 'i-lucide-quote',
      category: 'development',
      to: '/string-escape'
    },
    {
      id: 'lorem-ipsum',
      label: t('Lorem Ipsum Generator'),
      description: t('Generate placeholder text for your designs'),
      icon: 'i-lucide-type',
      category: 'design',
      to: '/lorem-ipsum'
    },
    {
      id: 'password-generator',
      label: t('Password Generator'),
      description: t('Generate secure, random passwords with customizable options'),
      icon: 'i-lucide-lock',
      category: 'utilities',
      to: '/password-generator'
    },
    {
      id: 'token-generator',
      label: t('Token Generator'),
      description: t('Generate random string with the chars you want, uppercase or lowercase letters, numbers and/or symbols.'),
      icon: 'i-lucide-key',
      category: 'utilities',
      to: '/token-generator'
    },
    {
      id: 'invoice-generator',
      label: t('Invoice Generator'),
      description: t('Create professional invoices in minutes'),
      icon: 'i-lucide-file-text',
      category: 'utilities',
      to: '/invoice-generator'
    }
  ])

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
