import { describe, expect, it } from 'vitest'
import {
  extractWikiReferences,
  getMarkdownDocumentTitle,
  getReferenceCandidates,
  hasMarkdownExtension,
  normalizeReference,
  stripMarkdownExtension
} from './workspaceIndex'

describe('workspaceIndex', () => {
  it('detects supported markdown extensions', () => {
    expect(hasMarkdownExtension('README.md')).toBe(true)
    expect(hasMarkdownExtension('notes.markdown')).toBe(true)
    expect(hasMarkdownExtension('draft.txt')).toBe(true)
    expect(hasMarkdownExtension('image.png')).toBe(false)
  })

  it('normalizes references and strips markdown extensions', () => {
    expect(normalizeReference('./Guides\\Setup')).toBe('guides/setup')
    expect(stripMarkdownExtension('README.md')).toBe('README')
    expect(stripMarkdownExtension('notes.markdown')).toBe('notes')
  })

  it('builds candidate reference forms for a target document', () => {
    expect(getReferenceCandidates('/docs', '/docs/guides/setup.md')).toEqual([
      'setup.md',
      'setup',
      'guides/setup.md',
      'guides/setup'
    ])
  })

  it('extracts wiki references from a line', () => {
    expect(extractWikiReferences('See [[Project README]] and [[guides/setup]]')).toEqual([
      'project readme',
      'guides/setup'
    ])
  })

  it('derives a title from the first non-empty line', () => {
    expect(getMarkdownDocumentTitle('/docs/readme.md', ['', '# Hello', 'Body'])).toBe('Hello')
    expect(getMarkdownDocumentTitle('/docs/readme.md', ['', ''])).toBe('readme.md')
  })
})
