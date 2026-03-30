import { useState } from "react";
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
      <Sidebar
        filePath={filePath}
        onFilePathChange={setFilePath}
        onLoad={loadFile}
        isLoading={isLoading}
      />
      <MainContent ast={ast} error={error} />
    </div>
  );
}

export default App;
