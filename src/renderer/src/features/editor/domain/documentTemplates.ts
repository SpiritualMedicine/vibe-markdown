import type { EditorLocale, LocaleKey } from '../settings'
import { t } from '../settings'

export type DocumentTemplateId = 'blank' | 'meeting-notes' | 'project-readme' | 'weekly-plan'

export interface DocumentTemplate {
  id: DocumentTemplateId
  labelKey: LocaleKey
  markdown: string
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'blank',
    labelKey: 'template.blank',
    markdown: '# Untitled\n\nStart writing here.\n'
  },
  {
    id: 'meeting-notes',
    labelKey: 'template.meetingNotes',
    markdown: [
      '# Meeting Notes',
      '',
      '- Date:',
      '- Attendees:',
      '- Topic:',
      '',
      '## Agenda',
      '',
      '- ',
      '',
      '## Notes',
      '',
      '- ',
      '',
      '## Action Items',
      '',
      '- [ ] '
    ].join('\n')
  },
  {
    id: 'project-readme',
    labelKey: 'template.projectReadme',
    markdown: [
      '# Project Name',
      '',
      'Short description of the project.',
      '',
      '## Features',
      '',
      '- ',
      '',
      '## Getting Started',
      '',
      '```bash',
      '# install',
      '',
      '# run',
      '```',
      '',
      '## Usage',
      '',
      'Describe the main workflow here.',
      '',
      '## Project Structure',
      '',
      '- `src/`',
      '- `docs/`',
      '',
      '## License',
      '',
      'MIT'
    ].join('\n')
  },
  {
    id: 'weekly-plan',
    labelKey: 'template.weeklyPlan',
    markdown: [
      '# Weekly Plan',
      '',
      '## Goals',
      '',
      '- ',
      '',
      '## Top Priorities',
      '',
      '- [ ] ',
      '- [ ] ',
      '- [ ] ',
      '',
      '## Schedule',
      '',
      '### Monday',
      '',
      '- ',
      '',
      '### Tuesday',
      '',
      '- ',
      '',
      '### Wednesday',
      '',
      '- ',
      '',
      '### Thursday',
      '',
      '- ',
      '',
      '### Friday',
      '',
      '- ',
      '',
      '## Notes',
      '',
      '- '
    ].join('\n')
  }
]

export function getDocumentTemplate(templateId: DocumentTemplateId): DocumentTemplate {
  return DOCUMENT_TEMPLATES.find((template) => template.id === templateId) ?? DOCUMENT_TEMPLATES[0]
}

export function getDocumentTemplateLabel(
  locale: EditorLocale,
  template: Pick<DocumentTemplate, 'labelKey'>
): string {
  return t(locale, template.labelKey)
}
