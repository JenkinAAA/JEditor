# JEditor

Lightweight rich‑text editor built on Tiptap, with a plugin‑driven toolbar and a simple DOM API (`JEditor.create`). This repo currently targets ESM/Vite usage first; CDN/UMD packaging will be improved in the next iteration.

## What you get today (v1.0.0)
- ESM build and UMD shell outputs under `dist/` (Tiptap is externalized in UMD).
- Basic formatting: bold, italic, underline, strike, undo/redo, clear format.
- Image plugin with paste/upload (base64) and resize handles; `uploadUrl` hook reserved.
- Toolbar generated from config + plugin metadata; plugin manager handles init/destroy.

## Roadmap
1. v1.0.0 – Repo hygiene: README, git init, publishable package metadata.
2. v1.0.1 – Real CDN build: self-contained UMD/IIFE bundle, HTML parsing ready out of the box.
3. v1.1.x – Fill core editing gaps: headings, lists, alignment, text/bg color, font size/family, link, block/inline code, table, upload pipeline.
4. v1.2.x – Source HTML mode: visual ↔ HTML dual pane, predictable round‑trip rules.

## Quick start (dev)
```bash
npm install
npm run dev     # start Vite demo at http://localhost:3000
npm run build   # outputs dist/jeditor.es.js and dist/jeditor.umd.js
npm run preview
```

## Use as a library (ESM)
```js
import 'jeditor/dist/jeditor.css'
import { JEditor } from '@jenkin-a/jeditor'

const editor = JEditor.create('#j-editor-container', {
  placeholder: 'Start typing...',
  image: { uploadUrl: null }, // reserved for future upload
})

// read content
editor.getHTML()
editor.getJSON()
editor.getText()
// write content
editor.setContent('<p>Hello</p>')
```

Peer deps you must install in your app:
```
@tiptap/core
@tiptap/starter-kit
@tiptap/extension-underline
@tiptap/extension-image
@tiptap/pm
```

## Current limitations to know
- UMD build expects Tiptap globals (`TiptapCore`, `StarterKit`, etc.); not a plug‑and‑play CDN yet.
- Many toolbar buttons are placeholders; see `src/plugins/placeholders.js`.
- Image upload is base64; `uploadUrl` wiring is TBD.
- Default config uses `image` key; plugin name is `insertImage`—we will align this before v1.0.1.

## Key files
- `src/jeditor.js` – public API + bootstrap flow.
- `src/core/plugin-manager.js` – plugin registry and lifecycle.
- `src/core/config.js` – default config and merge logic.
- `src/toolbar/ui.js` – toolbar DOM + event binding.
- `src/editor/index.js` – Tiptap editor creation.
- `src/plugins/` – implemented plugins and placeholders.

## License
MIT
