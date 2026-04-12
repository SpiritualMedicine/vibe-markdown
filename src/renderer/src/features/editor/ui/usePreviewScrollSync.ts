import { useEffect, useRef } from 'react'

interface UsePreviewScrollSyncOptions {
  activeTabId: string | undefined
  showPreview: boolean
  editorRef: React.RefObject<HTMLTextAreaElement | null>
  previewRef: React.RefObject<HTMLElement | null>
}

export function usePreviewScrollSync(options: UsePreviewScrollSyncOptions): void {
  const { activeTabId, showPreview, editorRef, previewRef } = options
  const syncSourceRef = useRef<'editor' | 'preview' | null>(null)

  useEffect(() => {
    const editor = editorRef.current
    const preview = previewRef.current
    if (!editor || !preview || !showPreview) {
      return
    }

    let releaseTimer: number | undefined

    const syncScroll = (
      source: HTMLElement,
      target: HTMLElement,
      sourceKey: 'editor' | 'preview'
    ): void => {
      if (syncSourceRef.current && syncSourceRef.current !== sourceKey) {
        return
      }
      syncSourceRef.current = sourceKey
      const sourceRange = source.scrollHeight - source.clientHeight
      const targetRange = target.scrollHeight - target.clientHeight
      const ratio = sourceRange <= 0 ? 0 : source.scrollTop / sourceRange
      target.scrollTop = ratio * targetRange

      if (releaseTimer) {
        window.clearTimeout(releaseTimer)
      }
      releaseTimer = window.setTimeout(() => {
        syncSourceRef.current = null
      }, 80)
    }

    const handleEditorScroll = (): void => syncScroll(editor, preview, 'editor')
    const handlePreviewScroll = (): void => syncScroll(preview, editor, 'preview')

    editor.addEventListener('scroll', handleEditorScroll)
    preview.addEventListener('scroll', handlePreviewScroll)
    return () => {
      if (releaseTimer) {
        window.clearTimeout(releaseTimer)
      }
      editor.removeEventListener('scroll', handleEditorScroll)
      preview.removeEventListener('scroll', handlePreviewScroll)
    }
  }, [activeTabId, editorRef, previewRef, showPreview])
}
