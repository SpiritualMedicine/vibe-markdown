# vibe-markdown

Markdown Leo is a local-first desktop Markdown editor built with Electron, React, and
TypeScript. It focuses on file-based writing workflows: opening folders, editing Markdown files,
previewing rendered output, managing templates, importing images, and navigating document links.

## Features

- File and folder based Markdown editing
- Live Markdown preview with heading anchors and wiki-style document links
- Recent and pinned folders
- Template management
- Image import into a local `assets/` folder
- Backlinks, outline, and workspace search

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install
```

This project uses pnpm exclusively. Do not use `npm install` or `yarn install`.

### Development

```bash
$ pnpm dev
# or
$ pnpm start
```

### Preview (no hot reload)

```bash
$ pnpm preview
```

### Build

Run validation before packaging:

```bash
$ pnpm lint
$ pnpm typecheck
$ pnpm test
$ pnpm build
```

Package for a platform:

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

## Runtime Direction

Electron is the supported desktop runtime for this repository. The application code is organized
around Electron main, preload, renderer, and shared IPC contracts. Any alternative runtime work
should stay isolated until it has an explicit migration plan.

## Documentation

- `ARCHITECTURE.md` describes the runtime layers and state flow.
- `AGENTS.md` captures repository conventions for automated coding agents.
- `docs/` contains product planning and delivery notes.
