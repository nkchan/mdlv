import { SectionNode } from "../types/ast";
import "../Breadcrumb.css";

interface BreadcrumbProps {
  paths: SectionNode[];
  onBreadcrumbClick?: (id: string) => void;
}

export function Breadcrumb({ paths, onBreadcrumbClick }: BreadcrumbProps) {
  if (paths.length === 0) {
    return <div className="breadcrumb-container">Root</div>;
  }

  return (
    <div className="breadcrumb-container">
      {paths.map((sec, idx) => (
        <span key={sec.id} className="breadcrumb-item">
          <span 
            className={`breadcrumb-text ${onBreadcrumbClick ? 'clickable' : ''}`}
            onClick={() => onBreadcrumbClick && onBreadcrumbClick(sec.id)}
            title={onBreadcrumbClick ? "Focus this section" : ""}
          >
            {sec.title || "Untitled"}
          </span>
          {idx < paths.length - 1 && <span className="breadcrumb-separator">›</span>}
        </span>
      ))}
    </div>
  );
}
