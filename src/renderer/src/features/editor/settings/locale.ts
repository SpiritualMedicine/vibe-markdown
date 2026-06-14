export const LOCALE_STORAGE_KEY = 'vibe-markdown-locale'

export const LOCALE_OPTIONS = [
  { id: 'zh-CN', label: '中文' },
  { id: 'en-US', label: 'English' }
] as const

export type EditorLocale = (typeof LOCALE_OPTIONS)[number]['id']

export type LocaleKey =
  | 'toolbar.recentFiles'
  | 'toolbar.recentFolders'
  | 'toolbar.pinnedFolders'
  | 'toolbar.autoSave'
  | 'toolbar.theme'
  | 'toolbar.language'
  | 'toolbar.search'
  | 'toolbar.templates'
  | 'toolbar.insertImage'
  | 'toolbar.togglePreview'
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
  | 'commandPalette.open'
  | 'commandPalette.title'
  | 'commandPalette.shortcut'
  | 'commandPalette.placeholder'
  | 'commandPalette.empty'
  | 'commandPalette.group.command'
  | 'commandPalette.group.file'
  | 'commandPalette.group.recent'
  | 'commandPalette.group.template'
  | 'commandPalette.previewVisible'
  | 'commandPalette.previewHidden'
  | 'panel.directory'
  | 'panel.markdown'
  | 'panel.preview'
  | 'panel.outline'
  | 'panel.backlinks'
  | 'panel.search'
  | 'tabs.untitled'
  | 'directory.open'
  | 'directory.change'
  | 'directory.empty'
  | 'directory.noFolder'
  | 'directory.pin'
  | 'directory.unpin'
  | 'search.placeholder'
  | 'search.empty'
  | 'search.noResults'
  | 'search.searching'
  | 'search.hint'
  | 'drop.image'
  | 'outline.empty'
  | 'backlinks.empty'
  | 'backlinks.unsaved'
  | 'backlinks.searching'
  | 'status.ready'
  | 'status.editing'
  | 'status.newCreated'
  | 'status.templateCreated'
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
  | 'status.searchNeedsFolder'
  | 'status.imageImported'
  | 'status.imageImportFailed'
  | 'status.saveBeforeImage'
  | 'status.referenceOpened'
  | 'status.referenceMissing'
  | 'status.lastSaved'
  | 'status.recoveryRestored'
  | 'status.recoveryDiscarded'
  | 'recovery.title'
  | 'recovery.description'
  | 'recovery.restore'
  | 'recovery.discard'
  | 'recovery.discardAll'
  | 'dialog.discardUnsaved'
  | 'dialog.discardOpenOther'
  | 'dialog.closeTabDiscard'
  | 'dialog.closeTabsDiscard'
  | 'tabs.menu.close'
  | 'tabs.menu.closeOthers'
  | 'tabs.menu.closeRight'
  | 'template.blank'
  | 'template.meetingNotes'
  | 'template.projectReadme'
  | 'template.weeklyPlan'
  | 'template.manage'
  | 'template.create'
  | 'template.createTitle'
  | 'template.namePlaceholder'
  | 'template.createSuccess'
  | 'template.createFailed'
  | 'template.deleteConfirm'
  | 'template.deleteSuccess'
  | 'template.deleteFailed'
  | 'template.noCustom'

type Messages = Record<LocaleKey, string>

const zhCN: Messages = {
  'toolbar.recentFiles': '最近文件',
  'toolbar.recentFolders': '最近目录',
  'toolbar.pinnedFolders': '固定目录',
  'toolbar.autoSave': '自动保存',
  'toolbar.theme': '主题',
  'toolbar.language': '语言',
  'toolbar.search': '搜索',
  'toolbar.templates': '模板',
  'toolbar.insertImage': '插入图片',
  'toolbar.togglePreview': '切换预览',
  'toolbar.window.minimize': '最小化',
  'toolbar.window.maximize': '最大化',
  'toolbar.window.restore': '还原',
  'toolbar.window.close': '关闭',
  'toolbar.action.new': '新建',
  'toolbar.action.open': '打开文件',
  'toolbar.action.openFolder': '打开目录',
  'toolbar.action.save': '保存',
  'toolbar.action.saveAs': '另存为',
  'toolbar.action.exportHtml': '导出 HTML',
  'commandPalette.open': '打开命令面板',
  'commandPalette.title': '命令面板',
  'commandPalette.shortcut': 'Ctrl K',
  'commandPalette.placeholder': '搜索命令、文件或模板',
  'commandPalette.empty': '没有匹配项',
  'commandPalette.group.command': '命令',
  'commandPalette.group.file': '文件',
  'commandPalette.group.recent': '最近',
  'commandPalette.group.template': '模板',
  'commandPalette.previewVisible': '预览已显示',
  'commandPalette.previewHidden': '预览已隐藏',
  'panel.directory': '目录',
  'panel.markdown': 'Markdown',
  'panel.preview': '预览',
  'panel.outline': '大纲',
  'panel.backlinks': '反向链接',
  'panel.search': '搜索结果',
  'tabs.untitled': '未命名',
  'directory.open': '打开',
  'directory.change': '切换',
  'directory.empty': '没有找到 Markdown 文件。',
  'directory.noFolder': '尚未选择目录',
  'directory.pin': '固定',
  'directory.unpin': '取消固定',
  'search.placeholder': '搜索当前目录中的文件内容',
  'search.empty': '输入关键词开始搜索',
  'search.noResults': '没有找到匹配结果',
  'search.searching': '搜索中...',
  'search.hint': '使用上下方向键选择，回车打开',
  'drop.image': '松开以导入图片',
  'outline.empty': '当前文档没有标题',
  'backlinks.empty': '当前没有反向链接',
  'backlinks.unsaved': '保存文档后即可查看反向链接',
  'backlinks.searching': '正在扫描引用...',
  'status.ready': '就绪',
  'status.editing': '编辑中...',
  'status.newCreated': '已创建新文档',
  'status.templateCreated': '已从模板创建：{target}',
  'status.openCanceled': '已取消打开文件',
  'status.openFolderCanceled': '已取消打开目录',
  'status.saveCanceled': '已取消保存',
  'status.saveAsCanceled': '已取消另存为',
  'status.exportCanceled': '已取消导出',
  'status.opened': '已打开 {target}',
  'status.saved': '已保存 {target}',
  'status.savedAs': '已另存为 {target}',
  'status.exported': '已导出 {target}',
  'status.loadedFolder': '已加载目录 {target}',
  'status.searchNeedsFolder': '请先打开一个目录再搜索',
  'status.imageImported': '已插入图片 {target}',
  'status.imageImportFailed': '导入图片失败',
  'status.saveBeforeImage': '请先保存当前文档，再插入图片',
  'status.referenceOpened': '已打开引用文档 {target}',
  'status.referenceMissing': '未找到引用文档 {target}',
  'status.lastSaved': '上次保存 {time}',
  'status.recoveryRestored': '已恢复草稿',
  'status.recoveryDiscarded': '已丢弃恢复草稿',
  'recovery.title': '可恢复草稿',
  'recovery.description': '发现 {count} 个未保存草稿',
  'recovery.restore': '恢复',
  'recovery.discard': '丢弃',
  'recovery.discardAll': '全部丢弃',
  'dialog.discardUnsaved': '要放弃未保存的修改吗？',
  'dialog.discardOpenOther': '要放弃未保存的修改并打开其他文件吗？',
  'dialog.closeTabDiscard': '此标签页有未保存内容，确认关闭吗？',
  'dialog.closeTabsDiscard': '部分标签页有未保存内容，确认继续关闭吗？',
  'tabs.menu.close': '关闭',
  'tabs.menu.closeOthers': '关闭其他标签页',
  'tabs.menu.closeRight': '关闭右侧标签页',
  'template.blank': '空白文档',
  'template.meetingNotes': '会议纪要',
  'template.projectReadme': '项目 README',
  'template.weeklyPlan': '周计划',
  'template.manage': '管理模板',
  'template.create': '创建模板',
  'template.createTitle': '保存为模板',
  'template.namePlaceholder': '模板名称',
  'template.createSuccess': '模板已保存',
  'template.createFailed': '保存模板失败',
  'template.deleteConfirm': '确定要删除模板 "{name}" 吗？',
  'template.deleteSuccess': '模板已删除',
  'template.deleteFailed': '删除模板失败',
  'template.noCustom': '暂无自定义模板'
}

const enUS: Messages = {
  'toolbar.recentFiles': 'Recent Files',
  'toolbar.recentFolders': 'Recent Folders',
  'toolbar.pinnedFolders': 'Pinned Folders',
  'toolbar.autoSave': 'Auto Save',
  'toolbar.theme': 'Theme',
  'toolbar.language': 'Language',
  'toolbar.search': 'Search',
  'toolbar.templates': 'Templates',
  'toolbar.insertImage': 'Insert Image',
  'toolbar.togglePreview': 'Toggle Preview',
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
  'commandPalette.open': 'Open Command Palette',
  'commandPalette.title': 'Command Palette',
  'commandPalette.shortcut': 'Ctrl K',
  'commandPalette.placeholder': 'Search commands, files, or templates',
  'commandPalette.empty': 'No matches',
  'commandPalette.group.command': 'Command',
  'commandPalette.group.file': 'File',
  'commandPalette.group.recent': 'Recent',
  'commandPalette.group.template': 'Template',
  'commandPalette.previewVisible': 'Preview is visible',
  'commandPalette.previewHidden': 'Preview is hidden',
  'panel.directory': 'Directory',
  'panel.markdown': 'Markdown',
  'panel.preview': 'Preview',
  'panel.outline': 'Outline',
  'panel.backlinks': 'Backlinks',
  'panel.search': 'Search Results',
  'tabs.untitled': 'Untitled',
  'directory.open': 'Open',
  'directory.change': 'Change',
  'directory.empty': 'No markdown files found.',
  'directory.noFolder': 'No folder selected',
  'directory.pin': 'Pin',
  'directory.unpin': 'Unpin',
  'search.placeholder': 'Search files in the current folder',
  'search.empty': 'Type to search the current folder',
  'search.noResults': 'No matches found',
  'search.searching': 'Searching...',
  'search.hint': 'Use Up/Down to select, Enter to open',
  'drop.image': 'Drop to import image',
  'outline.empty': 'No headings in this document',
  'backlinks.empty': 'No backlinks yet',
  'backlinks.unsaved': 'Save the document to view backlinks',
  'backlinks.searching': 'Scanning references...',
  'status.ready': 'Ready',
  'status.editing': 'Editing...',
  'status.newCreated': 'New document created',
  'status.templateCreated': 'Created from template: {target}',
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
  'status.searchNeedsFolder': 'Open a folder before searching',
  'status.imageImported': 'Inserted image {target}',
  'status.imageImportFailed': 'Failed to import image',
  'status.saveBeforeImage': 'Save the document before importing an image',
  'status.referenceOpened': 'Opened referenced document {target}',
  'status.referenceMissing': 'Referenced document not found: {target}',
  'status.lastSaved': 'Saved {time}',
  'status.recoveryRestored': 'Recovered draft',
  'status.recoveryDiscarded': 'Recovery draft discarded',
  'recovery.title': 'Recoverable drafts',
  'recovery.description': '{count} unsaved draft(s) found',
  'recovery.restore': 'Restore',
  'recovery.discard': 'Discard',
  'recovery.discardAll': 'Discard all',
  'dialog.discardUnsaved': 'Discard unsaved changes?',
  'dialog.discardOpenOther': 'Discard unsaved changes and open another file?',
  'dialog.closeTabDiscard': 'This tab has unsaved changes. Close it anyway?',
  'dialog.closeTabsDiscard': 'Some tabs have unsaved changes. Continue closing them?',
  'tabs.menu.close': 'Close',
  'tabs.menu.closeOthers': 'Close Others',
  'tabs.menu.closeRight': 'Close Tabs to the Right',
  'template.blank': 'Blank Document',
  'template.meetingNotes': 'Meeting Notes',
  'template.projectReadme': 'Project README',
  'template.weeklyPlan': 'Weekly Plan',
  'template.manage': 'Manage Templates',
  'template.create': 'Create Template',
  'template.createTitle': 'Save as Template',
  'template.namePlaceholder': 'Template Name',
  'template.createSuccess': 'Template saved',
  'template.createFailed': 'Failed to save template',
  'template.deleteConfirm': 'Are you sure you want to delete template "{name}"?',
  'template.deleteSuccess': 'Template deleted',
  'template.deleteFailed': 'Failed to delete template',
  'template.noCustom': 'No custom templates yet'
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
