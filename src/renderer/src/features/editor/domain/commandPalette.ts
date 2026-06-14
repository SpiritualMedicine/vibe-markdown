import type { DirectoryTreeEntry } from '../../../../../shared'
import type { EditorLocale, LocaleKey } from '../settings'
import { t } from '../settings'
import {
  DOCUMENT_TEMPLATES,
  getDocumentTemplateLabel,
  type DocumentTemplateId
} from './documentTemplates'

export type CommandPaletteItemKind = 'command' | 'file' | 'recent' | 'template'

export interface CommandPaletteItem {
  id: string
  kind: CommandPaletteItemKind
  title: string
  subtitle: string
  keywords: string[]
  disabled?: boolean
}

interface BuildCommandPaletteItemsOptions {
  canSave: boolean
  directoryEntries: DirectoryTreeEntry[]
  locale: EditorLocale
  recentFiles: string[]
  showPreview: boolean
}

const COMMAND_KEYS: Array<{
  id: string
  labelKey: LocaleKey
  keywords: string[]
  disabled?: (options: BuildCommandPaletteItemsOptions) => boolean
}> = [
  { id: 'command:new', labelKey: 'toolbar.action.new', keywords: ['new', 'document'] },
  { id: 'command:open', labelKey: 'toolbar.action.open', keywords: ['open', 'file'] },
  {
    id: 'command:openFolder',
    labelKey: 'toolbar.action.openFolder',
    keywords: ['open', 'folder', 'workspace']
  },
  {
    id: 'command:save',
    labelKey: 'toolbar.action.save',
    keywords: ['save', 'write'],
    disabled: (options) => !options.canSave
  },
  { id: 'command:saveAs', labelKey: 'toolbar.action.saveAs', keywords: ['save', 'as'] },
  { id: 'command:exportHtml', labelKey: 'toolbar.action.exportHtml', keywords: ['export', 'html'] },
  { id: 'command:insertImage', labelKey: 'toolbar.insertImage', keywords: ['insert', 'image'] },
  {
    id: 'command:togglePreview',
    labelKey: 'toolbar.togglePreview',
    keywords: ['preview', 'toggle']
  }
]

function getPathLabel(filePath: string): string {
  return filePath.split(/[\\/]/).filter(Boolean).at(-1) ?? filePath
}

function flattenMarkdownFiles(entries: DirectoryTreeEntry[]): DirectoryTreeEntry[] {
  const files: DirectoryTreeEntry[] = []

  for (const entry of entries) {
    if (entry.type === 'directory') {
      files.push(...flattenMarkdownFiles(entry.children ?? []))
      continue
    }

    if (/\.(md|markdown|txt)$/i.test(entry.name)) {
      files.push(entry)
    }
  }

  return files
}

export function buildCommandPaletteItems(
  options: BuildCommandPaletteItemsOptions
): CommandPaletteItem[] {
  const commandItems = COMMAND_KEYS.map((command) => ({
    id: command.id,
    kind: 'command' as const,
    title: t(options.locale, command.labelKey),
    subtitle:
      command.id === 'command:togglePreview'
        ? options.showPreview
          ? t(options.locale, 'commandPalette.previewVisible')
          : t(options.locale, 'commandPalette.previewHidden')
        : t(options.locale, 'commandPalette.group.command'),
    keywords: command.keywords,
    disabled: command.disabled?.(options) ?? false
  }))

  const templateItems = DOCUMENT_TEMPLATES.map((template) => ({
    id: `template:${template.id}`,
    kind: 'template' as const,
    title: getDocumentTemplateLabel(options.locale, template),
    subtitle: t(options.locale, 'commandPalette.group.template'),
    keywords: ['template', template.id]
  }))

  const recentItems = options.recentFiles.map((filePath) => ({
    id: `recent:${filePath}`,
    kind: 'recent' as const,
    title: getPathLabel(filePath),
    subtitle: filePath,
    keywords: ['recent', filePath]
  }))

  const fileItems = flattenMarkdownFiles(options.directoryEntries).map((entry) => ({
    id: `file:${entry.path}`,
    kind: 'file' as const,
    title: entry.name,
    subtitle: entry.path,
    keywords: ['file', entry.path, entry.name]
  }))

  return [...commandItems, ...templateItems, ...recentItems, ...fileItems]
}

export function filterCommandPaletteItems(
  items: CommandPaletteItem[],
  query: string
): CommandPaletteItem[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return items.slice(0, 30)
  }

  return items
    .map((item) => {
      const haystack = [item.title, item.subtitle, ...item.keywords].join(' ').toLowerCase()
      if (!haystack.includes(normalizedQuery)) {
        return null
      }

      const title = item.title.toLowerCase()
      const score = title === normalizedQuery ? 0 : title.startsWith(normalizedQuery) ? 1 : 2
      return { item, score }
    })
    .filter((result): result is { item: CommandPaletteItem; score: number } => result !== null)
    .sort(
      (left, right) => left.score - right.score || left.item.title.localeCompare(right.item.title)
    )
    .map((result) => result.item)
    .slice(0, 30)
}

export function getCommandPaletteTemplateId(item: CommandPaletteItem): DocumentTemplateId | null {
  if (!item.id.startsWith('template:')) {
    return null
  }

  const templateId = item.id.slice('template:'.length)
  return DOCUMENT_TEMPLATES.some((template) => template.id === templateId)
    ? (templateId as DocumentTemplateId)
    : null
}
