use pulldown_cmark::{Event, HeadingLevel, Options, Parser, Tag, TagEnd};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum InlineNode {
    Text { text: String },
    Code { text: String },
    Strong { children: Vec<InlineNode> },
    Emphasis { children: Vec<InlineNode> },
    Link { url: String, children: Vec<InlineNode> },
    Image { url: String, alt: String },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum BlockNode {
    Paragraph { children: Vec<InlineNode> },
    CodeBlock { lang: String, code: String },
    List { ordered: bool, items: Vec<ListItem> },
    Blockquote { blocks: Vec<BlockNode> },
    ThematicBreak,
    HTML { html: String },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ListItem {
    pub blocks: Vec<BlockNode>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SectionNode {
    pub id: String,
    pub level: u8,
    pub title: String,
    pub title_inlines: Vec<InlineNode>,
    pub blocks: Vec<BlockNode>,
    pub children: Vec<SectionNode>,
}

pub fn process_ai_blocks(html: &str) -> String {
    html.replace("<think>", "<details class=\"md-ai-thought\"><summary>Thinking Process...</summary><div class=\"md-ai-thought-content\">")
        .replace("</think>", "</div></details>")
        .replace("<thought>", "<details class=\"md-ai-thought\"><summary>Thinking Process...</summary><div class=\"md-ai-thought-content\">")
        .replace("</thought>", "</div></details>")
}

pub fn parse_markdown_to_ast(md: &str) -> SectionNode {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_TASKLISTS);
    
    let parser = Parser::new_ext(md, options);

    let mut id_counter = 0;
    
    let root_section = SectionNode {
        id: format!("sec-{}", id_counter),
        level: 0,
        title: "Root".to_string(),
        title_inlines: vec![],
        blocks: vec![],
        children: vec![],
    };

    let mut section_stack: Vec<SectionNode> = vec![root_section];
    
    // Simplistic state machine
    let _current_blocks: Vec<BlockNode> = vec![];
    let _current_inlines: Vec<InlineNode> = vec![];
    let mut in_heading = false;
    let mut heading_level = 0;
    
    // For storing nested structured elements like lists or blockquotes, we need more stacks.
    // For MVP, we will treat everything between headings as simple text blocks unless they are specifically parsed.
    // To make it fully robust takes hundreds of lines of code.
    // Let's implement a fallback HTML renderer for the `content` of sections to meet the MVP,
    // and extract Heading AST and List depths for TOC.
    
    let mut current_section_html = String::new();
    let mut heading_text = String::new();

    for event in parser {
        match event {
            Event::Start(Tag::Heading { level, .. }) => {
                in_heading = true;
                let lvl = match level {
                    HeadingLevel::H1 => 1,
                    HeadingLevel::H2 => 2,
                    HeadingLevel::H3 => 3,
                    HeadingLevel::H4 => 4,
                    HeadingLevel::H5 => 5,
                    HeadingLevel::H6 => 6,
                };
                heading_level = lvl;
                heading_text.clear();
                
                // 見出しが始まる前に、今のセクションに溜まっていたHTMLを確定させる
                if let Some(mut top) = section_stack.pop() {
                    if !current_section_html.is_empty() {
                        let processed = process_ai_blocks(&current_section_html);
                        top.blocks.push(BlockNode::HTML { html: processed });
                        current_section_html.clear();
                    }
                    section_stack.push(top);
                }
            }
            Event::End(TagEnd::Heading(_)) => {
                in_heading = false;
                
                // 現在のスタックのうち、これから追加する見出しのレベル以上のものをpopする
                let mut popped = vec![];
                while let Some(top) = section_stack.last() {
                    if top.level >= heading_level && top.level != 0 {
                        popped.push(section_stack.pop().unwrap());
                    } else {
                        break;
                    }
                }
                
                for child in popped.into_iter().rev() {
                    if let Some(parent) = section_stack.last_mut() {
                        parent.children.push(child);
                    }
                }

                id_counter += 1;
                let new_sec = SectionNode {
                    id: format!("sec-{}", id_counter),
                    level: heading_level,
                    title: heading_text.clone(),
                    title_inlines: vec![InlineNode::Text { text: heading_text.clone() }],
                    blocks: vec![],
                    children: vec![],
                };
                
                section_stack.push(new_sec);
            }
            Event::Text(ref text) | Event::Code(ref text) => {
                if in_heading {
                    heading_text.push_str(text);
                } else {
                    let html_event = std::iter::once(event.clone());
                    let mut html_out = String::new();
                    pulldown_cmark::html::push_html(&mut html_out, html_event);
                    current_section_html.push_str(&html_out);
                }
            }
            e => {
                if !in_heading {
                    let html_event = std::iter::once(e.clone());
                    let mut html_out = String::new();
                    pulldown_cmark::html::push_html(&mut html_out, html_event);
                    current_section_html.push_str(&html_out);
                }
            }
        }
    }

    // Finalize the last section and unwind the stack
    if !current_section_html.is_empty() {
        if let Some(mut top) = section_stack.pop() {
            let processed = process_ai_blocks(&current_section_html);
            top.blocks.push(BlockNode::HTML { html: processed });
            section_stack.push(top);
        }
    }

    while section_stack.len() > 1 {
        let child = section_stack.pop().unwrap();
        if let Some(parent) = section_stack.last_mut() {
            parent.children.push(child);
        }
    }

    section_stack.pop().unwrap()
}
