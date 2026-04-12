import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_MARKDOWN,
  createEditorTab,
  findDocumentPathByReference,
  getActiveEditorTab,
  getDocumentBasename,
  getLineOffset,
  getSearchResultKey
} from './editorDocuments'

describe('editorDocuments', () => {
  it('creates a clean editor tab from markdown', () => {
    const markdownToHtml = vi.fn((markdown: string) => `<p>${markdown}</p>`)

    const tab = createEditorTab(markdownToHtml)

    expect(markdownToHtml).toHaveBeenCalledWith(DEFAULT_MARKDOWN)
    expect(tab.markdown).toBe(DEFAULT_MARKDOWN)
    expect(tab.html).toBe(`<p>${DEFAULT_MARKDOWN}</p>`)
    expect(tab.isDirty).toBe(false)
    expect(tab.filePath).toBeNull()
    expect(tab.id).toMatch(/^tab-/)
  })

  it('returns the active tab or falls back to the first one', () => {
    const tabs = [
      { id: 'a', filePath: null, markdown: 'one', html: '<p>one</p>', isDirty: false },
      { id: 'b', filePath: null, markdown: 'two', html: '<p>two</p>', isDirty: true }
    ]

    expect(getActiveEditorTab(tabs, 'b')).toBe(tabs[1])
    expect(getActiveEditorTab(tabs, 'missing')).toBe(tabs[0])
  })

  it('derives the basename from Windows and POSIX paths', () => {
    expect(getDocumentBasename('C:\\docs\\notes\\file.md', 'untitled')).toBe('file.md')
    expect(getDocumentBasename('/docs/notes/file.md', 'untitled')).toBe('file.md')
    expect(getDocumentBasename(null, 'untitled')).toBe('untitled')
  })

  it('calculates line offsets for cursor jumps', () => {
    const markdown = ['# Title', 'Line 2', 'Line 3'].join('\n')

    expect(getLineOffset(markdown, 1)).toBe(0)
    expect(getLineOffset(markdown, 2)).toBe(8)
    expect(getLineOffset(markdown, 3)).toBe(15)
  })

  it('creates stable keys for search results', () => {
    expect(getSearchResultKey({ filePath: '/docs/file.md', line: 12 })).toBe('/docs/file.md:12')
  })

  it('finds document paths by wiki-style reference candidates', () => {
    const entries = [
      {
        name: 'guides',
        path: '/docs/guides',
        type: 'directory' as const,
        children: [
          {
            name: 'setup.md',
            path: '/docs/guides/setup.md',
            type: 'file' as const
          }
        ]
      },
      {
        name: 'README.md',
        path: '/docs/README.md',
        type: 'file' as const
      }
    ]

    expect(findDocumentPathByReference(entries, 'README')).toBe('/docs/README.md')
    expect(findDocumentPathByReference(entries, 'guides/setup')).toBe('/docs/guides/setup.md')
    expect(findDocumentPathByReference(entries, 'setup.md')).toBe('/docs/guides/setup.md')
    expect(findDocumentPathByReference(entries, 'missing')).toBeNull()
  })
})
