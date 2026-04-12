# Markdown Leo Delivery Plan

## 1. MVP Scope

### Must Have

- Open file
- Save and save as
- Auto-save
- Open folder
- File tree navigation
- Real-time preview
- Recent files
- Unsaved-change protection
- Working Chinese and English localization
- Basic HTML export

### Should Have

- Global search
- Multi-tab editing
- Outline panel
- Preview scroll sync

### Not in MVP

- Cloud sync
- Team collaboration
- Plugin marketplace
- Large AI feature set

## 2. Epic Breakdown

### Epic A: Foundation and Quality

- Fix encoding and localized copy
- Standardize status and error messages
- Improve empty states and failure states
- Review overall product terminology

### Epic B: Document Safety

- Standardize dirty-state prompts across flows
- Improve auto-save visibility
- Add session recovery planning
- Ensure file open and close paths protect unsaved changes consistently

### Epic C: Editor Capability

- Support task lists
- Support tables
- Support better code block rendering
- Support image syntax and preview behavior
- Add shortcut discoverability

### Epic D: Workspace and Navigation

- Add recent folders
- Add pinned folders
- Add multi-tab state management
- Add current-file reveal behavior
- Add global search indexing and results UI

### Epic E: Preview and Export

- Add scroll sync
- Add outline extraction
- Improve export HTML template
- Prepare for PDF export

### Epic F: Settings and Personalization

- Settings page or panel
- Theme preference persistence
- Language preference persistence
- Typography options
- Content width and editor display options

## 3. Recommended Build Order

### Phase 1

- Fix localization encoding issues
- Polish core status messaging
- Improve save and unsaved-change flows
- Ensure export works cleanly

### Phase 2

- Improve Markdown feature coverage
- Refine preview presentation
- Add settings UI
- Improve folder and file tree usability

### Phase 3

- Add multi-tab data model
- Implement global search
- Add outline support
- Add preview scroll sync

### Phase 4

- Evaluate and decide the Tiptap integration strategy
- Keep Markdown-first editing as the stable baseline
- Define conversion boundaries before shipping rich-text mode

## 4. Engineering Task List

### Immediate Tasks

- Fix garbled text in `src/renderer/src/features/editor/locale.ts`
- Verify language switch labels in the toolbar
- Audit status messages for all open/save/export flows
- Review confirmation prompts for consistency

### Near-Term Tasks

- Extend Markdown parsing and rendering support
- Improve export template quality
- Create settings state and persistence strategy
- Improve file tree and recent-item UX

### Mid-Term Tasks

- Design tab-state structure
- Design search indexing approach
- Add heading extraction for outline view
- Implement editor and preview synchronization

### Strategic Tasks

- Decide whether rich-text mode is a primary path or an optional enhancement
- Avoid splitting the product between two competing editor experiences

## 5. Suggested Team Alignment Questions

- Is the primary experience Markdown-source-first or dual-mode editing?
- What is the smallest version that users would trust for real writing work?
- Which feature best improves retention after content safety is solved: search, tabs, or images?
