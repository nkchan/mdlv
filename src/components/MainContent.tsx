import { useEffect, useRef, useState } from "react";
import { SectionNode } from "../types/ast";
import { Breadcrumb } from "./Breadcrumb";

interface MainContentProps {
  ast: SectionNode | null;
  error: string | null;
}

export function MainContent({ ast, error }: MainContentProps) {
  const [activePath, setActivePath] = useState<SectionNode[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

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
  }, [ast]);

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

    return (
      <section key={node.id} id={node.id} className={`md-section level-${node.level}`}>
        {node.level > 0 && (
          <HeadingTag className="md-heading">{node.title}</HeadingTag>
        )}
        
        {/* Render HTML blocks */}
        <div className="md-blocks">
          {node.blocks.map((b, i) => {
            if (b.type === "HTML") {
              return <div key={i} className="md-html" dangerouslySetInnerHTML={{ __html: b.html }} />;
            }
            return null; // For MVP, we're relying on HTML fallback block
          })}
        </div>

        {/* Recursively render children */}
        <div className="md-children">
          {node.children.map(renderSection)}
        </div>
      </section>
    );
  };

  return (
    <main className="main-content">
      <div className="main-header sticky">
        <Breadcrumb paths={activePath} />
      </div>
      <div className="main-scroll-area" ref={contentRef}>
        <div className="main-ast-viewer">
          {renderSection(ast)}
        </div>
      </div>
    </main>
  );
}
