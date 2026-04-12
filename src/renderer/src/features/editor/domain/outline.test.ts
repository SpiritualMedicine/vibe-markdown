import { describe, expect, it } from 'vitest'
import { extractMarkdownOutline } from './outline'

describe('extractMarkdownOutline', () => {
  it('extracts headings with level, line, and slug id', () => {
    const markdown = ['# Hello World', '', '## Section One', 'Paragraph', '### 第 2 节'].join('\n')

    expect(extractMarkdownOutline(markdown)).toEqual([
      { id: 'hello-world', level: 1, text: 'Hello World', line: 1 },
      { id: 'section-one', level: 2, text: 'Section One', line: 3 },
      { id: '第-2-节', level: 3, text: '第 2 节', line: 5 }
    ])
  })

  it('skips empty or invalid headings', () => {
    const markdown = ['#', 'Plain text', '###   '].join('\n')

    expect(extractMarkdownOutline(markdown)).toEqual([])
  })
})
