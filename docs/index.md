---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "mdlv"
  text: "Markdown Layered Viewer"
  tagline: The AI-Native Markdown Viewer for the Age of Deep Reasoning.
  image:
    src: https://github.com/nkchan/mdlv/raw/main/src-tauri/icons/128x128.png
    alt: Mdlv Logo
  actions:
    - theme: brand
      text: Get Started
      link: /ROADMAP
    - theme: alt
      text: View on GitHub
      link: https://github.com/nkchan/mdlv

features:
  - title: Hierarchical Focus
    details: Automatically collapse deep sub-sections to stay focused on high-level logic. Designed for 5+ levels of nesting.
  - title: Sticky Breadcrumbs
    details: "H1 > H2 > H3 headers stay at the top, preventing you from losing context in long reasoning chains."
  - title: Direct AST Navigation
    details: Lightning-fast sidebar and search powered by native Rust-based structural analysis.
  - title: High Performance
    details: Built with Tauri v2 and Rust for a lightweight, secure, and snappy native experience on macOS.
---
