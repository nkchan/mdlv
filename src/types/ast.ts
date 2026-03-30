export type InlineNode =
  | { type: "Text"; text: string }
  | { type: "Code"; text: string }
  | { type: "Strong"; children: InlineNode[] }
  | { type: "Emphasis"; children: InlineNode[] }
  | { type: "Link"; url: string; children: InlineNode[] }
  | { type: "Image"; url: string; alt: string };

export type BlockNode =
  | { type: "Paragraph"; children: InlineNode[] }
  | { type: "CodeBlock"; lang: string; code: string }
  | { type: "List"; ordered: boolean; items: ListItem[] }
  | { type: "Blockquote"; blocks: BlockNode[] }
  | { type: "ThematicBreak" }
  | { type: "HTML"; html: string };

export interface ListItem {
  blocks: BlockNode[];
}

export interface SectionNode {
  id: string;
  level: number;
  title: string;
  title_inlines: InlineNode[];
  blocks: BlockNode[];
  children: SectionNode[];
}
