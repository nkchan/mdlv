import { useState } from "react";
import { SectionNode } from "../types/ast";
import { TreeNode } from "../types/workspace";

interface SidebarProps {
  filePath: string;
  onFilePathChange: (path: string) => void;
  onLoad: () => void;
  isLoading: boolean;
  ast?: SectionNode | null;
  filesInDir?: { name: string; path: string }[];
  workspaceRoot?: string | null;
  workspaceTree?: TreeNode | null;
  onOpenWorkspace?: () => void;
}

function WorkspaceTree({
  node,
  filePath,
  onFilePathChange,
  onLoad,
  depth = 0,
}: {
  node: TreeNode;
  filePath: string;
  onFilePathChange: (path: string) => void;
  onLoad: () => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);

  if (node.is_dir) {
    return (
      <div className="tree-dir">
        <div
          className="tree-dir-name"
          onClick={() => setExpanded((p) => !p)}
          style={{ paddingLeft: `${depth * 12}px` }}
        >
          <span className="tree-chevron">{expanded ? "▾" : "▸"}</span>
          {node.name}
        </div>
        {expanded && (
          <div className="tree-dir-children">
            {node.children.map((child) => (
              <WorkspaceTree
                key={child.path}
                node={child}
                filePath={filePath}
                onFilePathChange={onFilePathChange}
                onLoad={onLoad}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = node.path === filePath;
  return (
    <div
      className={`tree-file ${isActive ? "active" : ""}`}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
      title={node.path}
      onClick={() => {
        if (!isActive) {
          onFilePathChange(node.path);
          setTimeout(() => onLoad(), 0);
        }
      }}
    >
      📄 {node.name}
    </div>
  );
}

export function Sidebar({
  filePath,
  onFilePathChange,
  onLoad,
  isLoading,
  ast,
  filesInDir = [],
  workspaceRoot,
  workspaceTree,
  onOpenWorkspace,
}: SidebarProps) {
  const renderTocItem = (node: SectionNode) => {
    if (node.level === 0) {
      return (
        <div key={node.id} className="toc-root">
          {node.children.map(renderTocItem)}
        </div>
      );
    }

    // Skip very deep sections for TOC
    if (node.level > 3) return null;

    return (
      <div key={node.id} className={`toc-item toc-level-${node.level}`}>
        <a
          href={`#${node.id}`}
          className="toc-link"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(node.id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          {node.title}
        </a>
        <div className="toc-children">
          {node.children.length > 0 && node.children.map(renderTocItem)}
        </div>
      </div>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-icon">📄</span>
        <h2 className="sidebar-title">mdlv</h2>
      </div>

      {/* Workspace Open Button */}
      {onOpenWorkspace && (
        <div className="sidebar-section">
          <button
            id="open-workspace-btn"
            className="sidebar-btn workspace-btn"
            onClick={onOpenWorkspace}
            title="Open a folder as workspace"
          >
            📂 {workspaceRoot ? "Change Folder" : "Open Folder"}
          </button>
          {workspaceRoot && (
            <div className="workspace-root-label" title={workspaceRoot}>
              {workspaceRoot.split("/").pop()}
            </div>
          )}
        </div>
      )}

      {/* Manual file path input — shown when no workspace */}
      {!workspaceRoot && (
        <div className="sidebar-section">
          <label className="sidebar-label" htmlFor="file-path-input">
            File Path
          </label>
          <input
            id="file-path-input"
            className="sidebar-input"
            type="text"
            value={filePath}
            onChange={(e) => onFilePathChange(e.currentTarget.value)}
            placeholder="/path/to/file.md"
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === "Enter") onLoad();
            }}
          />
          <button
            id="load-file-btn"
            className="sidebar-btn"
            onClick={onLoad}
            disabled={isLoading || !filePath.trim()}
          >
            {isLoading ? "Loading…" : "Open"}
          </button>
        </div>
      )}

      {/* TOC */}
      <div className="sidebar-toc">
        {ast ? (
          <div className="toc-content">
            <h3 className="sidebar-heading">On this page</h3>
            {renderTocItem(ast)}
          </div>
        ) : (
          <div className="sidebar-toc-placeholder">
            <p className="sidebar-toc-hint">TOC will appear here</p>
            <p className="sidebar-toc-sub">Please load a markdown file</p>
          </div>
        )}
      </div>

      {/* Workspace tree — replaces the flat "In this folder" list */}
      {workspaceTree ? (
        <div className="sidebar-files">
          <h3 className="sidebar-heading">Workspace</h3>
          <div className="workspace-tree">
            {workspaceTree.children.map((child) => (
              <WorkspaceTree
                key={child.path}
                node={child}
                filePath={filePath}
                onFilePathChange={onFilePathChange}
                onLoad={onLoad}
              />
            ))}
          </div>
        </div>
      ) : filesInDir.length > 0 ? (
        <div className="sidebar-files">
          <h3 className="sidebar-heading">In this folder</h3>
          <ul className="file-list">
            {filesInDir.map((f) => {
              const isActive = f.path === filePath;
              return (
                <li
                  key={f.path}
                  className={`file-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    if (!isActive) {
                      onFilePathChange(f.path);
                      setTimeout(() => onLoad(), 0);
                    }
                  }}
                  title={f.path}
                >
                  📄 {f.name}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
