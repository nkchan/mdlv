import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { SectionNode } from "./types/ast";
import "./App.css";

function App() {
  const [filePath, setFilePath] = useState("");
  const [ast, setAst] = useState<SectionNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+J (Mac) or Ctrl+J (Windows/Linux) to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setSidebarVisible((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function loadFile() {
    if (!filePath.trim()) return;
    setIsLoading(true);
    setError(null);
    setAst(null);

    try {
      const parsedAst = await invoke<SectionNode>("parse_md_file", { path: filePath.trim() });
      setAst(parsedAst);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-layout">
      {sidebarVisible && (
        <Sidebar
          filePath={filePath}
          onFilePathChange={setFilePath}
          onLoad={loadFile}
          isLoading={isLoading}
        />
      )}
      <MainContent ast={ast} error={error} />
    </div>
  );
}

export default App;
