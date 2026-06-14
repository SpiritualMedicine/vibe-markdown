import { useState, useCallback, type JSX } from 'react'
import { t, type EditorLocale } from '../../settings'

interface UserTemplate {
  id: string
  name: string
  markdown: string
  createdAt: number
  updatedAt: number
}

interface TemplateManagerDialogProps {
  locale: EditorLocale
  isOpen: boolean
  onClose: () => void
  onUseTemplate: (templateId: string) => void
  onDeleteTemplate: (templateId: string) => Promise<void>
  templates: UserTemplate[]
}

export function TemplateManagerDialog({
  locale,
  isOpen,
  onClose,
  onUseTemplate,
  onDeleteTemplate,
  templates
}: TemplateManagerDialogProps): JSX.Element | null {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = useCallback(
    async (template: UserTemplate) => {
      if (window.confirm(t(locale, 'template.deleteConfirm', { name: template.name }))) {
        setDeletingId(template.id)
        await onDeleteTemplate(template.id)
        setDeletingId(null)
      }
    },
    [locale, onDeleteTemplate]
  )

  if (!isOpen) return null

  return (
    <div className="template-manager-overlay" onClick={onClose}>
      <div className="template-manager-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="template-manager-header">
          <h2>{t(locale, 'template.manage')}</h2>
          <button className="template-manager-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="template-manager-content">
          {templates.length === 0 ? (
            <div className="template-manager-empty">{t(locale, 'template.noCustom')}</div>
          ) : (
            <div className="template-manager-list">
              {templates.map((template) => (
                <div key={template.id} className="template-manager-item">
                  <div className="template-manager-item-info">
                    <span className="template-manager-item-name">{template.name}</span>
                    <span className="template-manager-item-date">
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="template-manager-item-actions">
                    <button
                      className="template-manager-use-button"
                      onClick={() => onUseTemplate(template.id)}
                      disabled={deletingId === template.id}
                    >
                      {t(locale, 'toolbar.action.new')}
                    </button>
                    <button
                      className="template-manager-delete-button"
                      onClick={() => handleDelete(template)}
                      disabled={deletingId === template.id}
                    >
                      {deletingId === template.id ? '...' : '×'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
