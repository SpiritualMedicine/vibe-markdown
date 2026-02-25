import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'
import { EditorExtensionRegistry } from './extensionRegistry'

interface TiptapMarkdownEditorProps {
  html: string
  registry: EditorExtensionRegistry
  onUpdateHtml: (html: string) => void
}

export function TiptapMarkdownEditor(props: TiptapMarkdownEditorProps): React.JSX.Element {
  const { html, registry, onUpdateHtml } = props
  const editor = useEditor({
    extensions: registry.getAll(),
    content: html,
    onUpdate: ({ editor: next }) => {
      onUpdateHtml(next.getHTML())
    }
  })

  useEffect(() => {
    if (!editor) {
      return
    }
    const current = editor.getHTML()
    if (current !== html) {
      editor.commands.setContent(html, { emitUpdate: false })
    }
  }, [editor, html])

  return <EditorContent className="tiptap-editor" editor={editor} />
}
