import { EditorLocale, t } from '../../settings'

interface EditorStatusBarProps {
  locale: EditorLocale
  title: string
  statusTone: 'idle' | 'success' | 'error'
  statusMessage: string
  autoSaveEnabled: boolean
  onToggleAutoSave: (enabled: boolean) => void
}

export function EditorStatusBar(props: EditorStatusBarProps): React.JSX.Element {
  const { locale, title, statusTone, statusMessage, autoSaveEnabled, onToggleAutoSave } = props

  return (
    <div className="editor-meta">
      <div className="editor-meta-left">
        <span className="file-name">{title}</span>
        <span className={`status status-${statusTone}`}>{statusMessage}</span>
      </div>
      <label
        className="autosave-switch"
        title={`${t(locale, 'toolbar.autoSave')}: ${autoSaveEnabled ? 'ON' : 'OFF'}`}
      >
        <input
          aria-label={t(locale, 'toolbar.autoSave')}
          checked={autoSaveEnabled}
          className="autosave-switch-input"
          onChange={(event) => onToggleAutoSave(event.target.checked)}
          type="checkbox"
        />
        <span aria-hidden="true" className="autosave-switch-track">
          <span className="autosave-switch-thumb" />
        </span>
        <span className="autosave-switch-label">{t(locale, 'toolbar.autoSave')}</span>
      </label>
    </div>
  )
}
