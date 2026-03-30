use std::fs;
use std::path::Path;

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
