import { describe, expect, it } from 'vitest'
import { createHeadingSlug } from './headingSlug'

describe('createHeadingSlug', () => {
  it('normalizes whitespace and punctuation', () => {
    expect(createHeadingSlug(' Hello, Markdown Leo! ')).toBe('hello-markdown-leo')
  })

  it('strips inline html before generating the slug', () => {
    expect(createHeadingSlug('Title with <code>tag</code> inside')).toBe('title-with-tag-inside')
  })

  it('keeps unicode letters and numbers', () => {
    expect(createHeadingSlug('第 2 章 入门')).toBe('第-2-章-入门')
  })
})
