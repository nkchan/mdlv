interface MainContentProps {
  content: string | null;
  error: string | null;
  filePath: string;
}

export function MainContent({ content, error, filePath }: MainContentProps) {
  if (error) {
    return (
      <main className="main-content">
        <div className="main-error">
          <span className="main-error-icon">⚠️</span>
          <p className="main-error-msg">{error}</p>
        </div>
      </main>
    );
  }

  if (content === null) {
    return (
      <main className="main-content">
        <div className="main-empty">
          <p className="main-empty-icon">📝</p>
          <p className="main-empty-title">No file loaded</p>
          <p className="main-empty-sub">Enter a path in the sidebar and press Open.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="main-filepath">{filePath}</div>
      <pre className="main-pre">{content}</pre>
    </main>
  );
}
