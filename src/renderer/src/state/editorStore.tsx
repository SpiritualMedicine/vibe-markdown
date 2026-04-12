import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from 'react'
import type { EditorCommandContext, EditorState } from '../application/commands'
import { htmlToMarkdown, markdownToHtml } from '../core/editor/markdownCodec'
import { createDesktopClient } from '../infra/desktop/desktopClient'
import { t as translate } from '../features/editor/settings'
import { createInitialEditorState, editorReducer } from './editorStoreState'
import type { EditorStoreCommands } from './editorStoreTypes'
import { useEditorStoreCommands } from './useEditorStoreCommands'
import { useEditorStoreEffects } from './useEditorStoreEffects'

interface EditorStoreValue {
  state: EditorState
  commands: EditorStoreCommands
}

const EditorStoreContext = createContext<EditorStoreValue | null>(null)

export function EditorStoreProvider({
  children
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialEditorState)
  const stateRef = useRef(state)
  const localeRef = useRef(state.ui.locale)
  const desktop = useMemo(() => createDesktopClient(), [])

  useEffect(() => {
    stateRef.current = state
    localeRef.current = state.ui.locale
  }, [state])

  const runCommand = useCallback(
    async (effect: (commandCtx: EditorCommandContext) => Promise<void>) => {
      const commandContext: EditorCommandContext = {
        desktop,
        dispatch,
        getState: () => stateRef.current,
        markdownToHtml,
        htmlToMarkdown,
        t: (key, vars) => translate(localeRef.current, key, vars)
      }
      await effect(commandContext)
    },
    [desktop]
  )

  const commands: EditorStoreCommands = useEditorStoreCommands({ desktop, runCommand })
  useEditorStoreEffects({
    commands,
    desktopSetDirtyState: desktop.app.setDirtyState,
    runCommand,
    state
  })

  const value = useMemo(() => ({ state, commands }), [state, commands])
  return <EditorStoreContext.Provider value={value}>{children}</EditorStoreContext.Provider>
}

export function useEditorStore(): EditorStoreValue {
  const ctx = useContext(EditorStoreContext)
  if (!ctx) {
    throw new Error('useEditorStore must be used within EditorStoreProvider')
  }
  return ctx
}
