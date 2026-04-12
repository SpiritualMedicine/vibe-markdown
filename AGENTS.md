# AGENTS.md

## Project Overview

Electron Markdown editor (`vibe-markdown`) with React + TypeScript. Local-first, file-based storage.

## Package Manager

**Use `pnpm` exclusively.** Lockfile and `packageManager` field specify `pnpm@10.30.1`.

## Commands

```bash
pnpm install        # Install (runs electron-builder install-app-deps postinstall)
pnpm dev            # Start dev server (electron-vite dev)
pnpm preview        # Preview without hot reload
pnpm build          # Typecheck + build (prerequisite for unpack/packaging)
pnpm build:win      # Build + package for Windows
pnpm build:mac      # Build + package for macOS
pnpm build:linux    # Build + package for Linux
pnpm build:unpack   # Build + unpack (no installer)
pnpm lint           # ESLint with cache
pnpm format         # Prettier write
pnpm typecheck      # Typecheck node + web configs
pnpm test           # Vitest unit tests (thread pool)
pnpm test:watch     # Vitest watch mode
pnpm test:e2e       # Playwright E2E
```

**Verify order:** `lint → typecheck → test` before `build`. Build failures often stem from typecheck errors.

## Architecture

Four runtime layers:

| Layer    | Path                | Purpose                                                 |
| -------- | ------------------- | ------------------------------------------------------- |
| Main     | `src/main/`         | Electron main process, window, filesystem, IPC handlers |
| Preload  | `src/preload/`      | `contextBridge` exposing `window.api` to renderer       |
| Renderer | `src/renderer/src/` | React app, editor, state management, UI                 |
| Shared   | `src/shared/`       | IPC channel names, request/response types, shared APIs  |

### Key Files

- `src/main/index.ts` — Main process entry
- `src/main/editorFileSystem.ts` — File operations, directory traversal, image import
- `src/preload/index.ts` — IPC bridge
- `src/renderer/src/App.tsx` — Root component
- `src/renderer/src/state/` — Command-driven state pattern
- `src/renderer/src/application/commands/` — User intent commands
- `src/renderer/src/infra/desktop/` — Desktop client over `window.api`
- `electron.vite.config.ts` — `@renderer` alias → `src/renderer/src`

### State Flow

```
UI → store commands → EditorCommandContext → reducer OR desktop API → IPC → main process
```

## Testing

- **Unit tests:** `vitest` in `src/**/*.test.{ts,tsx}`
- **E2E:** `playwright` via `pnpm test:e2e`
- **Focus areas:** domain logic, commands, markdown codec

Run a single test file:

```bash
pnpm test src/path/to/file.test.ts
```

## Code Style

- **Prettier:** single quotes, no semicolons, 100 char width, no trailing commas
- **ESLint:** TypeScript + React Hooks + React Refresh (Vite)
- **Formatter:** VSCode users should enable ESlint + Prettier extensions

## VSCode Debugging

Use launch configurations:

- `Debug Main Process` — Node debugger for electron main
- `Debug Renderer Process` — Chrome debugger for React
- `Debug All` — Compound (both)

## Quirks

- **Vite beta:** `vite: "beta"` in `package.json` — expect potential instability
- **Electron postinstall:** Native deps install automatically via `electron-builder install-app-deps`
- **Build prerequisite:** `pnpm build` runs `typecheck` first; fix type errors before packaging
- **Ignore patterns:** ESLint/Prettier ignore `node_modules`, `dist`, `out`
- **Build output:** `out/` directory contains compiled artifacts

## References

- `ARCHITECTURE.md` — Detailed architecture documentation
- `README.md` — Basic setup and commands
- `electron.vite.config.ts` — Vite configuration and aliases
