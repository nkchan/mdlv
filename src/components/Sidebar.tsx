interface SidebarProps {
  filePath: string;
  onFilePathChange: (path: string) => void;
  onLoad: () => void;
  isLoading: boolean;
}

export function Sidebar({ filePath, onFilePathChange, onLoad, isLoading }: SidebarProps) {
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

      <div className="sidebar-toc-placeholder">
        <p className="sidebar-toc-hint">TOC will appear here</p>
        <p className="sidebar-toc-sub">— Phase 2 —</p>
      </div>
    </aside>
  );
}
