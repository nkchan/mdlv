use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use notify::{Watcher, RecursiveMode, Event as NotifyEvent, RecommendedWatcher};
use tauri::{AppHandle, Emitter, State};
use crate::parser::ast::{parse_markdown_to_ast, SectionNode};

pub struct WatcherState {
    pub watcher: Mutex<Option<RecommendedWatcher>>,
    pub current_path: Mutex<Option<String>>,
}

/// Read a local Markdown file and return its content as a String.
/// Returns an error message string if the file cannot be read.
#[tauri::command]
pub fn read_md_file(path: String) -> Result<String, String> {
    let p = Path::new(&path);

    if !p.exists() {
        return Err(format!("File not found: {}", path));
    }

    if p.extension().and_then(|e| e.to_str()) != Some("md") {
        return Err(format!("Not a Markdown file: {}", path));
    }

    fs::read_to_string(p).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub fn parse_md_file(path: String) -> Result<SectionNode, String> {
    let p = Path::new(&path);

    if !p.exists() {
        return Err(format!("File not found: {}", path));
    }

    if p.extension().and_then(|e| e.to_str()) != Some("md") {
        return Err(format!("Not a Markdown file: {}", path));
    }

    let md = fs::read_to_string(p).map_err(|e| format!("Failed to read file: {}", e))?;
    Ok(parse_markdown_to_ast(&md))
}

#[derive(serde::Serialize)]
pub struct FileEntry {
    name: String,
    path: String,
}

#[tauri::command]
pub fn list_md_files_in_dir(path: String) -> Result<Vec<FileEntry>, String> {
    let p = Path::new(&path);
    
    // If path is a file, use its parent directory. If it's a dir, use it.
    let dir = if p.is_file() {
        p.parent().unwrap_or(p)
    } else {
        p
    };

    if !dir.exists() || !dir.is_dir() {
        return Err(format!("Directory not found: {:?}", dir));
    }

    let mut entries = Vec::new();

    if let Ok(rd) = fs::read_dir(dir) {
        for entry in rd.flatten() {
            let fp = entry.path();
            if fp.is_file() && fp.extension().and_then(|e| e.to_str()) == Some("md") {
                if let (Some(name), Some(path_str)) = (fp.file_name().and_then(|n| n.to_str()), fp.to_str()) {
                    // Ignore hidden files like .filename.md
                    if !name.starts_with('.') {
                        entries.push(FileEntry {
                            name: name.to_string(),
                            path: path_str.to_string(),
                        });
                    }
                }
            }
        }
    }

    // Sort alphabetically
    entries.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(entries)
}

#[derive(serde::Serialize, Clone)]
struct FileChangedPayload {
    path: String,
}

#[tauri::command]
pub fn watch_file(path: String, app: AppHandle, state: State<'_, WatcherState>) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err(format!("File not found: {}", path));
    }

    let mut current_path_guard = state.current_path.lock().unwrap();
    let mut watcher_guard = state.watcher.lock().unwrap();

    // If we are already watching this path, do nothing.
    if current_path_guard.as_deref() == Some(path.as_str()) {
        return Ok(());
    }

    // Drop the old watcher to stop watching old files
    *watcher_guard = None;

    // Create a new watcher
    let app_clone = app.clone();
    let path_clone = path.clone();
    
    let mut watcher = notify::recommended_watcher(move |res: notify::Result<NotifyEvent>| {
        match res {
            Ok(event) => {
                // If it's a Modify event, trigger the frontend refresh
                if event.kind.is_modify() {
                    let _ = app_clone.emit("file-changed", FileChangedPayload {
                        path: path_clone.clone(),
                    });
                }
            },
            Err(e) => println!("watch error: {:?}", e),
        }
    }).map_err(|e| format!("Failed to initialize watcher: {}", e))?;

    // Watch the parent directory to catch file replacements/saves safely,
    // or watch the file directly (some text editors replace files causing direct watch to fail).
    // Let's watch the parent dir if it's a file, and filter events inside the callback if needed?
    // Watching the file directly works in macOS for standard writes, but atomic saves might break it.
    // We will just watch the exact file here.
    watcher.watch(&p, RecursiveMode::NonRecursive).map_err(|e| format!("Failed to watch file: {}", e))?;

    *watcher_guard = Some(watcher);
    *current_path_guard = Some(path);

    Ok(())
}

