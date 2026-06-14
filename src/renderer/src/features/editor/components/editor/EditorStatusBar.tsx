import { EditorLocale, t } from '../../settings'

interface EditorStatusBarProps {
  locale: EditorLocale
  title: string
  statusTone: 'idle' | 'success' | 'error'
  statusMessage: string
  autoSaveEnabled: boolean
  lastSavedAt: number | null
  onToggleAutoSave: (enabled: boolean) => void
}

export function EditorStatusBar(props: EditorStatusBarProps): React.JSX.Element {
  const {
    locale,
    title,
    statusTone,
    statusMessage,
    autoSaveEnabled,
    lastSavedAt,
    onToggleAutoSave
  } = props
  const savedTimeLabel = lastSavedAt
    ? t(locale, 'status.lastSaved', {
        time: new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(lastSavedAt))
      })
    : null

  return (
    <div className="editor-meta">
      <div className="editor-meta-left">
        <span className="file-name">{title}</span>
        <span className={`status status-${statusTone}`}>{statusMessage}</span>
        {savedTimeLabel ? <span className="last-saved">{savedTimeLabel}</span> : null}
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
