import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLegacyEditorFacade } from '../../application/editorFacade'
import { renderMarkdown } from '../../shared/markdown/renderMarkdown'
import { FileExplorer } from './components/FileExplorer'
import { EditorToolbar } from './components/EditorToolbar'
import { EditorWorkspace } from './components/EditorWorkspace'
import { applyEditorLocale, EditorLocale, loadEditorLocale, saveEditorLocale, t } from './locale'
import { applyEditorTheme, EditorThemeId, loadEditorTheme, saveEditorTheme } from './theme'

function basename(filePath: string | null): string {
  if (!filePath) {
    return 'untitled.md'
  }
  const segments = filePath.split(/[\\/]/)
  return segments[segments.length - 1] || 'untitled.md'
}

function buildExportHtml(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>${body}</body>
</html>`
}

export default function LegacyMarkdownEditorPage(): React.JSX.Element {
  const editor = useLegacyEditorFacade()
  const [isMaximized, setIsMaximized] = useState(false)
  const [theme, setTheme] = useState<EditorThemeId>('rose')
  const [locale, setLocale] = useState<EditorLocale>('zh-CN')
  const previewHtml = useMemo(() => renderMarkdown(editor.document.content), [editor.document.content])
  const fileName = basename(editor.document.filePath)
  const title = `${fileName}${editor.document.isDirty ? ' *' : ''}`

  const refreshMaximizedState = useCallback(async () => {
    const next = await window.api.app.isWindowMaximized()
    setIsMaximized(next)
  }, [])

  useEffect(() => {
    void editor.restoreLastSession()
    void refreshMaximizedState()
    setTheme(loadEditorTheme())
    setLocale(loadEditorLocale())
  }, [editor, refreshMaximizedState])

  useEffect(() => {
    applyEditorTheme(theme)
    saveEditorTheme(theme)
  }, [theme])

  useEffect(() => {
    applyEditorLocale(locale)
    saveEditorLocale(locale)
  }, [locale])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!(event.ctrlKey || event.metaKey)) {
        return
      }
      const key = event.key.toLowerCase()
      if (key === 's') {
        event.preventDefault()
        void editor.saveDocument()
      } else if (key === 'o') {
        event.preventDefault()
        void editor.openDocument()
      } else if (key === 'n') {
        event.preventDefault()
        editor.createNew()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editor])

  return (
    <div className="editor-shell">
      <EditorToolbar
        canSave={editor.document.isDirty}
        isBusy={editor.isBusy}
        isMaximized={isMaximized}
        locale={locale}
        theme={theme}
        onClose={() => void window.api.app.closeWindow()}
        onExportHtml={() => void editor.exportHtmlDocument(buildExportHtml(fileName, previewHtml))}
        onMinimize={() => void window.api.app.minimizeWindow()}
        onNew={editor.createNew}
        onOpen={() => void editor.openDocument()}
        onOpenFolder={() => void editor.openDirectory()}
        onSave={() => void editor.saveDocument()}
        onSaveAs={() => void editor.saveAsDocument()}
        onLocaleChange={setLocale}
        onThemeChange={setTheme}
        onToggleMaximize={async () => {
          await window.api.app.toggleMaximizeWindow()
          await refreshMaximizedState()
        }}
      />

      <div className="editor-body">
        <FileExplorer
          className="explorer-sidebar resizable-panel"
          currentFilePath={editor.document.filePath}
          directoryEntries={editor.directoryEntries}
          directoryPath={editor.directoryPath}
          isBusy={editor.isDirectoryBusy}
          locale={locale}
          onOpenFile={(filePath) => void editor.openRecentDocument(filePath)}
          onOpenFolder={() => void editor.openDirectory()}
          onOpenRecent={(filePath) => void editor.openRecentDocument(filePath)}
          recentFiles={editor.recentFiles}
        />
        <div className="editor-main">
          <div className="editor-meta">
            <div className="editor-meta-left">
              <span className="file-name">{title}</span>
              <span className={`status status-${editor.status.tone}`}>{editor.status.message}</span>
            </div>
            <label
              className="autosave-switch"
              title={`${t(locale, 'toolbar.autoSave')}: ${editor.autoSaveEnabled ? 'ON' : 'OFF'}`}
            >
              <input
                aria-label={t(locale, 'toolbar.autoSave')}
                checked={editor.autoSaveEnabled}
                className="autosave-switch-input"
                onChange={(event) => editor.setAutoSaveEnabled(event.target.checked)}
                type="checkbox"
              />
              <span aria-hidden="true" className="autosave-switch-track">
                <span className="autosave-switch-thumb" />
              </span>
              <span className="autosave-switch-label">{t(locale, 'toolbar.autoSave')}</span>
            </label>
          </div>
          <EditorWorkspace
            content={editor.document.content}
            onChange={editor.updateContent}
            previewTitle={t(locale, 'panel.preview')}
            markdownTitle={t(locale, 'panel.markdown')}
            previewHtml={previewHtml}
          />
        </div>
      </div>
    </div>
  )
}
