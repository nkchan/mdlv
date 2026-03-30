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

## Phase 4: AI-Native Polish & Ecosystem
- [x] **Real-time File Watching:** Auto-refresh UI when an AI agent or script updates the file.
- [x] **AI Block Handling:** Specialized styling for `<thought>` and `thinking` reasoning chains.
- [x] **Folder Navigation:** Sidebar explorer to quickly switch between `.md` files in the same directory.
- [ ] **Rich Content:** Native support for Mermaid diagrams and KaTeX math.
- [ ] **macOS Polish:** Vibrancy effects and system font optimization.

## Phase 5: Distribution & Marketing
- [x] Automate macOS `.dmg` build and release using GitHub Actions.
- [x] Create a project Homepage (GitHub Pages) with VitePress.

## Phase 6: The AI-Native Workspace (Next Vision)
- [ ] **Open Project / Workspace:** Open an entire directory rather than a single file (Issue #16).
- [ ] **Nested Sidebar Explorer:** View and navigate deeply nested folder structures (Issue #17).
- [ ] **Intelligent Search:** Full-text or AST-aware search across the entire project.
- [ ] **Semantic / Contextual Linking:** Features to connect ideas and understand the context as an "AI-Native" tool.
