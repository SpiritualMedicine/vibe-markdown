import { marked } from 'marked'
import TurndownService from 'turndown'
import { createHeadingSlug } from '../../features/editor/domain'

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-'
})

const renderer = new marked.Renderer()
renderer.heading = ({ tokens, depth }) => {
  const text = tokens
    .map((token) => ('raw' in token ? token.raw : ''))
    .join('')
    .trim()
  const content = tokens.map((token) => marked.Parser.parseInline([token])).join('')
  const id = createHeadingSlug(text) || `heading-${depth}`
  return `<h${depth} id="${id}"><a class="preview-heading-anchor" href="#${id}" aria-hidden="true">#</a>${content}</h${depth}>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

const wikiLinkExtension = {
  name: 'wikilink',
  level: 'inline' as const,
  start(src: string): number | undefined {
    const index = src.indexOf('[[')
    return index >= 0 ? index : undefined
  },
  tokenizer(src: string) {
    const match = /^\[\[([^[\]]+?)\]\]/.exec(src)
    if (!match) {
      return undefined
    }
    const reference = match[1].trim()
    return {
      type: 'wikilink',
      raw: match[0],
      reference
    }
  },
  renderer(token: { reference: string }): string {
    const reference = token.reference.trim()
    const encodedReference = encodeURIComponent(reference)
    return `<a href="#document-ref-${encodedReference}" class="preview-document-link" data-document-ref="${encodedReference}">${escapeHtml(reference)}</a>`
  }
}

marked.use({ extensions: [wikiLinkExtension] })

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false, renderer }) as string
}

export function htmlToMarkdown(html: string): string {
  return turndown.turndown(html)
}
