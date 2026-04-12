import type { DirectorySearchResult } from '../../../../../shared'
import type { DirectoryTreeEntry } from '../../../../../shared'
import type { EditorTab } from '../../../application/commands'

export const DEFAULT_MARKDOWN = '# Welcome\n\nStart writing your markdown document.'

export function createEditorTab(
  markdownToHtml: (markdown: string) => string,
  markdown = DEFAULT_MARKDOWN
): EditorTab {
  return {
    id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    filePath: null,
    markdown,
    html: markdownToHtml(markdown),
    isDirty: false
  }
}

export function getActiveEditorTab(tabs: EditorTab[], activeTabId: string): EditorTab {
  return tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]
}

export function getDocumentBasename(filePath: string | null, fallback: string): string {
  if (!filePath) {
    return fallback
  }
  const segments = filePath.split(/[\\/]/)
  return segments[segments.length - 1] || fallback
}

export function getLineOffset(markdown: string, lineNumber: number): number {
  const lines = markdown.split(/\r?\n/)
  let offset = 0
  for (let index = 0; index < Math.max(0, lineNumber - 1) && index < lines.length; index += 1) {
    offset += lines[index].length + 1
  }
  return offset
}

export function getSearchResultKey(
  result: Pick<DirectorySearchResult, 'filePath' | 'line'>
): string {
  return `${result.filePath}:${result.line}`
}

function normalizeReference(value: string): string {
  return value
    .trim()
    .replaceAll('\\', '/')
    .replace(/^\.?\//, '')
    .toLowerCase()
}

function stripMarkdownExtension(value: string): string {
  return value.replace(/\.(md|markdown|txt)$/i, '')
}

export function findDocumentPathByReference(
  entries: DirectoryTreeEntry[],
  reference: string,
  parentSegments: string[] = []
): string | null {
  const normalizedReference = normalizeReference(reference)

  for (const entry of entries) {
    const currentSegments = [...parentSegments, entry.name]
    if (entry.type === 'directory') {
      const nestedMatch = findDocumentPathByReference(
        entry.children ?? [],
        normalizedReference,
        currentSegments
      )
      if (nestedMatch) {
        return nestedMatch
      }
      continue
    }

    const relativePath = currentSegments.join('/')
    const candidates = [
      entry.name,
      stripMarkdownExtension(entry.name),
      relativePath,
      stripMarkdownExtension(relativePath)
    ].map(normalizeReference)

    if (candidates.includes(normalizedReference)) {
      return entry.path
    }
  }

  return null
}
