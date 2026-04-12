import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from 'react'

const MIN_PANE_WIDTH = 280
const MIN_DIRECTORY_WIDTH = 240
const MIN_MAIN_WIDTH = 760

interface UsePaneResizersOptions {
  showPreview: boolean
}

interface UsePaneResizersResult {
  bodyRef: React.RefObject<HTMLDivElement | null>
  workspaceRef: React.RefObject<HTMLElement | null>
  directoryPaneWidth: number | null
  editorPaneWidth: number | null
  onStartDirectoryResize: (event: ReactPointerEvent<HTMLDivElement>) => void
  onStartEditorResize: (event: ReactPointerEvent<HTMLDivElement>) => void
}

export function usePaneResizers(options: UsePaneResizersOptions): UsePaneResizersResult {
  const { showPreview } = options
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const workspaceRef = useRef<HTMLElement | null>(null)
  const [directoryPaneWidth, setDirectoryPaneWidth] = useState<number | null>(null)
  const [editorPaneWidth, setEditorPaneWidth] = useState<number | null>(null)

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
        const previewMinWidth = showPreview ? MIN_PANE_WIDTH : 0
        const maxEditorWidth = Math.max(MIN_PANE_WIDTH, workspaceWidth - previewMinWidth)
        return Math.min(maxEditorWidth, Math.max(MIN_PANE_WIDTH, current))
      })
    })
    observer.observe(workspace)
    return () => observer.disconnect()
  }, [showPreview])

  const onStartDirectoryResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
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
        const nextWidth = Math.min(
          maxDirectoryWidth,
          Math.max(MIN_DIRECTORY_WIDTH, startWidth + deltaX)
        )
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
    },
    [directoryPaneWidth]
  )

  const onStartEditorResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const workspace = workspaceRef.current
      if (!workspace) {
        return
      }
      const editorPanel = workspace.querySelector<HTMLElement>('.editor-input-panel')
      if (!editorPanel) {
        return
      }

      const startX = event.clientX
      const startWidth = editorPaneWidth ?? editorPanel.getBoundingClientRect().width
      const workspaceWidth = workspace.getBoundingClientRect().width
      const previewMinWidth = showPreview ? MIN_PANE_WIDTH : 0
      const maxEditorWidth = Math.max(MIN_PANE_WIDTH, workspaceWidth - previewMinWidth)

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
    },
    [editorPaneWidth, showPreview]
  )

  return {
    bodyRef,
    workspaceRef,
    directoryPaneWidth,
    editorPaneWidth,
    onStartDirectoryResize,
    onStartEditorResize
  }
}
