# DevBoard

DevBoard is a lightweight Windows developer dashboard built with React, TypeScript, Vite, Tailwind CSS, and Tauri.

## Architecture

- `src/` contains the presentation layer, typed domain models, formatting utilities, and the system-data service boundary.
- `src-tauri/` contains the Tauri application and the Rust command that collects system metrics with `sysinfo`.
- The React app calls native functionality through one typed `get_system_snapshot` command. Browser development uses a deterministic fallback snapshot so the UI remains testable without Tauri.

Later integrations (tray, launchers, projects, Docker, Git, and services) are intentionally not part of Phase 1.

## How it works

DevBoard is a **Tauri 2 desktop app**: a React/TypeScript UI with a small Rust backend.

### Languages

- **Frontend: TypeScript and React 19** in `src/`. `main.tsx` mounts `App.tsx`; widgets (Clock, Calendar, Weather, Vitals, ProjectList, Shortcuts, Dashboard) live in `src/components`. Styling uses Tailwind CSS 4.
- **Backend: Rust** in `src-tauri/src/`. `lib.rs` exposes these commands to the UI:
  - `get_system_snapshot` returns CPU, memory, disk, and uptime via the `sysinfo` crate.
  - `list_projects`, `open_project`, and `launch_shortcut` delegate to `launcher.rs`.
- Weather is fetched directly by the frontend from `api.open-meteo.com`, the only external host allowed by the CSP in `src-tauri/tauri.conf.json`.

### What builds and runs it

- **Vite** bundles the frontend into `dist/`. `npm run build` type-checks with `tsc -b` first, then runs `vite build`.
- **Cargo** compiles the Rust side.
- The **Tauri CLI** (`npm run tauri:dev` / `npm run tauri:build`) ties them together:
  - `tauri:dev` runs `npm run dev` (Vite on `localhost:5173` with hot reload) and opens a native window pointing at it.
  - `tauri:build` runs `npm run build`, compiles Rust, embeds `dist/` in the executable, and produces the MSI and NSIS installers under `src-tauri/target/release/bundle`.
- **Runtime:** a native `.exe` renders the UI in the Windows WebView2 control. The UI calls Rust with `invoke(...)`, and Tauri routes the call over IPC to the matching `#[tauri::command]`.
