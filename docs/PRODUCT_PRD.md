# Markdown Leo Product Requirements Document

## 1. Product Overview

### 1.1 Product Name

Markdown Leo

### 1.2 Product Positioning

Markdown Leo is a local-first Markdown desktop workspace for users who want to edit, manage, preview, and export Markdown documents directly from the filesystem.

### 1.3 Target Users

- Developers writing README files, technical docs, API notes, and blogs
- Students and researchers writing notes, drafts, and study material
- Knowledge workers who prefer local files over cloud-based editors

### 1.4 Core Value

- Local-first: documents stay in the user's filesystem
- Lightweight: fast startup and focused workflow
- Practical: editing, previewing, and file management in one place
- Reliable: users can write with confidence and reduce content loss risk

## 2. Problem Statement

Current editor functionality is usable, but still feels closer to a prototype than a polished product.

### 2.1 Current Gaps

- Chinese copy is garbled in places, which hurts trust and usability
- Editing capability is still basic for real Markdown-heavy workflows
- Project-level document management is limited
- Preview and export experiences are functional but not strong
- Product direction is split between plain Markdown editing and a future rich-text path

## 3. Product Goals

### 3.1 Short-Term Goals

- Make the product stable enough for daily Markdown writing
- Strengthen core file open, edit, save, preview, and export flows
- Improve product trust through better language quality and content safety

### 3.2 Mid-Term Goals

- Help users manage a small local documentation project efficiently
- Improve findability and navigation across multiple documents
- Build a more complete writing workflow, not just a text editor

### 3.3 Non-Goals

- Team collaboration
- Cloud sync
- Large plugin marketplace in the first phase
- Full Notion or Obsidian replacement in the short term

## 4. Core User Scenarios

### 4.1 Single File Editing

Users open one Markdown file, edit it, preview it, save it, and export the result.

### 4.2 Local Project Workspace

Users open a folder, browse Markdown files in a tree, switch between notes, and manage a small writing project.

### 4.3 Safe Writing

Users expect auto-save, dirty-state protection, and crash recovery so they do not lose content.

### 4.4 Sharing Output

Users export polished HTML output for publishing, archiving, or sharing.

## 5. Functional Scope

### 5.1 File Management

- Open file
- Open by path
- Save
- Save as
- Recent files
- Recent folders in a later phase

### 5.2 Workspace Management

- Open folder
- Render directory tree
- Open current file from tree
- Highlight active file

### 5.3 Editing

- Markdown source editing
- Keyboard shortcuts
- Auto-save
- Dirty-state tracking

### 5.4 Preview

- Real-time HTML preview
- Better Markdown feature coverage
- Scroll sync in a later phase
- Outline view in a later phase

### 5.5 Export

- Export HTML
- Improve export theme and layout quality
- PDF export in a later phase

### 5.6 Personalization

- Theme switching
- Language switching
- Auto-save preference
- Editor typography settings in a later phase

## 6. Suggested Product Direction

The recommended direction is to position Markdown Leo as a lightweight local Markdown workspace rather than a broad all-in-one note platform.

This direction fits the current codebase well because the existing strengths are:

- local filesystem access
- directory tree browsing
- recent file tracking
- focused editor + preview workflow

Rich-text editing should remain a strategic option, but not at the cost of weakening the current Markdown-first experience.

## 7. Success Metrics

- Users can complete the full open-edit-save-export flow without confusion
- Save success rate remains near 100 percent
- Users can safely recover from interruptions without losing work
- Folder mode adoption increases for multi-document workflows
- Returning users spend more time in editing sessions

## 8. Risks

- Product direction may drift if Markdown-first and rich-text-first approaches are both pursued at the same time
- Weak core editing and navigation could make later advanced features feel premature
- Poor content safety experience will damage user trust quickly

## 9. Recommended Product Principles

- Protect user content first
- Keep the core workflow fast and predictable
- Favor local-file practicality over feature breadth
- Build toward project-level writing workflows
