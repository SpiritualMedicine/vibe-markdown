# Markdown Leo PRD

## Product Summary

Markdown Leo is a local-first Markdown desktop workspace for people who want to work directly on files in their filesystem.

It is optimized for:

- writing Markdown quickly
- navigating local document projects
- previewing and exporting output
- keeping content safe through autosave and dirty-state protection

## Target Users

- Developers writing README files, changelogs, and technical notes
- Students and researchers managing structured Markdown notes
- Knowledge workers who prefer local documents over cloud editors

## Core Jobs To Be Done

1. Open and edit a Markdown file without friction
2. Work inside a folder-based documentation project
3. Find related files and move between them quickly
4. Export polished output
5. Trust that work will not be lost

## Functional Goals

### Foundation

- Open, save, save as
- Auto-save
- Dirty-state protection
- Real-time preview
- Recent files and folders

### Workspace

- Directory tree
- Global file/content search
- Multi-tab editing
- Outline panel
- Backlinks panel
- Local image asset workflow

### Writing Workflow

- Document templates
- `[[document]]` references
- Clickable preview references
- Folder-level backlink discovery

### Personalization

- Theme switching
- Language switching
- Basic editor display controls

## Product Principles

- Local-first over cloud-first
- Safe writing over flashy complexity
- Markdown-first over rich-text-first
- Fast navigation over feature sprawl
- Incremental power features over all-at-once expansion

## Success Criteria

- Users can complete open-edit-save-export flows reliably
- Users can manage 20 to 100 Markdown files in a single workspace
- References and backlinks help users move across documents naturally
- New users can start from templates instead of blank files
- The UI remains understandable as the feature set grows

## Scope Guidance

### In Scope

- Local file workflows
- Folder-based navigation
- Template-driven document creation
- Reference and backlink workflows
- Strong renderer/main separation

### Out of Scope For Current Phase

- Team collaboration
- Cloud sync
- Plugin marketplace
- AI-heavy generation workflows as a core requirement

## Delivery Direction

Near-term development should keep alternating between:

1. shipping the next roadmap capability
2. cleaning structure immediately after each capability
3. expanding automated coverage for newly introduced behavior

This keeps the product moving while preventing architecture debt from compounding.
