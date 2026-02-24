import { useCallback, useEffect, useMemo, useState } from 'react'
import { EditorToolbar } from './components/EditorToolbar'
import { EditorWorkspace } from './components/EditorWorkspace'
import { useMarkdownEditor } from './useMarkdownEditor'
import { renderMarkdown } from '../../shared/markdown/renderMarkdown'

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
    <style>
      body { max-width: 860px; margin: 36px auto; padding: 0 16px; font: 16px/1.7 Georgia, serif; color: #222; }
      h1,h2,h3,h4,h5,h6 { line-height: 1.3; margin: 1.1em 0 0.45em; }
      pre { background: #1d2430; color: #eef5ff; border-radius: 8px; padding: 12px; overflow: auto; }
      code { font-family: Consolas, monospace; background: #eef2fa; border-radius: 4px; padding: 0.1em 0.32em; }
      pre code { background: transparent; padding: 0; }
      blockquote { border-left: 4px solid #9eb7de; padding-left: 10px; color: #42526f; margin: 0.7em 0; }
      a { color: #2f5f9a; }
    </style>
  </head>
  <body>${body}</body>
</html>`
}

export default function MarkdownEditorPage(): React.JSX.Element {
  const editor = useMarkdownEditor()
  const [isMaximized, setIsMaximized] = useState(false)
  const previewHtml = useMemo(() => renderMarkdown(editor.document.content), [editor.document.content])
  const fileName = basename(editor.document.filePath)
  const title = `${fileName}${editor.document.isDirty ? ' *' : ''}`

  const refreshMaximizedState = useCallback(async () => {
    const next = await window.api.app.isWindowMaximized()
    setIsMaximized(next)
  }, [])

  useEffect(() => {
    void editor.restoreLastSession()
  }, [editor])

  useEffect(() => {
    void refreshMaximizedState()
  }, [refreshMaximizedState])

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
        isBusy={editor.isBusy}
        canSave={editor.document.isDirty}
        isMaximized={isMaximized}
        recentFiles={editor.recentFiles}
        autoSaveEnabled={editor.autoSaveEnabled}
        onToggleAutoSave={editor.setAutoSaveEnabled}
        onOpenRecent={(filePath) => void editor.openRecentDocument(filePath)}
        onNew={editor.createNew}
        onOpen={() => void editor.openDocument()}
        onOpenFolder={() => void editor.openDirectory()}
        onSave={() => void editor.saveDocument()}
        onSaveAs={() => void editor.saveAsDocument()}
        onExportHtml={() => void editor.exportHtmlDocument(buildExportHtml(fileName, previewHtml))}
        onMinimize={() => void window.api.app.minimizeWindow()}
        onToggleMaximize={async () => {
          await window.api.app.toggleMaximizeWindow()
          await refreshMaximizedState()
        }}
        onClose={() => void window.api.app.closeWindow()}
      />
      <div className="editor-meta">
        <span className="file-name">{title}</span>
        <span className={`status status-${editor.status.tone}`}>{editor.status.message}</span>
      </div>
      <EditorWorkspace
        content={editor.document.content}
        directoryEntries={editor.directoryEntries}
        directoryPath={editor.directoryPath}
        currentFilePath={editor.document.filePath}
        isDirectoryBusy={editor.isDirectoryBusy}
        onOpenFolder={() => void editor.openDirectory()}
        onOpenFileFromDirectory={(filePath) => void editor.openRecentDocument(filePath)}
        previewHtml={previewHtml}
        onChange={editor.updateContent}
      />
    </div>
  )
}
