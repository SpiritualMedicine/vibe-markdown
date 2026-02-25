import LegacyMarkdownEditorPage from './LegacyMarkdownEditorPage'
import NewEditorPage from './ui/NewEditorPage'
import { EditorStoreProvider } from '../../state/editorStore'

const USE_NEW_ENGINE = true

export default function MarkdownEditorPage(): React.JSX.Element {
  if (!USE_NEW_ENGINE) {
    return <LegacyMarkdownEditorPage />
  }

  return (
    <EditorStoreProvider>
      <NewEditorPage />
    </EditorStoreProvider>
  )
}
