import { SectionNode } from "../types/ast";

interface SidebarProps {
  filePath: string;
  onFilePathChange: (path: string) => void;
  onLoad: () => void;
  isLoading: boolean;
  ast?: SectionNode | null;
  filesInDir?: { name: string; path: string }[];
}

export function Sidebar({ filePath, onFilePathChange, onLoad, isLoading, ast, filesInDir = [] }: SidebarProps) {
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
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

      {filesInDir.length > 0 && (
        <div className="sidebar-files">
          <h3 className="sidebar-heading">In this folder</h3>
          <ul className="file-list">
            {filesInDir.map((f) => {
              const isActive = f.path === filePath;
              return (
                <li 
                  key={f.path} 
                  className={`file-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (!isActive) {
                      onFilePathChange(f.path);
                      // Provide a short delay for state to update before loading
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
      )}
    </aside>
  );
}
