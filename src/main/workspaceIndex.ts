import { basename, relative } from 'path'

const markdownExtensions = new Set(['.md', '.markdown', '.txt'])

export function hasMarkdownExtension(filePath: string): boolean {
  const normalized = filePath.toLowerCase()
  for (const extension of markdownExtensions) {
    if (normalized.endsWith(extension)) {
      return true
    }
  }
  return false
}

export function normalizeReference(value: string): string {
  return value
    .trim()
    .replaceAll('\\', '/')
    .replace(/^\.?\//, '')
    .toLowerCase()
}

export function stripMarkdownExtension(value: string): string {
  return value.replace(/\.(md|markdown|txt)$/i, '')
}

export function getReferenceCandidates(directoryPath: string, targetPath: string): string[] {
  const fileName = basename(targetPath)
  const relativePath = relative(directoryPath, targetPath).replace(/\\/g, '/')
  return [
    fileName,
    stripMarkdownExtension(fileName),
    relativePath,
    stripMarkdownExtension(relativePath)
  ].map(normalizeReference)
}

export function extractWikiReferences(line: string): string[] {
  return Array.from(line.matchAll(/\[\[([^[\]]+?)\]\]/g), (match) => normalizeReference(match[1]))
}

export function getMarkdownDocumentTitle(filePath: string, lines: string[]): string {
  return lines.find((line) => line.trim().length > 0)?.replace(/^#+\s*/, '') || basename(filePath)
}
