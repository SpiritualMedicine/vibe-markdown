import type { DocumentBacklink } from '../../../../../../shared'
import type { EditorLocale } from '../../settings'
import { t } from '../../settings'

interface BacklinksPanelProps {
  backlinks: DocumentBacklink[]
  isBusy: boolean
  locale: EditorLocale
  hasDocumentPath: boolean
  onOpenBacklink: (filePath: string, line: number) => void
}

export function BacklinksPanel(props: BacklinksPanelProps): React.JSX.Element {
  const { backlinks, hasDocumentPath, isBusy, locale, onOpenBacklink } = props

  let content: React.JSX.Element
  if (!hasDocumentPath) {
    content = <div className="explorer-empty">{t(locale, 'backlinks.unsaved')}</div>
  } else if (isBusy) {
    content = <div className="explorer-empty">{t(locale, 'backlinks.searching')}</div>
  } else if (backlinks.length === 0) {
    content = <div className="explorer-empty">{t(locale, 'backlinks.empty')}</div>
  } else {
    content = (
      <ul className="backlinks-list">
        {backlinks.map((backlink) => (
          <li key={`${backlink.sourcePath}:${backlink.line}`}>
            <button
              className="backlink-link"
              onClick={() => onOpenBacklink(backlink.sourcePath, backlink.line)}
              type="button"
            >
              <span className="backlink-title">{backlink.title}</span>
              <span className="backlink-meta">
                {backlink.fileName}:{backlink.line}
              </span>
              <span className="backlink-snippet">{backlink.snippet}</span>
            </button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <aside className="panel backlinks-panel">
      <div className="panel-label">{t(locale, 'panel.backlinks')}</div>
      <div className="outline-content">{content}</div>
    </aside>
  )
}
