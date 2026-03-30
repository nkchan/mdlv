mod commands;
mod parser;

use std::sync::Mutex;
use commands::file::{read_md_file, parse_md_file, list_md_files_in_dir, watch_file, WatcherState};
use commands::workspace::{open_workspace, get_workspace_root, WorkspaceState};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(WatcherState {
                watcher: Mutex::new(None),
                current_path: Mutex::new(None),
            });
            app.manage(WorkspaceState {
                root: Mutex::new(None),
            });
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_md_file,
            parse_md_file,
            list_md_files_in_dir,
            watch_file,
            open_workspace,
            get_workspace_root,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

