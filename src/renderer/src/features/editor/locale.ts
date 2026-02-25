export const LOCALE_STORAGE_KEY = 'vibe-markdown-locale'

export const LOCALE_OPTIONS = [
  { id: 'zh-CN', label: '中文' },
  { id: 'en-US', label: 'English' }
] as const

export type EditorLocale = (typeof LOCALE_OPTIONS)[number]['id']

export type LocaleKey =
  | 'toolbar.recentFiles'
  | 'toolbar.autoSave'
  | 'toolbar.theme'
  | 'toolbar.language'
  | 'toolbar.window.minimize'
  | 'toolbar.window.maximize'
  | 'toolbar.window.restore'
  | 'toolbar.window.close'
  | 'toolbar.action.new'
  | 'toolbar.action.open'
  | 'toolbar.action.openFolder'
  | 'toolbar.action.save'
  | 'toolbar.action.saveAs'
  | 'toolbar.action.exportHtml'
  | 'panel.directory'
  | 'panel.markdown'
  | 'panel.preview'
  | 'directory.open'
  | 'directory.change'
  | 'directory.empty'
  | 'directory.noFolder'
  | 'status.ready'
  | 'status.editing'
  | 'status.newCreated'
  | 'status.openCanceled'
  | 'status.openFolderCanceled'
  | 'status.saveCanceled'
  | 'status.saveAsCanceled'
  | 'status.exportCanceled'
  | 'status.opened'
  | 'status.saved'
  | 'status.savedAs'
  | 'status.exported'
  | 'status.loadedFolder'
  | 'dialog.discardUnsaved'
  | 'dialog.discardOpenOther'

type Messages = Record<LocaleKey, string>

const zhCN: Messages = {
  'toolbar.recentFiles': '最近文件',
  'toolbar.autoSave': '自动保存',
  'toolbar.theme': '主题',
  'toolbar.language': '语言',
  'toolbar.window.minimize': '最小化',
  'toolbar.window.maximize': '最大化',
  'toolbar.window.restore': '还原',
  'toolbar.window.close': '关闭',
  'toolbar.action.new': '新建',
  'toolbar.action.open': '打开文件',
  'toolbar.action.openFolder': '打开文件夹',
  'toolbar.action.save': '保存',
  'toolbar.action.saveAs': '另存为',
  'toolbar.action.exportHtml': '导出 HTML',
  'panel.directory': '目录',
  'panel.markdown': 'Markdown',
  'panel.preview': '预览',
  'directory.open': '打开',
  'directory.change': '切换',
  'directory.empty': '未找到 Markdown 文件。',
  'directory.noFolder': '尚未选择文件夹',
  'status.ready': '就绪',
  'status.editing': '编辑中...',
  'status.newCreated': '已新建文档',
  'status.openCanceled': '已取消打开',
  'status.openFolderCanceled': '已取消打开文件夹',
  'status.saveCanceled': '已取消保存',
  'status.saveAsCanceled': '已取消另存为',
  'status.exportCanceled': '已取消导出',
  'status.opened': '已打开 {target}',
  'status.saved': '已保存 {target}',
  'status.savedAs': '已另存为 {target}',
  'status.exported': '已导出 {target}',
  'status.loadedFolder': '已加载文件夹 {target}',
  'dialog.discardUnsaved': '丢弃未保存修改？',
  'dialog.discardOpenOther': '丢弃未保存修改并打开其他文件？'
}

const enUS: Messages = {
  'toolbar.recentFiles': 'Recent Files',
  'toolbar.autoSave': 'Auto Save',
  'toolbar.theme': 'Theme',
  'toolbar.language': 'Language',
  'toolbar.window.minimize': 'Minimize',
  'toolbar.window.maximize': 'Maximize',
  'toolbar.window.restore': 'Restore',
  'toolbar.window.close': 'Close',
  'toolbar.action.new': 'New',
  'toolbar.action.open': 'Open',
  'toolbar.action.openFolder': 'Open Folder',
  'toolbar.action.save': 'Save',
  'toolbar.action.saveAs': 'Save As',
  'toolbar.action.exportHtml': 'Export HTML',
  'panel.directory': 'Directory',
  'panel.markdown': 'Markdown',
  'panel.preview': 'Preview',
  'directory.open': 'Open',
  'directory.change': 'Change',
  'directory.empty': 'No markdown files found.',
  'directory.noFolder': 'No folder selected',
  'status.ready': 'Ready',
  'status.editing': 'Editing...',
  'status.newCreated': 'New document created',
  'status.openCanceled': 'Open canceled',
  'status.openFolderCanceled': 'Open folder canceled',
  'status.saveCanceled': 'Save canceled',
  'status.saveAsCanceled': 'Save as canceled',
  'status.exportCanceled': 'Export canceled',
  'status.opened': 'Opened {target}',
  'status.saved': 'Saved {target}',
  'status.savedAs': 'Saved as {target}',
  'status.exported': 'Exported {target}',
  'status.loadedFolder': 'Loaded folder {target}',
  'dialog.discardUnsaved': 'Discard unsaved changes?',
  'dialog.discardOpenOther': 'Discard unsaved changes and open another file?'
}

const messageMap: Record<EditorLocale, Messages> = {
  'zh-CN': zhCN,
  'en-US': enUS
}

export function isEditorLocale(value: string): value is EditorLocale {
  return LOCALE_OPTIONS.some((item) => item.id === value)
}

export function loadEditorLocale(): EditorLocale {
  const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return raw && isEditorLocale(raw) ? raw : 'zh-CN'
}

export function saveEditorLocale(locale: EditorLocale): void {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

export function applyEditorLocale(locale: EditorLocale): void {
  document.documentElement.setAttribute('lang', locale)
}

export function t(
  locale: EditorLocale,
  key: LocaleKey,
  vars?: Record<string, string | number>
): string {
  const template = messageMap[locale][key]
  if (!vars) {
    return template
  }
  return template.replace(/\{(\w+)\}/g, (_raw, token) => {
    const value = vars[token]
    return value === undefined ? `{${token}}` : String(value)
  })
}
