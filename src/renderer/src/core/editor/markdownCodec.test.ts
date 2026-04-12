import { describe, expect, it } from 'vitest'
import { markdownToHtml } from './markdownCodec'

describe('markdownCodec', () => {
  it('renders wiki links as clickable preview references', () => {
    const html = markdownToHtml('See [[Project README]] for details.')

    expect(html).toContain('class="preview-document-link"')
    expect(html).toContain('data-document-ref="Project%20README"')
    expect(html).toContain('>Project README</a>')
  })

  it('renders headings with stable anchor ids', () => {
    const html = markdownToHtml('# Getting Started')

    expect(html).toContain('id="getting-started"')
    expect(html).toContain('class="preview-heading-anchor"')
  })
})
