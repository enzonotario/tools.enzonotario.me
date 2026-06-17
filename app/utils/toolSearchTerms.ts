interface ToolSearchKeys {
  id: string
  labelKey: string
  descriptionKey: string
}

export function buildToolSearchTerms(
  tool: ToolSearchKeys,
  messages: Record<'en' | 'es', Record<string, string>>
): string {
  return [
    tool.id,
    messages.en[tool.labelKey],
    messages.es[tool.labelKey],
    messages.en[tool.descriptionKey],
    messages.es[tool.descriptionKey]
  ].filter(Boolean).join(' ')
}
