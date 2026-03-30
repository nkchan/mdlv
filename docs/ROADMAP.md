# 🗺 Project Roadmap: mdlv

## Product Vision

**Core Mission:** Serve as a "lens" that dramatically reduces cognitive load and accelerates comprehension of AI-generated outputs and complex documents.

### Two Core Pillars

**Pillar 1 — Zero Cognitive Load Reading**
> Eliminate context-switching and friction when reading heavy technical documents.
- Context-aware, inline AI translation preserving technical terminology.
- On-demand AI explanation/summarization of highlighted paragraphs.

**Pillar 2 — Seamless Information Overview**
> Transform isolated links into a cohesive, bird's-eye view.
- Rich contextual previews for external links (Notion, Zotero, Trello, Git Issues, etc.).
- Smart hover cards and inline expansions that preserve reading flow.

### Development Policy
> Every feature must be tracked as a Git Issue before implementation.

---

## Phase 1: Foundation ✅
- [x] Tauri v2 + React + TypeScript setup
- [x] Basic local `.md` file reading from Rust
- [x] Dual-pane layout: Sidebar + Main Content

## Phase 2: Structural Intelligence ✅
- [x] AST-based Markdown parsing in Rust (pulldown-cmark)
- [x] Structured JSON passed to frontend
- [x] Sticky Breadcrumb navigation

## Phase 3: Interactive Navigation ✅
- [x] Auto-Folding for sections deeper than level 3
- [x] Focus Mode (Zoom-in): Isolate a specific branch
- [x] Keyboard shortcuts (`Cmd+J`, `Tab` to fold/unfold)

## Phase 4: AI-Native Core ✅
- [x] **Real-time File Watching:** Auto-refresh UI on external file changes
- [x] **AI Block Handling:** Native `<details>` folding for `<thought>` / `<think>` blocks
- [x] **Folder Navigation:** Sidebar explorer for quick file switching

## Phase 5: Distribution & Marketing ✅
- [x] Automated macOS `.dmg` build via GitHub Actions
- [x] Project Homepage with VitePress on GitHub Pages

---

## Phase 6: Workspace Mode (Pillar 1 Foundation)
*"Open a Project, not just a file"*
- [ ] **Open Project/Workspace** (#16): Open and save an entire directory as a workspace.
- [ ] **Nested Sidebar Explorer** (#17): Tree-view navigation for deeply nested directories.
- [ ] **Cross-File Search** (#18): Intelligent, AST-aware search across all files in the workspace.

## Phase 7: AI Integration — Zero Cognitive Load (Pillar 1)
*"Bring the AI to the document"*
- [ ] **Inline AI Translation** (#19): Context-aware translation preserving Markdown structure and technical terms. Trigger on selection or per-section.
- [ ] **On-Demand AI Explanation** (#20): Highlight a paragraph and get a plain-language explanation without leaving the viewer.
- [ ] **AI Summarization** (#21): Quick summary of a section or the full document on demand.

## Phase 8: Contextual Links — Seamless Overview (Pillar 2)
*"Links as windows, not doors"*
- [ ] **Smart Link Hover Cards** (#22): Hover over a URL to see a live preview — title, description, status.
- [ ] **External Tool Integration** (#23): Deep integration for Notion, Zotero, GitHub Issues, Trello to pull real-time context.
- [ ] **Inline Context Expansion** (#24): Expand a linked document inline without losing your place.
