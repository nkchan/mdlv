use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use serde::Serialize;


/// A single node in the workspace directory tree
#[derive(Debug, Serialize, Clone)]
pub struct TreeNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Vec<TreeNode>,
}

/// State: currently opened workspace root
pub struct WorkspaceState {
    pub root: Mutex<Option<String>>,
}

/// Open a workspace by setting a root directory.
/// Returns the directory tree of all markdown files.
#[tauri::command]
pub fn open_workspace(path: String, state: tauri::State<'_, WorkspaceState>) -> Result<TreeNode, String> {
    let p = PathBuf::from(&path);
    if !p.exists() || !p.is_dir() {
        return Err(format!("Not a valid directory: {}", path));
    }

    let mut root_guard = state.root.lock().unwrap();
    *root_guard = Some(path.clone());

    build_tree(&p, 0)
}

/// Get the current workspace root
#[tauri::command]
pub fn get_workspace_root(state: tauri::State<'_, WorkspaceState>) -> Option<String> {
    state.root.lock().unwrap().clone()
}

/// Recursively scan a directory for .md files and build a TreeNode.
/// Limits depth to avoid infinite recursion.
pub fn build_tree(dir: &Path, depth: u8) -> Result<TreeNode, String> {
    if depth > 8 {
        return Ok(TreeNode {
            name: dir.file_name().and_then(|n| n.to_str()).unwrap_or("...").to_string(),
            path: dir.to_str().unwrap_or("").to_string(),
            is_dir: true,
            children: vec![],
        });
    }

    let name = dir.file_name().and_then(|n| n.to_str()).unwrap_or("root").to_string();
    let path_str = dir.to_str().unwrap_or("").to_string();

    let mut children = Vec::new();

    if let Ok(entries) = fs::read_dir(dir) {
        let mut dirs = Vec::new();
        let mut files = Vec::new();

        for entry in entries.flatten() {
            let fp = entry.path();
            let fname = fp.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();

            // Skip hidden files/dirs
            if fname.starts_with('.') { continue; }
            // Skip node_modules and common non-content dirs
            if fname == "node_modules" || fname == "target" || fname == "dist" { continue; }

            if fp.is_dir() {
                dirs.push(fp);
            } else if fp.extension().and_then(|e| e.to_str()) == Some("md") {
                files.push(fp);
            }
        }

        // Sort each group alphabetically
        dirs.sort();
        files.sort();

        // Recurse into directories first
        for d in dirs {
            if let Ok(node) = build_tree(&d, depth + 1) {
                // Only add dirs that have markdown content somewhere inside
                if node.is_dir && (node.children.is_empty()) { continue; }
                children.push(node);
            }
        }

        // Then list files
        for f in files {
            let fname = f.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
            children.push(TreeNode {
                name: fname,
                path: f.to_str().unwrap_or("").to_string(),
                is_dir: false,
                children: vec![],
            });
        }
    }

    Ok(TreeNode {
        name,
        path: path_str,
        is_dir: true,
        children,
    })
}
