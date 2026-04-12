import NewEditorPage from './ui/NewEditorPage'
import { EditorStoreProvider } from '../../state'

export default function MarkdownEditorPage(): React.JSX.Element {
  return (
    <EditorStoreProvider>
      <NewEditorPage />
    </EditorStoreProvider>
  )
}
