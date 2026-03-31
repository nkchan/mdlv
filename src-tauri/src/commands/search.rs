use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use tauri::State;
use crate::commands::workspace::WorkspaceState;
use crate::parser::ast::{SectionNode, BlockNode, parse_markdown_to_ast};

#[derive(Debug, Serialize, Clone)]
pub struct SearchResult {
    pub file_path: String,
    pub file_name: String,
    pub heading_title: String,
    pub snippet: String,
}

fn strip_html_tags(html: &str) -> String {
    let mut text = String::with_capacity(html.len());
    let mut in_tag = false;
    for c in html.chars() {
        if c == '<' {
            in_tag = true;
        } else if c == '>' {
            in_tag = false;
            text.push(' '); // replace tags with space
        } else if !in_tag {
            text.push(c);
        }
    }
    // collapse multiple spaces into one
    let tokens: Vec<&str> = text.split_whitespace().collect();
    tokens.join(" ")
}

#[tauri::command]
pub fn search_workspace(state: State<'_, WorkspaceState>, query: String) -> Result<Vec<SearchResult>, String> {
    let root = state.root.lock().unwrap();
    let root_path = match root.as_ref() {
        Some(path) => path.clone(),
        None => return Err("No workspace opened".into()),
    };

    let query_lower = query.to_lowercase();
    if query_lower.trim().is_empty() {
        return Ok(vec![]);
    }

    let mut results = vec![];
    let mut files_to_scan = vec![PathBuf::from(root_path)];

    // Recursive scan for .md
    while let Some(path) = files_to_scan.pop() {
        if path.is_dir() {
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                if matches!(name, ".git" | "node_modules" | "target" | "dist" | "out") || name.starts_with('.') {
                    continue;
                }
            }
            if let Ok(entries) = fs::read_dir(&path) {
                for entry in entries.flatten() {
                    files_to_scan.push(entry.path());
                }
            }
        } else if let Some(ext) = path.extension() {
            if ext == "md" {
                if let Ok(content) = fs::read_to_string(&path) {
                    let ast = parse_markdown_to_ast(&content);
                    let file_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                    let file_path = path.to_string_lossy().to_string();
                    search_ast_node(&ast, &query_lower, &file_name, &file_path, &mut results);
                }
            }
        }
    }

    Ok(results)
}

fn search_ast_node(node: &SectionNode, query_lower: &str, file_name: &str, file_path: &str, results: &mut Vec<SearchResult>) {
    let plain_title = strip_html_tags(&node.title);
    if plain_title.to_lowercase().contains(query_lower) {
        results.push(SearchResult {
            file_path: file_path.to_string(),
            file_name: file_name.to_string(),
            heading_title: if plain_title.is_empty() { "Document Root".to_string() } else { plain_title.clone() },
            snippet: format!("(Heading Match) {}", plain_title),
        });
    }

    for block in &node.blocks {
        match block {
            BlockNode::HTML { html } => {
                let plain_text = strip_html_tags(html);
                let lower_text = plain_text.to_lowercase();
                
                if let Some(idx) = lower_text.find(query_lower) {
                    let start = idx.saturating_sub(40);
                    let end = (idx + query_lower.len() + 40).min(plain_text.len());
                    
                    // adjust boundaries to approximate character indexing instead of strict bytes
                    // to avoid panicking on multibyte emoji/kanji boundary
                    let safe_start = plain_text.char_indices().rev().skip_while(|&(i, _)| i > start).last().map(|(i, _)| i).unwrap_or(0);
                    let safe_end = plain_text.char_indices().skip_while(|&(i, _)| i < end).next().map(|(i, _)| i).unwrap_or(plain_text.len());
                    
                    let snippet = format!("...{}...", &plain_text[safe_start..safe_end]);
                    
                    results.push(SearchResult {
                        file_path: file_path.to_string(),
                        file_name: file_name.to_string(),
                        heading_title: if plain_title.is_empty() { "Document Root".to_string() } else { plain_title.clone() },
                        snippet,
                    });
                    
                    // Take only first match per block to avoid spam
                }
            }
            _ => {}
        }
    }

    for child in &node.children {
        search_ast_node(child, query_lower, file_name, file_path, results);
    }
}
