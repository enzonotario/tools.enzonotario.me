import figlet from 'figlet'
import ansiShadowFontData from 'figlet/importable-fonts/ANSI Shadow.js'
import ansiRegularFontData from 'figlet/importable-fonts/ANSI Regular.js'
import ansiCompactFontData from 'figlet/importable-fonts/ANSI Compact.js'

export type AsciiStyleId = 'ansi-shadow' | 'ansi-regular' | 'ansi-compact'

const FONTS: { fontName: string, data: string }[] = [
  { fontName: 'ANSI Shadow', data: ansiShadowFontData as string },
  { fontName: 'ANSI Regular', data: ansiRegularFontData as string },
  { fontName: 'ANSI Compact', data: ansiCompactFontData as string }
]

let fontsLoaded = false
function ensureFonts() {
  if (!fontsLoaded) {
    for (const { fontName, data } of FONTS) {
      figlet.parseFont(fontName, data)
    }
    fontsLoaded = true
  }
}

export type AsciiBlockOptions = {
  styleId?: AsciiStyleId
  horizontalLayout?: 'default' | 'full' | 'fitted'
}

const STYLE_TO_FONT: Record<AsciiStyleId, string> = {
  'ansi-shadow': 'ANSI Shadow',
  'ansi-regular': 'ANSI Regular',
  'ansi-compact': 'ANSI Compact'
}

/** ANSI Regular: full layout y espacio extra entre letras */
const STYLE_LAYOUT: Partial<Record<AsciiStyleId, 'default' | 'full' | 'fitted'>> = {
  'ansi-regular': 'full'
}

/** Espacios a insertar entre cada carácter en ANSI Regular */
const ANSI_REGULAR_CHAR_GAP = 0.5

/**
 * Convierte texto a ASCII art con el estilo indicado.
 * Si el texto contiene saltos de línea, cada línea se renderiza por separado.
 */
export function textToBlockAscii(
  text: string,
  options: AsciiBlockOptions = {}
): string {
  ensureFonts()
  const styleId = options.styleId ?? 'ansi-shadow'
  const fontName = STYLE_TO_FONT[styleId]
  const layout = options.horizontalLayout ?? STYLE_LAYOUT[styleId] ?? 'fitted'

  const lines = text.split('\n').map(l => l.trimEnd())
  const blocks = lines.map((line) => {
    const t = line || ' '
    if (styleId === 'ansi-regular') {
      // Renderizar cada carácter por separado y unir con espacio para que no se vea tan junto
      const gap = ' '.repeat(ANSI_REGULAR_CHAR_GAP)
      const charBlocks = [...t].map((char) => {
        const block = figlet.textSync(char, { font: fontName, horizontalLayout: layout })
        const blockLines = block.split('\n')
        const w = Math.max(...blockLines.map(l => l.length))
        return blockLines.map(l => l.padEnd(w))
      })
      const height = Math.max(...charBlocks.map(b => b.length))
      const outLines: string[] = []
      for (let row = 0; row < height; row++) {
        outLines.push(
          charBlocks.map(b => (b[row] ?? '').padEnd(b[0]?.length ?? 0)).join(gap)
        )
      }
      return outLines.join('\n')
    }
    return figlet.textSync(t, {
      font: fontName,
      horizontalLayout: layout
    })
  })
  return blocks.join('\n').replace(/\n+$/, '')
}

export const ASCII_STYLES: { id: AsciiStyleId, name: string, description: string }[] = [
  { id: 'ansi-shadow', name: 'ANSI Shadow', description: 'Caracteres de caja con sombra (██╗ ╚═╝ ║).' },
  { id: 'ansi-regular', name: 'ANSI Regular', description: 'Caracteres de caja clásicos (██ ████████).' },
  { id: 'ansi-compact', name: 'ANSI Compact', description: 'Estilo compacto con bloques (▄ ▀ █).' }
]
