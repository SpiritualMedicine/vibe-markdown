import {
  BacklinksPanel,
  CommandPalette,
  EditorMarkdownPanel,
  EditorPreviewPanel,
  EditorStatusBar,
  EditorTabBar,
  EditorToolbar,
  FileExplorer,
  OutlinePanel,
  RecoveryDraftBanner
} from '../components'
import { t } from '../settings'
import { useEditorStore } from '../../../state/editorStore'
import { useEditorPageController } from './useEditorPageController'

export default function NewEditorPage(): React.JSX.Element {
  const { state, commands } = useEditorStore()
  const {
    activeSearchResultKey,
    activeTab,
    bodyRef,
    commandPaletteItems,
    directoryPaneWidth,
    editorPaneWidth,
    draggingTabId,
    focusHeading,
    handleDropImage,
    handleInsertImage,
    handleOpenBacklink,
    handleCommandPaletteSelect,
    handleOpenDocumentReference,
    handleOpenFolder,
    handleOpenFolderFromPath,
    handleOpenSearchResult,
    handleSearchKeyDown,
    handleTabDrop,
    isCommandPaletteOpen,
    isImageDropActive,
    onStartDirectoryResize,
    onStartEditorResize,
    outline,
    previewRef,
    searchInput,
    setDraggingTabId,
    setIsCommandPaletteOpen,
    setIsImageDropActive,
    setSearchInput,
    setTabMenu,
    tabMenu,
    textareaRef,
    title,
    workspaceRef
  } = useEditorPageController({ state, commands })

  return (
    <div className="editor-shell">
      <EditorToolbar
        canSave={Boolean(activeTab?.isDirty)}
        isBusy={state.ui.isBusy}
        isMaximized={state.ui.isWindowMaximized}
        locale={state.ui.locale}
        onClose={() => void commands.closeWindow()}
        onExportHtml={() => void commands.exportHtml()}
        onInsertImage={handleInsertImage}
        onLocaleChange={(locale) => void commands.setLocale(locale)}
        onMinimize={() => void commands.minimizeWindow()}
        onNew={() => void commands.newDoc()}
        onNewFromTemplate={(templateId) => void commands.newDocFromTemplate(templateId)}
        onOpen={() => void commands.openDoc()}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenFolder={() => void commands.openFolder()}
        onSave={() => void commands.saveDoc()}
        onSaveAs={() => void commands.saveAs()}
        onThemeChange={(theme) => void commands.setTheme(theme)}
        onToggleMaximize={() => void commands.toggleMaximizeWindow()}
        onTogglePreview={() => void commands.togglePreview()}
        showPreview={state.ui.showPreview}
        theme={state.ui.theme}
      />

      <RecoveryDraftBanner
        drafts={state.ui.recoveryDrafts}
        locale={state.ui.locale}
        onDiscardAll={() => void commands.discardAllRecoveryDrafts()}
        onDiscardDraft={(draftId) => void commands.discardRecoveryDraft(draftId)}
        onRestoreDraft={(draftId) => void commands.restoreRecoveryDraft(draftId)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        items={commandPaletteItems}
        locale={state.ui.locale}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectItem={handleCommandPaletteSelect}
      />

      <div className="editor-body" ref={bodyRef}>
        <FileExplorer
          className="explorer-sidebar"
          currentFilePath={activeTab?.filePath ?? null}
          directoryEntries={state.workspace.directoryEntries}
          directoryPath={state.workspace.directoryPath}
          isBusy={state.ui.isDirectoryBusy}
          isSearchBusy={state.ui.isSearchBusy}
          locale={state.ui.locale}
          onOpenFile={(filePath) => void commands.openFromPath(filePath)}
          onOpenFolder={() => void handleOpenFolder()}
          onOpenFolderFromPath={(directoryPath) => void handleOpenFolderFromPath(directoryPath)}
          onOpenRecent={(filePath) => void commands.openFromPath(filePath)}
          onOpenSearchResult={(result) => void handleOpenSearchResult(result)}
          onSearchChange={setSearchInput}
          onSearchKeyDown={handleSearchKeyDown}
          onTogglePinFolder={(directoryPath) => void commands.togglePinnedFolder(directoryPath)}
          pinnedFolders={state.workspace.pinnedFolders}
          activeSearchResultKey={activeSearchResultKey}
          recentFiles={state.workspace.recentFiles}
          recentFolders={state.workspace.recentFolders}
          searchQuery={searchInput}
          searchResults={state.workspace.searchResults}
          style={directoryPaneWidth === null ? undefined : { width: `${directoryPaneWidth}px` }}
        />
        <div className="sidebar-resizer" onPointerDown={onStartDirectoryResize} role="separator" />

        <div className="editor-main">
          <EditorTabBar
            activeTabId={state.activeTabId}
            draggingTabId={draggingTabId}
            locale={state.ui.locale}
            onActivateTab={(tabId) => void commands.activateTab(tabId)}
            onCloseOtherTabs={(tabId) => void commands.closeOtherTabs(tabId)}
            onCloseTab={(tabId) => void commands.closeTab(tabId)}
            onCloseTabMenu={() => setTabMenu(null)}
            onCloseTabsToRight={(tabId) => void commands.closeTabsToRight(tabId)}
            onCreateTab={() => void commands.newDoc()}
            onDragEnd={() => setDraggingTabId(null)}
            onDragStart={(tabId, event) => {
              setDraggingTabId(tabId)
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', tabId)
            }}
            onDropTab={handleTabDrop}
            onOpenTabMenu={(tabId, x, y) => setTabMenu({ tabId, x, y })}
            tabMenu={tabMenu}
            tabs={state.tabs}
          />

          <EditorStatusBar
            autoSaveEnabled={state.ui.autoSaveEnabled}
            lastSavedAt={activeTab?.lastSavedAt ?? null}
            locale={state.ui.locale}
            onToggleAutoSave={(enabled) => void commands.toggleAutoSave(enabled)}
            statusMessage={state.ui.status.message}
            statusTone={state.ui.status.tone}
            title={title}
          />

          <main className="editor-workspace" ref={workspaceRef}>
            <EditorMarkdownPanel
              dropLabel={t(state.ui.locale, 'drop.image')}
              isImageDropActive={isImageDropActive}
              onChange={(markdown) => void commands.setEditorMarkdown(markdown)}
              onDragStateChange={setIsImageDropActive}
              onDropImage={handleDropImage}
              panelLabel={t(state.ui.locale, 'panel.markdown')}
              panelWidth={editorPaneWidth}
              textareaRef={textareaRef}
              value={activeTab?.markdown ?? ''}
            />
            {state.ui.showPreview ? (
              <>
                <div
                  className="editor-resizer"
                  onPointerDown={onStartEditorResize}
                  role="separator"
                />
                <EditorPreviewPanel
                  html={activeTab?.html ?? ''}
                  label={t(state.ui.locale, 'panel.preview')}
                  onOpenDocumentReference={(reference) =>
                    void handleOpenDocumentReference(reference)
                  }
                  previewRef={previewRef}
                />
              </>
            ) : null}
            <div className="editor-sidepanes">
              <OutlinePanel
                locale={state.ui.locale}
                onSelectHeading={focusHeading}
                outline={outline}
              />
              <BacklinksPanel
                backlinks={state.workspace.backlinks}
                hasDocumentPath={Boolean(activeTab?.filePath)}
                isBusy={state.ui.isBacklinksBusy}
                locale={state.ui.locale}
                onOpenBacklink={(filePath, line) => void handleOpenBacklink(filePath, line)}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
