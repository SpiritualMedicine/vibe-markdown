import { Link } from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import type { Extensions } from '@tiptap/react'

export interface EditorExtensionRegistry {
  register: (...extensions: Extensions) => void
  getAll: () => Extensions
}

export function createEditorExtensionRegistry(): EditorExtensionRegistry {
  const registry: Extensions = [
    StarterKit,
    Link.configure({
      openOnClick: true,
      autolink: true,
      defaultProtocol: 'https'
    }),
    Placeholder.configure({
      placeholder: 'Start writing markdown...'
    })
  ]

  return {
    register: (...extensions: Extensions) => {
      registry.push(...extensions)
    },
    getAll: () => registry
  }
}
