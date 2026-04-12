import { createHeadingSlug } from './headingSlug'

export interface OutlineHeading {
  id: string
  level: number
  text: string
  line: number
}

export function extractMarkdownOutline(markdown: string): OutlineHeading[] {
  return markdown
    .split(/\r?\n/)
    .map((line, index) => ({ line, index }))
    .map(({ line, index }) => {
      const match = line.match(/^(#{1,6})\s+(.*)$/)
      if (!match) {
        return null
      }
      const text = match[2].trim()
      if (!text) {
        return null
      }
      return {
        id: createHeadingSlug(text) || `heading-${index + 1}`,
        level: match[1].length,
        text,
        line: index + 1
      }
    })
    .filter((heading): heading is OutlineHeading => heading !== null)
}
