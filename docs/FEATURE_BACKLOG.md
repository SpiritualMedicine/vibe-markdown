# Markdown Leo Feature Backlog

## Planning Principles

Markdown Leo should stay a local-first Markdown workspace. New features should improve one of four
product outcomes:

- Protect writing from loss
- Make local projects easier to navigate
- Improve Markdown authoring and publishing quality
- Add power features without making the core editor feel heavy

## Priority Legend

- P0: Must improve trust or unblock daily use
- P1: Should improve frequent project workflows
- P2: Differentiation and power-user value
- P3: Strategic or experimental

## P0: Reliability And Daily Writing

### Auto-Save And Recovery Center

Provide a visible auto-save state, last saved time, and recovery list for unsaved session drafts.

User value:

- Reduces fear of losing work
- Makes the app trustworthy for long writing sessions

Suggested scope:

- Auto-save interval preference
- Last saved timestamp in status bar
- Draft recovery on startup after crash or forced quit
- Recovery dialog with preview, restore, discard

Engineering notes:

- Store recovery drafts under Electron `userData`
- Keep original file writes separate from recovery writes
- Add tests for dirty-state, crash-recovery metadata, and restore behavior

### Unified Save Guard

Standardize unsaved-change prompts across close tab, close app, open file, open folder, and template
application flows.

User value:

- Prevents accidental data loss
- Makes destructive transitions predictable

Suggested scope:

- Shared confirmation command
- Consistent button labels
- Save, discard, cancel options where possible
- Tests around every navigation path that can abandon edits

### Localization Quality Pass

Fix garbled Chinese copy and make language switching feel complete.

User value:

- Improves trust immediately for Chinese users
- Removes prototype feel

Suggested scope:

- Audit all toolbar, dialog, status, and empty-state strings
- Add locale key coverage tests
- Avoid hard-coded English copy in components

## P1: Workspace Navigation

### Command Palette

Add a keyboard-first command palette for files, commands, templates, and settings.

User value:

- Speeds up repeated workflows
- Gives advanced features one discoverable entry point

Suggested scope:

- `Ctrl+K` or `Ctrl+P` palette
- Search files by name
- Run commands: open folder, save, export, toggle preview, change theme
- Use templates from palette

Engineering notes:

- Build command registry from existing command layer
- Keep UI independent from Electron APIs
- Add keyboard navigation and accessibility tests

### Workspace Index

Maintain a lightweight in-memory index for file names, headings, links, tags, and backlinks.

User value:

- Makes search and navigation faster
- Enables future graph, backlinks, and rename support

Suggested scope:

- Index Markdown files after opening a folder
- Update index after save
- Extract headings, wiki links, tags, and first title
- Show indexing status for large workspaces

Engineering notes:

- Start in main process, return typed summaries through IPC
- Add ignored directory configuration later
- Avoid blocking the UI on large folders

### Quick Switcher

Add fast file switching across open workspace documents.

User value:

- Makes 20 to 100 file workspaces practical
- Reduces dependence on the file tree

Suggested scope:

- Fuzzy file name search
- Recent files first
- Keyboard-only navigation
- Open selected file in current tab or new tab

### File Operations

Support basic project file management from the explorer.

User value:

- Users can manage notes without leaving the app

Suggested scope:

- New file
- New folder
- Rename file
- Delete file with confirmation
- Reveal in system file manager

Engineering notes:

- Renames should eventually update wiki links
- Delete should avoid permanent destructive behavior where platform trash is available

## P1: Editor And Preview Quality

### Markdown Syntax Coverage

Improve support for common Markdown extensions.

Suggested scope:

- Tables
- Task lists
- Footnotes
- Strikethrough
- Fenced code block language labels
- Mermaid code fences as a later optional feature

### Formatting Toolbar

Add source-safe formatting commands for common Markdown operations.

Suggested scope:

- Bold, italic, strikethrough
- Heading level
- Link
- Image
- Code block
- Quote
- Ordered and unordered lists
- Task list item

Engineering notes:

- Commands should transform selected source text predictably
- Keep Markdown source as the source of truth

### Preview Polish

Make preview feel closer to publish output.

Suggested scope:

- Better typography
- Code block copy button
- Table styling
- Image sizing controls
- Anchor link copy for headings

### Export Profiles

Allow users to choose export output style.

Suggested scope:

- Clean article
- Technical documentation
- Academic note
- Plain HTML
- Include or exclude table of contents
- Optional embedded CSS

## P2: Knowledge Workflow

### Tags

Support lightweight tags in Markdown documents.

Suggested scope:

- Parse `#tag` and YAML front matter tags
- Tag list panel
- Filter workspace by tag
- Add tag search to command palette

### Graph View

Visualize wiki links and backlinks across the workspace.

Suggested scope:

- File nodes
- Link edges
- Focus current document
- Open document from node
- Filter by folder or tag

Engineering notes:

- Build on workspace index
- Keep graph optional and lazy-loaded

### Rename With Link Updates

When renaming a document, offer to update `[[wiki links]]` that point to it.

Suggested scope:

- Preview affected files
- Apply updates atomically
- Keep backups or recovery data
- Tests for path, title, and extension variants

### Daily Notes

Add a date-based note workflow for journals and logs.

Suggested scope:

- Create today's note
- Configurable folder and file name pattern
- Daily note template
- Calendar navigation later

## P2: Templates And Structured Writing

### Template Variables

Extend templates with simple variables.

Suggested variables:

- `{{date}}`
- `{{time}}`
- `{{title}}`
- `{{folder}}`
- `{{year}}`, `{{month}}`, `{{day}}`

### Document Types

Provide built-in template categories.

Suggested types:

- Meeting note
- Research note
- Technical design
- Blog draft
- README
- Changelog
- Decision record

### Front Matter Editor

Add a small UI for YAML front matter.

Suggested fields:

- Title
- Description
- Tags
- Date
- Draft status

Engineering notes:

- Preserve unknown front matter fields
- Use a parser instead of ad hoc string replacement

## P2: Personalization

### Settings Panel

Create one place for user preferences.

Suggested sections:

- General
- Editor
- Preview
- Export
- Workspace
- Keyboard shortcuts

### Editor Display Controls

Suggested scope:

- Font family
- Font size
- Line height
- Content width
- Word wrap
- Vim mode later as experimental

### Keyboard Shortcut Editor

Suggested scope:

- Show all commands
- Search shortcuts
- Remap common commands
- Detect conflicts

## P3: Advanced And Experimental

### Plugin API

Start with a small internal extension model before exposing third-party plugins.

Suggested first extension points:

- Export profile
- Template provider
- Markdown renderer extension
- Command palette command

### Optional AI Assistance

Keep AI optional and local-file respectful.

Suggested scope:

- Rewrite selected text
- Summarize current document
- Generate outline from current document
- Convert rough notes into structured Markdown

Constraints:

- No cloud sync requirement
- Clear user action before sending content anywhere
- Provider settings must be explicit

### PDF Export

Suggested scope:

- Export current preview to PDF
- Use export profiles
- Preserve headings, links, code blocks, and tables

## Suggested Build Sequence

### Milestone 1: Trustworthy Daily Editor

- Auto-save visibility
- Session recovery
- Unified save guard
- Localization quality pass
- Markdown syntax coverage: tables, task lists, code blocks

### Milestone 2: Fast Local Workspace

- Workspace index
- Quick switcher
- Command palette
- File operations
- Better global search

### Milestone 3: Knowledge Features

- Tags
- Rename with link updates
- Daily notes
- Template variables
- Front matter editor

### Milestone 4: Publishing And Power Use

- Export profiles
- PDF export
- Graph view
- Keyboard shortcut editor
- Internal plugin extension points

## Recommended Next Five Features

1. Auto-save and recovery center
2. Command palette
3. Workspace index
4. File operations in explorer
5. Export profiles

These five features build directly on the existing architecture and increase product value without
changing the Markdown-first direction.
