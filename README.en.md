# JEditor

Language: English | [中文](README.md)

Current version: v1.0.0

Lightweight rich-text editor built on Tiptap, with a plugin-driven toolbar and a simple DOM API (`JEditor.create`). ESM / Vite is prioritized today; a fully self-contained CDN / UMD bundle is planned for the next releases.

![Screenshot](Demo/img.png)

---

## Features available now
- ESM build output
- Basic UMD shell (Tiptap is external; a self-contained bundle will follow)
- Core text formatting:
  - bold
  - italic
  - underline
  - strike
  - undo / redo
  - clear format
- Image plugin:
  - paste images
  - base64 insertion
  - drag-to-resize
  - `uploadUrl` hook is reserved (to be implemented)

## Quick start (dev)
```bash
npm install
npm run dev
npm run build
npm run preview
```

## Use in your app (ESM)
```js
import 'jeditor/dist/jeditor.css'
import { JEditor } from '@jenkin-a/jeditor'

const editor = JEditor.create('#j-editor-container', {
  placeholder: 'Start creating...',
  image: { uploadUrl: null }, // upload pipeline will be wired later
})

// read
editor.getHTML()
editor.getJSON()
editor.getText()
// write
editor.setContent('<p>Hello</p>')
```

Peer dependencies you must install:
```
@tiptap/core
@tiptap/starter-kit
@tiptap/extension-underline
@tiptap/extension-image
@tiptap/pm
```

## Roadmap
1. v1.0.0: repo hygiene (README, git init, package metadata).
2. v1.0.1: real CDN / IIFE self-contained build, HTML parsing out of the box.
3. v1.1.x: fill core editing gaps (headings, lists, alignment, text/bg color, font size/family, link, code block / inline code, table, upload pipeline, etc.).
4. v1.2.x: Source HTML mode (visual ↔ HTML dual pane, with well-defined HTML boundaries).

## Known limitations
- Current UMD relies on external Tiptap globals; not yet a single-file CDN drop.
- Toolbar includes placeholder buttons (see `src/plugins/placeholders.js`).
- Image upload is still base64; `uploadUrl` is only reserved.
- Default config key is `image`, plugin name is `insertImage`; will be aligned in v1.0.1.

## Key files
- src/jeditor.js — public API and bootstrap flow
- src/core/plugin-manager.js — plugin registry & lifecycle
- src/core/config.js — default config and merge logic
- src/toolbar/ui.js — toolbar DOM and events
- src/editor/index.js — create the Tiptap editor instance
- src/plugins/ — implemented and placeholder plugins

## License
MIT
