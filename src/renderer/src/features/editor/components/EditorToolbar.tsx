import { EditorLocale, LOCALE_OPTIONS, t } from '../locale'
import { EditorThemeId, THEME_OPTIONS } from '../theme'

interface EditorToolbarProps {
  isBusy: boolean
  canSave: boolean
  isMaximized: boolean
  locale: EditorLocale
  theme: EditorThemeId
  recentFiles: string[]
  autoSaveEnabled: boolean
  onLocaleChange: (locale: EditorLocale) => void
  onThemeChange: (theme: EditorThemeId) => void
  onToggleAutoSave: (enabled: boolean) => void
  onOpenRecent: (filePath: string) => void
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
    recentFiles,
    autoSaveEnabled,
    onLocaleChange,
    onThemeChange,
    onToggleAutoSave,
    onOpenRecent,
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
          className="recent-select"
          disabled={isBusy || recentFiles.length === 0}
          defaultValue=""
          onChange={(event) => {
            const value = event.target.value
            if (!value) {
              return
            }
            onOpenRecent(value)
            event.target.value = ''
          }}
        >
          <option value="">{t(locale, 'toolbar.recentFiles')}</option>
          {recentFiles.map((filePath) => (
            <option key={filePath} value={filePath}>
              {filePath}
            </option>
          ))}
        </select>
        <label className="autosave-toggle">
          <input
            checked={autoSaveEnabled}
            disabled={isBusy}
            onChange={(event) => onToggleAutoSave(event.target.checked)}
            type="checkbox"
          />
          {t(locale, 'toolbar.autoSave')}
        </label>
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
        <select
          aria-label={t(locale, 'toolbar.language')}
          className="language-select"
          disabled={isBusy}
          onChange={(event) => onLocaleChange(event.target.value as EditorLocale)}
          value={locale}
        >
          {LOCALE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
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
