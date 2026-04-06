# JEditor

Language: English | [中文](https://github.com/JenkinAAA/JEditor/blob/master/README.md)

Repository: [JenkinAAA/JEditor](https://github.com/JenkinAAA/JEditor)

Current version: `v1.2.1`

**✨ Live Demos:**
- [👉 CDN Demo (Standalone environment)](./Demo/cdn.html)
- [👉 Local Build Demo (NPM environment)](./Demo/npm.html)

JEditor is a hybrid editor built on Tiptap for:

- visual rich-text editing
- source HTML editing
- high-fidelity HTML preservation
- direct browser and CDN usage

It is designed for teams that need both document-style editing and reliable HTML round-tripping.

![JEditor Screenshot](https://raw.githubusercontent.com/JenkinAAA/JEditor/master/Demo/img.png)

Image source: [Demo/img.png](https://github.com/JenkinAAA/JEditor/blob/master/Demo/img.png)

## What's New In v1.2.1

This is a maintenance release focused on bug fixes and demo improvements:
- **Bug Fix**: Fixed a crucial issue where the HTML formatter was breaking `white-space: pre` alignment by forcefully applying indents and line breaks inside `<pre><code>` blocks, causing rendered HTML out in third-party containers to misalign.
- **Bug Fix**: Fixed the fullscreen UI toggle button not syncing properly upon returning from fullscreen.
- **Enhancement**: Overhauled the internal `Demo/` showcase layout and updated code snippets for much better visual representation.

---

## What's New In v1.2.0

This release is a major upgrade from the original `1.0.x` line.

- rebuilt table interactions:
  - full table drag handle
  - row / column action controls
  - bottom-right resize handle
  - row-height persistence
  - safer source/visual round-trip handling
- rebuilt code block fidelity:
  - high-fidelity source HTML output
  - third-party HTML rendering support
  - syntax-highlight markup export
  - safe source-to-visual re-entry
- improved callout and table source fidelity for third-party HTML environments
- source mode enhancements:
  - better raw HTML preservation heuristics
  - high-fidelity iframe preview for preserved blocks
- new Export PDF / Print action in the primary toolbar
- link behavior optimized for editing:
  - normal click selects the link
  - `Ctrl` / `Cmd + Click` opens it
- drag handles added for blockquote, divider, and code block
- multiple visual and interaction bug fixes across heading, strike, source preview, and toolbar flows

## Core Ideas

JEditor treats source HTML as the canonical representation whenever possible.

The editor flow is:

```text
Source HTML
  -> preprocessHTML()
  -> visual projection
  -> Tiptap editing
  -> restoreRawHTML()
  -> output HTML
```

This makes JEditor suitable for scenarios where unsupported or complex HTML must survive editing.

## Main Features

- dual-toolbar editor UI
- visual mode and source mode
- raw HTML preservation for unsupported blocks
- full HTML document support
- rich-text features:
  - heading / paragraph
  - font family / font size
  - bold / italic / underline / strike
  - text color
  - alignment / line height
  - bullet and ordered lists
  - blockquote
  - inline code
  - code block
  - link
  - image
  - callout
  - table
- browser print / save as PDF
- ESM / UMD / IIFE builds
- CDN usage without npm

## High-Fidelity HTML Strategy

JEditor uses a dual-shape strategy for advanced blocks:

- source HTML keeps a high-fidelity exported shape suitable for third-party HTML environments
- visual mode uses an internal shape that is safer for ProseMirror/Tiptap to edit
- the editor converts between those shapes during source/visual transitions

This is currently applied most strongly to:

- code block
- callout
- table

## Install

```bash
npm install @jenkin-a/jeditor
```

## Development

```bash
npm install
npm run dev
npm run build
npm test
npm run preview
```

Build outputs:

- `dist/jeditor.es.js`
- `dist/jeditor.umd.js`
- `dist/jeditor.iife.js`
- `dist/jeditor.css`

Release checklist:

- `docs/release-checklist.md`

## ESM Usage

```js
import '@jenkin-a/jeditor/dist/jeditor.css'
import { JEditor } from '@jenkin-a/jeditor'

const editor = JEditor.create('#editor', {
  placeholder: 'Start writing...',
})
```

You can also bootstrap from an HTML string:

```js
const editor = JEditor.fromHTML('#editor', '<h2>Hello</h2><p>World</p>')
```

## CDN Usage

```html
<link rel="stylesheet" href="https://unpkg.com/@jenkin-a/jeditor@1.2.1/dist/jeditor.css" />
<script src="https://unpkg.com/@jenkin-a/jeditor@1.2.1/dist/jeditor.iife.js"></script>

<div id="editor">
  <h2>Hello, JEditor</h2>
  <p>The native HTML inside this container will be parsed on startup.</p>
</div>

<script>
  const editor = window.JEditor.create('#editor', {
    placeholder: 'Start writing...',
  })
</script>
```

## API

```js
editor.getHTML()
editor.getJSON()
editor.getText()
editor.setContent('<p>Hello</p>')
editor.importHTML('<p>Hello</p>')
editor.focus()
editor.destroy()
editor.toggleSourceMode()
editor.exportPDF()
```

## Good Fit For

- knowledge-base editors
- documentation systems
- source-aware CMS editors
- admin tools that need both WYSIWYG and HTML editing
- HTML email or fragment workflows
- browser integrations that prefer CDN delivery

## Known Boundaries

- there is still no automated test suite in the repository
- some HTML preservation rules are heuristic and may need tuning for niche markup
- very large documents with many preserved or high-fidelity blocks may feel heavy in source/visual switching
- PDF export currently uses the browser print flow, so "Save as PDF" depends on the user agent

## License

MIT
