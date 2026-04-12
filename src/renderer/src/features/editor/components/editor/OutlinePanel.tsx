import type { OutlineHeading } from '../../domain'
import type { EditorLocale } from '../../settings'
import { t } from '../../settings'

interface OutlinePanelProps {
  locale: EditorLocale
  outline: OutlineHeading[]
  onSelectHeading: (headingId: string, line: number) => void
}

export function OutlinePanel(props: OutlinePanelProps): React.JSX.Element {
  const { locale, outline, onSelectHeading } = props

  return (
    <aside className="panel outline-panel">
      <div className="panel-label">{t(locale, 'panel.outline')}</div>
      <div className="outline-content">
        {outline.length > 0 ? (
          <ul className="outline-list">
            {outline.map((heading) => (
              <li key={heading.id}>
                <button
                  className="outline-link"
                  onClick={() => onSelectHeading(heading.id, heading.line)}
                  style={{ paddingLeft: `${heading.level * 12}px` }}
                  type="button"
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="explorer-empty">{t(locale, 'outline.empty')}</div>
        )}
      </div>
    </aside>
  )
}
