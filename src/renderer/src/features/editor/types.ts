export interface EditorDocument {
  filePath: string | null
  content: string
  isDirty: boolean
}

export interface EditorStatus {
  tone: 'idle' | 'success' | 'error'
  message: string
}
