mod commands;
mod parser;

use commands::file::{read_md_file, parse_md_file};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_md_file, parse_md_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
