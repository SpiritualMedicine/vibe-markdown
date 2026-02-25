import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react'
import { EditorToolbar } from '../components/EditorToolbar'
import { FileExplorer } from '../components/FileExplorer'
import { t } from '../locale'
import { useEditorStore } from '../../../state/editorStore'

function basename(filePath: string | null): string {
  if (!filePath) {
    return 'untitled.md'
  }
  const segments = filePath.split(/[\\/]/)
  return segments[segments.length - 1] || 'untitled.md'
}

export default function NewEditorPage(): React.JSX.Element {
  const { state, commands } = useEditorStore()
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const workspaceRef = useRef<HTMLElement | null>(null)
  const [directoryPaneWidth, setDirectoryPaneWidth] = useState<number | null>(null)
  const [editorPaneWidth, setEditorPaneWidth] = useState<number | null>(null)
  const fileName = basename(state.document.filePath)
  const title = `${fileName}${state.document.isDirty ? ' *' : ''}`
  const MIN_PANE_WIDTH = 280
  const MIN_DIRECTORY_WIDTH = 200
  const MIN_MAIN_WIDTH = 620

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!(event.ctrlKey || event.metaKey)) {
        return
      }
      const key = event.key.toLowerCase()
      if (key === 's') {
        event.preventDefault()
        void commands.saveDoc()
      } else if (key === 'o') {
        event.preventDefault()
        void commands.openDoc()
      } else if (key === 'n') {
        event.preventDefault()
        void commands.newDoc()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [commands])

  useEffect(() => {
    const body = bodyRef.current
    if (!body) {
      return
    }

    const observer = new ResizeObserver(() => {
      setDirectoryPaneWidth((current) => {
        if (current === null) {
          return current
        }
        const bodyWidth = body.getBoundingClientRect().width
        const maxDirectoryWidth = Math.max(MIN_DIRECTORY_WIDTH, bodyWidth - MIN_MAIN_WIDTH)
        return Math.min(maxDirectoryWidth, Math.max(MIN_DIRECTORY_WIDTH, current))
      })
    })
    observer.observe(body)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const workspace = workspaceRef.current
    if (!workspace) {
      return
    }

    const observer = new ResizeObserver(() => {
      setEditorPaneWidth((current) => {
        if (current === null) {
          return current
        }
        const workspaceWidth = workspace.getBoundingClientRect().width
        const maxEditorWidth = Math.max(MIN_PANE_WIDTH, workspaceWidth - MIN_PANE_WIDTH)
        return Math.min(maxEditorWidth, Math.max(MIN_PANE_WIDTH, current))
      })
    })
    observer.observe(workspace)
    return () => observer.disconnect()
  }, [])

  const onStartDirectoryResize = useCallback((event: ReactPointerEvent<HTMLDivElement>): void => {
    const body = bodyRef.current
    if (!body) {
      return
    }
    const explorer = body.querySelector<HTMLElement>('.explorer-sidebar')
    if (!explorer) {
      return
    }

    const startX = event.clientX
    const startWidth = directoryPaneWidth ?? explorer.getBoundingClientRect().width
    const bodyWidth = body.getBoundingClientRect().width
    const maxDirectoryWidth = Math.max(MIN_DIRECTORY_WIDTH, bodyWidth - MIN_MAIN_WIDTH)

    const onPointerMove = (moveEvent: PointerEvent): void => {
      const deltaX = moveEvent.clientX - startX
      const nextWidth = Math.min(maxDirectoryWidth, Math.max(MIN_DIRECTORY_WIDTH, startWidth + deltaX))
      setDirectoryPaneWidth(nextWidth)
    }

    const onPointerUp = (): void => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      document.body.classList.remove('is-resizing')
    }

    document.body.classList.add('is-resizing')
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }, [directoryPaneWidth])

  const onStartResize = useCallback((event: ReactPointerEvent<HTMLDivElement>): void => {
    const workspace = workspaceRef.current
    if (!workspace) {
      return
    }
    const panels = workspace.querySelectorAll<HTMLElement>('.editor-input-panel, .editor-preview-panel')
    const editorPanel = panels[0]
    if (!editorPanel) {
      return
    }

    const startX = event.clientX
    const startWidth = editorPaneWidth ?? editorPanel.getBoundingClientRect().width
    const workspaceWidth = workspace.getBoundingClientRect().width
    const maxEditorWidth = Math.max(MIN_PANE_WIDTH, workspaceWidth - MIN_PANE_WIDTH)

    const onPointerMove = (moveEvent: PointerEvent): void => {
      const deltaX = moveEvent.clientX - startX
      const nextWidth = Math.min(maxEditorWidth, Math.max(MIN_PANE_WIDTH, startWidth + deltaX))
      setEditorPaneWidth(nextWidth)
    }

    const onPointerUp = (): void => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      document.body.classList.remove('is-resizing')
    }

    document.body.classList.add('is-resizing')
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }, [editorPaneWidth])

  return (
    <div className="editor-shell">
      <EditorToolbar
        autoSaveEnabled={state.ui.autoSaveEnabled}
        canSave={state.document.isDirty}
        isBusy={state.ui.isBusy}
        isMaximized={state.ui.isWindowMaximized}
        locale={state.ui.locale}
        theme={state.ui.theme}
        onClose={() => void commands.closeWindow()}
        onExportHtml={() => void commands.exportHtml()}
        onLocaleChange={(locale) => void commands.setLocale(locale)}
        onMinimize={() => void commands.minimizeWindow()}
        onNew={() => void commands.newDoc()}
        onOpen={() => void commands.openDoc()}
        onOpenFolder={() => void commands.openFolder()}
        onOpenRecent={(filePath) => void commands.openFromPath(filePath)}
        onSave={() => void commands.saveDoc()}
        onSaveAs={() => void commands.saveAs()}
        onThemeChange={(theme) => void commands.setTheme(theme)}
        onToggleAutoSave={(enabled) => void commands.toggleAutoSave(enabled)}
        onToggleMaximize={() => void commands.toggleMaximizeWindow()}
        recentFiles={state.workspace.recentFiles}
      />

      <div className="editor-body" ref={bodyRef}>
        <FileExplorer
          className="explorer-sidebar"
          currentFilePath={state.document.filePath}
          directoryEntries={state.workspace.directoryEntries}
          directoryPath={state.workspace.directoryPath}
          isBusy={state.ui.isDirectoryBusy}
          locale={state.ui.locale}
          onOpenFile={(filePath) => void commands.openFromPath(filePath)}
          onOpenFolder={() => void commands.openFolder()}
          style={directoryPaneWidth === null ? undefined : { width: `${directoryPaneWidth}px` }}
        />
        <div className="sidebar-resizer" onPointerDown={onStartDirectoryResize} role="separator" />

        <div className="editor-main">
          <div className="editor-meta">
            <span className="file-name">{title}</span>
            <span className={`status status-${state.ui.status.tone}`}>{state.ui.status.message}</span>
          </div>

          <main className="editor-workspace" ref={workspaceRef}>
            <section
              className="panel editor-input-panel"
              style={editorPaneWidth === null ? undefined : { width: `${editorPaneWidth}px` }}
            >
              <div className="panel-label">{t(state.ui.locale, 'panel.markdown')}</div>
              <textarea
                className="editor-textarea"
                onChange={(event) => void commands.setEditorMarkdown(event.target.value)}
                spellCheck={false}
                value={state.document.markdown}
              />
            </section>
            <div className="editor-resizer" onPointerDown={onStartResize} role="separator" />
            <section className="panel editor-preview-panel">
              <div className="panel-label">{t(state.ui.locale, 'panel.preview')}</div>
              <article className="preview-content" dangerouslySetInnerHTML={{ __html: state.document.html }} />
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
