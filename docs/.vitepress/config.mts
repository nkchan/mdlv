import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "mdlv",
  description: "The AI-Native Markdown Viewer",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Roadmap', link: '/ROADMAP' }
    ],

    sidebar: [
      {
        text: 'Project',
        items: [
          { text: 'Roadmap', link: '/ROADMAP' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nkchan/mdlv' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present Kaoru Nagashima'
    }
  }
})
