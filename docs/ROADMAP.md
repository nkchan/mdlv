# 🗺 Project Roadmap: mdlv

## Phase 1: Foundation (Current)
- [x] Initialize Tauri v2 + React (TS) environment.
- [x] Implement basic Rust command to read local `.md` files.
- [x] Create a dual-pane layout: Sidebar (TOC) and Main Content.

## Phase 2: Structural Intelligence
- [x] Implement AST-based parsing in Rust to detect heading levels and list depths.
- [x] Pass structured JSON data to the frontend for granular rendering.
- [x] Add Sticky Breadcrumb navigation at the top of the viewport.

## Phase 3: Interactive Navigation (Next)
- [ ] Implement "Auto-Folding" for sections deeper than level 3.
- [ ] **Focus Mode (Zoom-in):** Isolate a specific branch into its own view.
- [ ] Keyboard shortcuts for navigation (`Cmd+J`, `Tab` to fold/unfold).

## Phase 4: Ecosystem & Polish
- [ ] Real-time File Watching (auto-refresh on file change).
- [ ] Support for Mermaid diagrams and KaTeX.
- [ ] macOS-native UI polish (Vibrancy, system fonts).

## Phase 5: Distribution & Marketing
- [ ] Automate macOS `.dmg` build and release using GitHub Actions.
- [ ] Create a project Homepage (GitHub Pages) with VitePress/Astro or React.