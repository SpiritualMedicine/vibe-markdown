# Markdown Leo Architecture

## Overview

Markdown Leo is a local-first Electron desktop application for writing and managing Markdown documents.

The codebase is organized into four top-level runtime layers:

1. `src/main`
   Electron main process. Owns windows, filesystem access, persistence, and IPC handler registration.
2. `src/preload`
   Safe bridge between Electron and the renderer via `contextBridge`.
3. `src/renderer/src`
   React application, editor workflow, state management, and UI.
4. `src/shared`
   Cross-process IPC channel names, request/response payloads, and shared desktop API types.

## Main Process

### Responsibilities

- Create and configure the Electron window
- Handle native file/folder dialogs
- Read and write Markdown files
- Persist recent files, recent folders, and pinned folders
- Serve renderer requests through IPC

### Structure

- `src/main/index.ts`
  App lifecycle entrypoint
- `src/main/mainWindow.ts`
  Main window creation and close-guard behavior
- `src/main/windowState.ts`
  Unsaved/force-close window state tracking
- `src/main/editorFileSystem.ts`
  Filesystem operations, directory traversal, search, image import, backlinks
- `src/main/editorPersistence.ts`
  Recent/pinned item persistence
- `src/main/ipc`
  IPC registration grouped by domain

## Preload Layer

### Responsibilities

- Expose a typed `window.api`
- Map renderer calls to IPC channels
- Keep renderer isolated from direct Electron access

### Structure

- `src/preload/index.ts`
  `contextBridge` exposure and IPC proxy implementation
- `src/preload/index.d.ts`
  Global window typing for the renderer

## Renderer Layer

### Responsibilities

- Compose the writing workspace
- Manage editor state and command execution
- Render directory tree, editor, preview, outline, backlinks, and toolbar
- Persist UI preferences like theme and locale

### Structure

- `src/renderer/src/App.tsx`
  Root application shell
- `src/renderer/src/features/editor`
  Primary product feature area
- `src/renderer/src/state`
  Store provider, reducer, command binding hook, exported state types
- `src/renderer/src/application/commands`
  User-intent command layer split by domain
- `src/renderer/src/core/editor`
  Markdown codec and editor primitives
- `src/renderer/src/infra/desktop`
  Desktop client abstraction over `window.api`
- `src/renderer/src/assets`
  Global and feature CSS

## Editor Feature Architecture

### Domain

- `features/editor/domain`
  Pure editor logic such as outline extraction, document naming, template definitions, slug creation, and reference resolution.

### UI

- `features/editor/ui`
  Page-level orchestration hooks and page composition.

### Components

- `features/editor/components/chrome`
  Toolbar and window chrome
- `features/editor/components/editor`
  Editor, preview, tabs, outline, backlinks, status bar
- `features/editor/components/explorer`
  Directory tree, search, recent/pinned folder UI

### Settings

- `features/editor/settings`
  Locale and theme concerns

## State and Command Flow

Renderer state follows a command-driven pattern:

1. UI components call store commands
2. Store commands build an `EditorCommandContext`
3. Command functions update reducer state or call desktop APIs
4. Desktop APIs route through preload to main IPC handlers
5. Main process returns typed results to the renderer

This keeps side effects concentrated in commands and the main process while keeping domain logic reusable and testable.

## Shared IPC Contracts

`src/shared` is the single place for cross-process contracts:

- `editor-ipc-channels.ts`
  Channel constants
- `editor-ipc-file.ts`
  File/folder request and response types
- `editor-ipc-app.ts`
  App-level shared payloads
- `editor-desktop-api.ts`
  Renderer-facing desktop API contract
- `index.ts`
  Shared barrel

## Testing Strategy

Current automated coverage is focused on the most reusable logic:

- Domain logic
- Command behavior
- Markdown codec behavior

Recommended long-term strategy:

1. Keep pure domain utilities under unit test
2. Expand command tests around critical workflows
3. Add integration tests for renderer panels with Testing Library
4. Add end-to-end coverage for open/save/folder/reference flows with Playwright

## Current Architectural Direction

The project intentionally remains Markdown-first.

Rich-text support is treated as a future capability, not the primary path today. Any future rich-text integration should preserve:

- file-based Markdown storage
- predictable save/export behavior
- compatibility with existing templates, references, and backlinks
