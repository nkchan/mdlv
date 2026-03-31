import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface SearchResult {
  file_path: string;
  file_name: string;
  heading_title: string;
  snippet: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (filePath: string, headingTitle: string) => void;
  workspaceRoot: string | null;
}

export function SearchModal({ isOpen, onClose, onSelectResult, workspaceRoot }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !query.trim() || !workspaceRoot) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const hits = await invoke<SearchResult[]>('search_workspace', { query: query.trim() });
        setResults(hits);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query, isOpen, workspaceRoot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results.length > 0 && results[selectedIndex]) {
          const res = results[selectedIndex];
          onSelectResult(res.file_path, res.heading_title);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onSelectResult]);

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-header">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={workspaceRoot ? "Search files in workspace..." : "Open a workspace to search"}
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={!workspaceRoot}
          />
        </div>
        
        {isLoading && <div className="search-loading">Searching...</div>}
        
        <div className="search-results">
          {results.map((res, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={`${res.file_path}-${idx}`}
                className={`search-result-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelectResult(res.file_path, res.heading_title);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="search-result-header">
                  <span className="search-result-file">📄 {res.file_name}</span>
                  <span className="search-result-heading">
                    {res.heading_title !== 'Document Root' && <span className="dir-arrow">›</span>}
                    {res.heading_title !== 'Document Root' ? res.heading_title : ''}
                  </span>
                </div>
                <div className="search-result-snippet">{res.snippet}</div>
              </div>
            );
          })}
          
          {query.trim() && !isLoading && results.length === 0 && (
            <div className="search-no-results">No results found for "{query}"</div>
          )}
        </div>
        <div className="search-footer">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}
