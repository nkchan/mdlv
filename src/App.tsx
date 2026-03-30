import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import "./App.css";

function App() {
  const [filePath, setFilePath] = useState("");
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadFile() {
    if (!filePath.trim()) return;
    setIsLoading(true);
    setError(null);
    setContent(null);

    try {
      const text = await invoke<string>("read_md_file", { path: filePath.trim() });
      setContent(text);
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
      <MainContent content={content} error={error} filePath={filePath} />
    </div>
  );
}

export default App;
