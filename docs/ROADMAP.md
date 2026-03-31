# 🗺 Project Roadmap: mdlv

## Phase 1: Foundation (Current)
- [x] Initialize Tauri v2 + React (TS) environment.
- [x] Implement basic Rust command to read local `.md` files.
- [x] Create a dual-pane layout: Sidebar (TOC) and Main Content.

## Phase 2: Structural Intelligence
- [x] Implement AST-based parsing in Rust to detect heading levels and list depths.
- [x] Pass structured JSON data to the frontend for granular rendering.
- [x] Add Sticky Breadcrumb navigation at the top of the viewport.

## Phase 3: Interactive Navigation
- [x] Implement "Auto-Folding" for sections deeper than level 3.
- [x] **Focus Mode (Zoom-in):** Isolate a specific branch into its own view.
- [x] Keyboard shortcuts for navigation (`Cmd+J`, `Tab` to fold/unfold).

## Phase 4: AI-Native Polish & Ecosystem (Next)
- [ ] **Real-time File Watching:** Auto-refresh UI when an AI agent or script updates the file.
- [ ] **AI Block Handling:** Specialized styling for `<thought>` and `thinking` reasoning chains.
- [ ] **Rich Content:** Native support for Mermaid diagrams and KaTeX math.
- [ ] **macOS Polish:** Vibrancy effects and system font optimization.

## Phase 5: Distribution & Marketing
- [x] Automate macOS `.dmg` build and release using GitHub Actions.
- [x] Create a project Homepage (GitHub Pages) with VitePress.