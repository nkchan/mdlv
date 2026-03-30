import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { SectionNode } from "./types/ast";
import { TreeNode } from "./types/workspace";
import "./App.css";

function App() {
  const [workspaceRoot, setWorkspaceRoot] = useState<string | null>(null);
  const [workspaceTree, setWorkspaceTree] = useState<TreeNode | null>(null);
  const [filePath, setFilePath] = useState("");
  const [ast, setAst] = useState<SectionNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [filesInDir, setFilesInDir] = useState<{name: string, path: string}[]>([]);


  const loadFileRef = useRef<() => void>(() => {});

  // Ref to hold the latest filePath for the event listener without recreating it constantly
  const filePathRef = useRef(filePath);
  useEffect(() => {
    filePathRef.current = filePath;
  }, [filePath]);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      unlisten = await listen<{ path: string }>("file-changed", (event) => {
        // If the changed file is the one we are currently viewing, reload it.
        // notify can sometimes send absolute paths with slightly different formats, 
        // but exact matching or simple includes is usually enough.
        if (filePathRef.current && event.payload.path === filePathRef.current) {
            loadFileRef.current();
        }
      });
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

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
      // Start watching the file on the backend
      try {
        await invoke("watch_file", { path: filePath.trim() });
      } catch (watchErr) {
        console.warn("Failed to watch file:", watchErr);
      }

      const parsedAst = await invoke<SectionNode>("parse_md_file", { path: filePath.trim() });
      setAst(parsedAst);

      // Fetch files in the same directory
      try {
        const files = await invoke<{name: string, path: string}[]>("list_md_files_in_dir", { path: filePath.trim() });
        setFilesInDir(files);
      } catch (err) {
        console.warn("Failed to list directory files:", err);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }

  // Update ref to always point to the fresh loadFile function
  useEffect(() => {
    loadFileRef.current = loadFile;
  }, [filePath]); // we only need latest loadFile tied to filePath

  async function openWorkspace() {
    try {
      const selected = await open({ directory: true, multiple: false, title: "Open Workspace Folder" });
      if (!selected) return;
      const dirPath = Array.isArray(selected) ? selected[0] : selected;
      const tree = await invoke<TreeNode>("open_workspace", { path: dirPath });
      setWorkspaceRoot(dirPath);
      setWorkspaceTree(tree);
      setFilePath("");
      setAst(null);
      setError(null);
    } catch (e) {
      console.error("Failed to open workspace:", e);
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
          ast={ast}
          filesInDir={filesInDir}
          workspaceRoot={workspaceRoot}
          workspaceTree={workspaceTree}
          onOpenWorkspace={openWorkspace}
        />
      )}
      <MainContent ast={ast} error={error} />
    </div>
  );
}

export default App;
