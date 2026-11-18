# DevBoard

DevBoard is a lightweight Windows developer dashboard built with React, TypeScript, Vite, Tailwind CSS, and Tauri. Phase 1 focuses on a polished system-monitoring shell with CPU, memory, disk, uptime, and clock widgets.

## Architecture

- `src/` contains the presentation layer, typed domain models, formatting utilities, and the system-data service boundary.
- `src-tauri/` contains the Tauri application and the Rust command that collects system metrics with `sysinfo`.
- The React app calls native functionality through one typed `get_system_snapshot` command. Browser development uses a deterministic fallback snapshot so the UI remains testable without Tauri.

Later integrations (tray, launchers, projects, Docker, Git, and services) are intentionally not part of Phase 1.

## Prerequisites

- Node.js 20+
- npm 10+
- Rust stable and the [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)
- On Windows, WebView2

## Development

```bash
npm install
npm run dev
```

To run the desktop application:

```bash
npm run tauri:dev
```

## Checks and build

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run tauri:build
```

`tauri:build` must be run on a machine with Rust and the native Tauri prerequisites installed.

### Continuous integration

The GitHub Actions workflow in `.github/workflows/ci.yml` runs on pushes and pull requests:

- Formatting, ESLint, TypeScript, unit tests, and a production frontend build.
- Chromium checks at desktop, narrow-window, and mobile widths: layout overflow, metric rendering, keyboard refresh, error recovery, and reduced-motion/transparency preferences.
- A Windows Rust test run and native desktop build (without packaging an installer).

Browser tests run against the production frontend with a test-only Tauri IPC fixture, not real system metrics. Screenshots are attached to the uploaded `browser-report` artifact for visual review; these are smoke/layout checks, not pixel-baseline comparisons or native WebView tests.

### Glass appearance

The interface uses Liquid Glass–inspired translucent surfaces, soft backdrop blur, edge highlights, and restrained coloured light. System fonts keep it offline-friendly. Keyboard focus remains visible, and reduced-motion/reduced-transparency preferences are respected. Browsers without backdrop filtering receive opaque surfaces.

Transparency blends with the **in-app background**. Native Windows desktop/wallpaper transparency is not enabled.

## Current features

- Responsive dark dashboard shell
- CPU, memory, disk, uptime, and clock widgets
- Loading and unavailable states
- Native system snapshot command with graceful frontend fallback
- Focused Vitest tests for formatting and widget rendering

## Planned

Window persistence, tray support, battery/network/GPU metrics, launchers, projects, Git/Docker/WSL integration, services, settings, and sensor providers will be added in later phases.
