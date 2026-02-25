import { useMarkdownEditor } from '../features/editor/useMarkdownEditor'

// Compatibility facade used by the legacy engine path during migration.
export function useLegacyEditorFacade() {
  return useMarkdownEditor()
}
