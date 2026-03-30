import { useEffect, useRef, useState } from "react";
import { SectionNode } from "../types/ast";
import { Breadcrumb } from "./Breadcrumb";

interface MainContentProps {
  ast: SectionNode | null;
  error: string | null;
}

export function MainContent({ ast, error }: MainContentProps) {
  const [activePath, setActivePath] = useState<SectionNode[]>([]);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [focusId, setFocusId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize Auto-Folding for level >= 3
  useEffect(() => {
    if (!ast) return;
    const initialCollapsed = new Set<string>();
    const traverse = (node: SectionNode) => {
      if (node.level >= 3) {
        initialCollapsed.add(node.id);
      }
      node.children.forEach(traverse);
    };
    traverse(ast);
    setCollapsedIds(initialCollapsed);
  }, [ast]);

  // Recursively find the path to a section by its ID
  function findPathToNode(node: SectionNode, targetId: string, currentPath: SectionNode[] = []): SectionNode[] | null {
    const newPath = [...currentPath, node];
    if (node.id === targetId) return newPath;
    for (const child of node.children) {
      const found = findPathToNode(child, targetId, newPath);
      if (found) return found;
    }
    return null;
  }
  
  // Find node by ID
  function findNodeById(node: SectionNode, targetId: string): SectionNode | null {
    if (node.id === targetId) return node;
    for (const child of node.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
    return null;
  }

  useEffect(() => {
    if (!ast || !contentRef.current) return;

    // Set up intersection observer to track which section is currently on screen
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting element
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top position to find the topmost visible section
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const topVisibleId = visibleEntries[0].target.id;
          
          const path = findPathToNode(ast, topVisibleId);
          if (path) {
            // Remove the root node from breadcrumbs if it's just a dummy root
            if (path.length > 0 && path[0].level === 0) {
              setActivePath(path.slice(1));
            } else {
              setActivePath(path);
            }
          }
        }
      },
      {
        root: contentRef.current,
        rootMargin: "-20% 0px -80% 0px", // Trigger when section hits top 20% of screen
        threshold: 0,
      }
    );

    const sections = contentRef.current.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, [ast, collapsedIds, focusId]); // Re-observe when DOM changes

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const focusOnSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFocusId(id);
    // Expand the focused section
    setCollapsedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  if (error) {
    return (
      <main className="main-content">
        <div className="main-error">
          <span className="main-error-icon">⚠️</span>
          <p className="main-error-msg">{error}</p>
        </div>
      </main>
    );
  }

  if (!ast) {
    return (
      <main className="main-content">
        <div className="main-empty">
          <p className="main-empty-icon">📝</p>
          <p className="main-empty-title">No file loaded</p>
          <p className="main-empty-sub">Enter a path in the sidebar and press Open.</p>
        </div>
      </main>
    );
  }

  const renderSection = (node: SectionNode) => {
    // Determine heading tag based on level
    const HeadingTag = (node.level > 0 && node.level <= 6 
      ? `h${node.level}` 
      : 'div') as keyof React.JSX.IntrinsicElements;

    const isCollapsed = collapsedIds.has(node.id);
    const hasContent = node.blocks.length > 0 || node.children.length > 0;

    return (
      <section key={node.id} id={node.id} className={`md-section level-${node.level}`}>
        {node.level > 0 && (
          <HeadingTag 
            className="md-heading" 
            onClick={(e: any) => toggleCollapse(node.id, e)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCollapse(node.id, e as any);
              }
            }}
            tabIndex={0}
          >
            <span className="md-collapse-icon">
              {hasContent ? (isCollapsed ? "▶" : "▼") : ""}
            </span>
            <span style={{flex: 1}}>{node.title}</span>
            {node.level > 0 && focusId !== node.id && (
              <span 
                className="md-focus-btn" 
                title="Focus this section"
                onClick={(e) => focusOnSection(node.id, e)}
              >
                🔍
              </span>
            )}
          </HeadingTag>
        )}
        
        {!isCollapsed && (
          <>
            {/* Render HTML blocks */}
            <div className="md-blocks">
              {node.blocks.map((b, i) => {
                if (b.type === "HTML") {
                  return <div key={i} className="md-html" dangerouslySetInnerHTML={{ __html: b.html }} />;
                }
                return null;
              })}
            </div>

            {/* Recursively render children */}
            <div className="md-children">
              {node.children.map(renderSection)}
            </div>
          </>
        )}
      </section>
    );
  };
  
  const rootNodeToRender = focusId ? (findNodeById(ast, focusId) || ast) : ast;
  
  // Breadcrumb path logic for focused view
  const displayActivePath = focusId 
    ? (findPathToNode(ast, focusId) || []).filter(n => n.level > 0)
    : activePath;

  return (
    <main className="main-content" ref={contentRef}>
      <div className="main-header sticky" style={{display: 'flex', alignItems: 'center'}}>
        <Breadcrumb paths={displayActivePath} onBreadcrumbClick={(id) => setFocusId(id)} />
        {focusId && (
          <button 
            className="md-focus-clear-btn" 
            onClick={() => setFocusId(null)}
            title="Clear Focus"
          >
            ❌ Clear Focus
          </button>
        )}
      </div>
      <div className="main-scroll-area">
        <div className="main-ast-viewer">
          {renderSection(rootNodeToRender)}
        </div>
      </div>
    </main>
  );
}
