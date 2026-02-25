import { EditorLocale, t } from '../locale'
import { EditorThemeId, THEME_OPTIONS } from '../theme'

interface EditorToolbarProps {
  isBusy: boolean
  canSave: boolean
  isMaximized: boolean
  locale: EditorLocale
  theme: EditorThemeId
  onLocaleChange: (locale: EditorLocale) => void
  onThemeChange: (theme: EditorThemeId) => void
  onNew: () => void
  onOpen: () => void
  onOpenFolder: () => void
  onSave: () => void
  onSaveAs: () => void
  onExportHtml: () => void
  onMinimize: () => void
  onToggleMaximize: () => void
  onClose: () => void
}

export function EditorToolbar(props: EditorToolbarProps): React.JSX.Element {
  const {
    isBusy,
    canSave,
    isMaximized,
    locale,
    theme,
    onLocaleChange,
    onThemeChange,
    onNew,
    onOpen,
    onOpenFolder,
    onSave,
    onSaveAs,
    onExportHtml,
    onMinimize,
    onToggleMaximize,
    onClose
  } = props

  return (
    <header className="editor-toolbar">
      <div className="editor-actions">
        <button
          aria-label={t(locale, 'toolbar.action.new')}
          disabled={isBusy}
          onClick={onNew}
          title={t(locale, 'toolbar.action.new')}
          type="button"
        >
          <span aria-hidden="true" className="action-icon action-icon-new" />
        </button>
        <button
          aria-label={t(locale, 'toolbar.action.open')}
          disabled={isBusy}
          onClick={onOpen}
          title={t(locale, 'toolbar.action.open')}
          type="button"
        >
          <span aria-hidden="true" className="action-icon action-icon-open" />
        </button>
        <button
          aria-label={t(locale, 'toolbar.action.openFolder')}
          disabled={isBusy}
          onClick={onOpenFolder}
          title={t(locale, 'toolbar.action.openFolder')}
          type="button"
        >
          <span aria-hidden="true" className="action-icon action-icon-folder" />
        </button>
        <button
          aria-label={t(locale, 'toolbar.action.save')}
          disabled={isBusy || !canSave}
          onClick={onSave}
          title={t(locale, 'toolbar.action.save')}
          type="button"
        >
          <span aria-hidden="true" className="action-icon action-icon-save" />
        </button>
        <button
          aria-label={t(locale, 'toolbar.action.saveAs')}
          disabled={isBusy}
          onClick={onSaveAs}
          title={t(locale, 'toolbar.action.saveAs')}
          type="button"
        >
          <span aria-hidden="true" className="action-icon action-icon-save-as" />
        </button>
        <button
          aria-label={t(locale, 'toolbar.action.exportHtml')}
          disabled={isBusy}
          onClick={onExportHtml}
          title={t(locale, 'toolbar.action.exportHtml')}
          type="button"
        >
          <span aria-hidden="true" className="action-icon action-icon-export" />
        </button>
        <select
          aria-label={t(locale, 'toolbar.theme')}
          className="theme-select"
          disabled={isBusy}
          onChange={(event) => onThemeChange(event.target.value as EditorThemeId)}
          value={theme}
        >
          {THEME_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="locale-switch" title={t(locale, 'toolbar.language')}>
          <input
            aria-label={t(locale, 'toolbar.language')}
            checked={locale === 'en-US'}
            className="locale-switch-input"
            disabled={isBusy}
            onChange={(event) => onLocaleChange(event.target.checked ? 'en-US' : 'zh-CN')}
            type="checkbox"
          />
          <span aria-hidden="true" className="locale-switch-track">
            <span className="locale-switch-thumb" />
          </span>
          <span aria-hidden="true" className="locale-switch-text">
            {locale === 'en-US' ? 'EN' : '中'}
          </span>
        </label>
      </div>
      <div className="window-controls">
        <button
          aria-label={t(locale, 'toolbar.window.minimize')}
          className="window-control"
          disabled={isBusy}
          onClick={onMinimize}
          title={t(locale, 'toolbar.window.minimize')}
          type="button"
        >
          <span aria-hidden="true" className="window-icon window-icon-minimize" />
        </button>
        <button
          aria-label={isMaximized ? t(locale, 'toolbar.window.restore') : t(locale, 'toolbar.window.maximize')}
          className="window-control"
          disabled={isBusy}
          onClick={onToggleMaximize}
          title={isMaximized ? t(locale, 'toolbar.window.restore') : t(locale, 'toolbar.window.maximize')}
          type="button"
        >
          <span
            aria-hidden="true"
            className={`window-icon ${isMaximized ? 'window-icon-restore' : 'window-icon-maximize'}`}
          />
        </button>
        <button
          aria-label={t(locale, 'toolbar.window.close')}
          className="window-control window-control-danger"
          disabled={isBusy}
          onClick={onClose}
          title={t(locale, 'toolbar.window.close')}
          type="button"
        >
          <span aria-hidden="true" className="window-icon window-icon-close" />
        </button>
      </div>
    </header>
  )
}
