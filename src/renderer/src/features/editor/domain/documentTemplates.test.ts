import { describe, expect, it } from 'vitest'
import {
  DOCUMENT_TEMPLATES,
  getDocumentTemplate,
  getDocumentTemplateLabel
} from './documentTemplates'

describe('documentTemplates', () => {
  it('returns a matching template by id', () => {
    const template = getDocumentTemplate('meeting-notes')

    expect(template.id).toBe('meeting-notes')
    expect(template.markdown).toContain('# Meeting Notes')
  })

  it('falls back to the blank template for unknown ids', () => {
    const template = getDocumentTemplate('unknown-template' as never)

    expect(template.id).toBe('blank')
  })

  it('translates template labels through locale messages', () => {
    const labels = DOCUMENT_TEMPLATES.map((template) => ({
      zh: getDocumentTemplateLabel('zh-CN', template),
      en: getDocumentTemplateLabel('en-US', template)
    }))

    expect(labels[0]).toEqual({ zh: '空白文档', en: 'Blank Document' })
    expect(labels.some((entry) => entry.zh === '项目 README')).toBe(true)
    expect(labels.some((entry) => entry.en === 'Weekly Plan')).toBe(true)
  })
})
