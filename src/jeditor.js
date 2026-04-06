import { PluginManager } from './core/plugin-manager.js'
import { mergeConfig } from './core/config.js'
import { builtinPlugins } from './plugins/index.js'
import { createEditor } from './editor/index.js'
import { createToolbarDOM, initToolbarEvents } from './toolbar/ui.js'
import { formatHTMLForDisplay, preprocessHTML, restoreRawHTML } from './core/html-preservation.js'

function resolveElement(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target

  if (!el) {
    throw new Error(`[JEditor] Container not found: ${target}`)
  }

  return el
}

function getInitialContent(sourceEl, config) {
  if (config.content != null) return config.content

  if (sourceEl instanceof HTMLTextAreaElement) {
    const value = sourceEl.value.trim()
    return value || null
  }

  const html = sourceEl.innerHTML.trim()
  return html || null
}

function createMountElement(sourceEl) {
  if (sourceEl instanceof HTMLTextAreaElement) {
    const mountEl = document.createElement('div')
    mountEl.className = sourceEl.className
    sourceEl.insertAdjacentElement('afterend', mountEl)
    sourceEl.style.display = 'none'
    return mountEl
  }

  sourceEl.innerHTML = ''
  return sourceEl
}

function isFullDocumentHTML(content = '') {
  return /<!DOCTYPE\s+html/i.test(content) || /<html[\s>]/i.test(content)
}

const VIEWER_STYLE = `
@page {
    size: auto;
    margin: 16mm;
}
body {
    margin: 0;
    padding: 32px 60px;
    color: #333;
    font-size: 14px;
    line-height: 1.7;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif;
    box-sizing: border-box;
    overflow-wrap: anywhere;
    word-break: break-word;
}
body * {
    box-sizing: border-box;
}
h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
h3 { font-size: 1.25em; font-weight: bold; margin-bottom: 0.5em; }
h4 { font-size: 1.125em; font-weight: bold; margin-bottom: 0.5em; }
h5 { font-size: 1em; font-weight: bold; margin-bottom: 0.5em; }
h6 { font-size: 1em; font-weight: bold; margin-bottom: 0.5em; }
p { margin-bottom: 0.8em; line-height: 1.7; }
blockquote {
    margin: 0.8em 0;
    padding: 8px 16px 8px 18px;
    border-left: 3px solid #374151;
    background: #f3f4f6;
    color: #111827;
}
blockquote,
h1, h2, h3, h4, h5, h6,
p, li {
    max-width: 100%;
    overflow-wrap: anywhere;
    word-break: break-word;
}
ul { list-style-type: disc; padding-left: 1.7em; margin-bottom: 0.8em; }
ul li::marker { color: #1C81D9; }
ol {
    list-style-type: none;
    padding-left: 3.2em;
    margin-bottom: 0.8em;
    counter-reset: je-ol;
}
ol > li {
    position: relative;
    counter-increment: je-ol;
}
ol > li::before {
    content: counter(je-ol) '.';
    position: absolute;
    left: -3.2em;
    width: 2.6em;
    color: #1C81D9;
    white-space: nowrap;
    text-align: right;
    font-variant-numeric: tabular-nums;
}
ol ol {
    counter-reset: je-sub-ol;
    padding-left: 3.8em;
}
ol ol > li {
    counter-increment: je-sub-ol;
}
ol ol > li::before {
    content: counter(je-ol) '.' counter(je-sub-ol);
    left: -3.8em;
    width: 3.2em;
}
ol ol ol {
    counter-reset: je-sub-sub-ol;
    padding-left: 4.8em;
}
ol ol ol > li {
    counter-increment: je-sub-sub-ol;
}
ol ol ol > li::before {
    content: counter(je-ol) '.' counter(je-sub-ol) '.' counter(je-sub-sub-ol);
    left: -4.8em;
    width: 4.2em;
}
li > p { margin-bottom: 0.35em; }
hr {
    margin: 1.1em 0;
    height: 1px;
    border: none;
    background: #e5e7eb;
}
a {
    color: #2563eb;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
}
s,
strike {
    text-decoration: none;
    background-image: linear-gradient(currentColor, currentColor);
    background-repeat: repeat-x;
    background-size: 100% max(1px, 0.08em);
    background-position: 0 58%;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
}
code {
    padding: 0.14em 0.42em;
    border: 1px solid #e8edf3;
    border-radius: 6px;
    background: #f7f9fc;
    color: #c2410c;
    font-weight: 700;
    font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
    font-size: 0.92em;
}
pre {
    margin: 1em 0;
    overflow-x: auto;
}
pre code[class^="language-"],
pre code[class*=" language-"],
pre code.hljs,
pre code {
    display: block;
    padding: 12px 16px 16px;
    border: none;
    border-radius: 0;
    background: transparent;
    color: #24292e;
    font-weight: 400;
    font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
    font-size: 13px;
    box-shadow: none;
}
pre code .hljs-comment,
pre code .hljs-quote {
    color: #6a737d;
    font-style: italic;
}
pre code .hljs-keyword,
pre code .hljs-doctag,
pre code .hljs-selector-tag,
pre code .hljs-literal,
pre code .hljs-type {
    color: #d73a49;
}
pre code .hljs-string,
pre code .hljs-attr,
pre code .hljs-template-tag {
    color: #032f62;
}
pre code .hljs-number,
pre code .hljs-built_in,
pre code .hljs-title.class_,
pre code .hljs-symbol {
    color: #005cc5;
}
pre code .hljs-function,
pre code .hljs-title.function_ {
    color: #6f42c1;
}
table {
    width: auto;
    margin: 1em 0;
    border-collapse: collapse;
    table-layout: fixed;
    background: #fff;
}
th, td {
    width: 8px;
    min-width: 8px;
    height: 4px;
    padding: 4px 8px;
    border: 1px solid #e5e7eb;
    vertical-align: top;
}
th {
    background: #f8fafc;
    font-weight: 600;
    color: #374151;
}
.je-callout {
    margin: 12px 0;
    width: 100%;
    padding: 14px 16px 16px;
    border-radius: 14px;
    background: var(--je-callout-bg, #FAF8FF);
    color: var(--je-callout-color, #9333EA);
    border: 1px solid color-mix(in srgb, var(--je-callout-color, #9333EA) 12%, transparent);
}
.je-callout-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    user-select: none;
}
.je-callout[data-callout-type="default"] .je-callout-header {
    display: none;
}
.je-callout-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}
.je-callout-icon svg {
    width: 18px;
    height: 18px;
}
.je-callout-title {
    font-size: 14px;
    font-weight: 700;
}
.je-callout-body {
    color: inherit;
    min-height: 24px;
}
.je-callout-body > :last-child {
    margin-bottom: 0;
}
.je-callout-body p {
    color: inherit;
}
`

function wrapHTMLDocument(fragment = '', title = 'JEditor Source Preview') {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>${VIEWER_STYLE}</style>
</head>
<body>
${fragment}
</body>
</html>`
}

function extractVisualHTML(source = '') {
  if (!isFullDocumentHTML(source)) return source

  const doc = new DOMParser().parseFromString(source, 'text/html')
  return doc.body?.innerHTML?.trim() || '<p></p>'
}

export class JEditor {
  static create(target, userConfig = {}) {
    return new JEditor(resolveElement(target), userConfig)
  }

  static fromHTML(target, html, userConfig = {}) {
    return JEditor.create(target, {
      ...userConfig,
      content: html,
    })
  }

  constructor(container, userConfig = {}) {
    this._sourceElement = container
    this._config = mergeConfig(userConfig)
    this._pm = new PluginManager()
    this._editor = null
    this._toolbarCleanup = null
    this._mountElement = null
    this._editorArea = null
    this._visualHost = null
    this._documentPreview = null
    this._sourcePane = null
    this._sourceTextarea = null
    this._sourcePreview = null
    this._sourceMode = false
    this._sourceDocumentHTML = null
    this._sourceDocumentMode = false
    this._visualDirtySinceSource = false
    this._suspendVisualSync = false
    this._sourceRawValue = ''
    this._sourceDisplayValue = ''
    this._scrollCleanup = null
    this._printFrame = null

    this._bootstrap()
  }

  _openSourceForRawHTML(rawHTML) {
    this.toggleSourceMode(true)

    if (!this._sourceTextarea) return

    const index = this._sourceTextarea.value.indexOf(rawHTML)
    this._sourceTextarea.focus()

    if (index >= 0) {
      this._sourceTextarea.setSelectionRange(index, index + rawHTML.length)
    }
  }

  _normalizeVisualContent(content) {
    return preprocessHTML(extractVisualHTML(content ?? ''))
  }

  _getVisualHTML() {
    return restoreRawHTML(this._editor.getHTML())
  }

  _getSourceDisplayHTML(source) {
    if (this._sourceDocumentMode && !this._visualDirtySinceSource && source) {
      return source
    }
    return formatHTMLForDisplay(source || '')
  }

  _getCurrentSourceHTML() {
    if (!this._sourceMode) {
      return this.getHTML()
    }

    if (this._sourceTextarea.value === this._sourceDisplayValue) {
      return this._sourceRawValue
    }

    return this._sourceTextarea.value
  }

  _getPrintableHTMLDocument() {
    const source = this._getCurrentSourceHTML() || this.getHTML() || '<p></p>'
    if (isFullDocumentHTML(source)) {
      return source
    }

    const title = document.title || 'JEditor Export'
    return wrapHTMLDocument(source, title)
  }

  _cleanupPrintFrame(frame) {
    if (!frame) return
    frame.remove()
    if (this._printFrame === frame) {
      this._printFrame = null
    }
  }

  exportPDF() {
    const printableHTML = this._getPrintableHTMLDocument()
    const frame = document.createElement('iframe')
    frame.className = 'je-print-frame'
    frame.setAttribute('aria-hidden', 'true')
    frame.style.position = 'fixed'
    frame.style.right = '0'
    frame.style.bottom = '0'
    frame.style.width = '0'
    frame.style.height = '0'
    frame.style.border = '0'
    frame.style.opacity = '0'
    frame.style.pointerEvents = 'none'

    this._cleanupPrintFrame(this._printFrame)
    this._printFrame = frame
    document.body.appendChild(frame)

    let cleaned = false
    const cleanup = () => {
      if (cleaned) return
      cleaned = true
      this._cleanupPrintFrame(frame)
    }

    frame.onload = () => {
      const printWindow = frame.contentWindow
      if (!printWindow) {
        cleanup()
        return
      }

      const handleAfterPrint = () => {
        printWindow.removeEventListener('afterprint', handleAfterPrint)
        window.removeEventListener('focus', handleFocusBack)
        window.setTimeout(cleanup, 0)
      }

      const handleFocusBack = () => {
        window.removeEventListener('focus', handleFocusBack)
        printWindow.removeEventListener('afterprint', handleAfterPrint)
        window.setTimeout(cleanup, 300)
      }

      printWindow.addEventListener('afterprint', handleAfterPrint)
      window.addEventListener('focus', handleFocusBack, { once: true })

      window.setTimeout(() => {
        try {
          printWindow.focus()
          printWindow.print()
        } catch {
          cleanup()
        }
      }, 80)
    }

    frame.srcdoc = printableHTML
    return this
  }

  _bootstrap() {
    this._pm.registerAll(builtinPlugins)

    const initialContent = getInitialContent(this._sourceElement, this._config)
    const mountEl = createMountElement(this._sourceElement)
    const moreController = {
      pluginManager: this._pm,
      staticItems: ['blockquote', 'horizontalRule'],
      hiddenItems: [],
      getItems() {
        return [...this.staticItems, ...this.hiddenItems]
      },
    }
    const editorConfig = {
      ...this._config,
      content: this._normalizeVisualContent(initialContent ?? this._config.content),
      exportPdf: {
        ...this._config.exportPdf,
        controller: {
          export: () => this.exportPDF(),
        },
      },
      source: {
        ...this._config.source,
        controller: {
          toggle: () => this.toggleSourceMode(),
          isActive: () => this._sourceMode,
        },
      },
      htmlPreservation: {
        ...this._config.htmlPreservation,
        onOpenSource: (rawHTML) => this._openSourceForRawHTML(rawHTML),
      },
      more: {
        ...this._config.more,
        controller: moreController,
      },
    }

    this._sourceDocumentHTML = initialContent ?? this._config.content ?? null
    this._sourceDocumentMode = isFullDocumentHTML(this._sourceDocumentHTML || '')

    mountEl.classList.add('je-container')
    mountEl.appendChild(createToolbarDOM(editorConfig, this._pm))

    const wrapper = document.createElement('div')
    wrapper.className = 'je-editor-area'
    mountEl.appendChild(wrapper)

    const visualHost = document.createElement('div')
    visualHost.className = 'je-editor-visual'
    wrapper.appendChild(visualHost)

    const documentPreview = document.createElement('iframe')
    documentPreview.className = 'je-document-preview'
    documentPreview.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups',
    )
    visualHost.appendChild(documentPreview)

    const sourcePane = document.createElement('div')
    sourcePane.className = 'je-source-pane'

    const sourceTextarea = document.createElement('textarea')
    sourceTextarea.className = 'je-source-textarea'
    sourceTextarea.spellcheck = false
    sourceTextarea.placeholder = '<!DOCTYPE html>'

    const sourcePreview = document.createElement('iframe')
    sourcePreview.className = 'je-source-preview'
    sourcePreview.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups',
    )

    sourcePane.append(sourceTextarea, sourcePreview)
    wrapper.appendChild(sourcePane)

    this._editor = createEditor(visualHost, this._pm.getTiptapExtensions(), editorConfig)
    this._pm.initAll(this._editor, editorConfig)
    this._toolbarCleanup = initToolbarEvents(mountEl, this._editor, this._pm, {
      moreController,
    })
    this._mountElement = mountEl
    this._editorArea = wrapper
    this._visualHost = visualHost
    this._documentPreview = documentPreview
    this._sourcePane = sourcePane
    this._sourceTextarea = sourceTextarea
    this._sourcePreview = sourcePreview

    this._sourceTextarea.addEventListener('input', () => {
      this._renderSourcePreview(this._sourceTextarea.value)
    })

    this._editor.on('update', () => {
      if (this._suspendVisualSync || this._sourceMode) return
      this._visualDirtySinceSource = true
      if (!this._sourceDocumentMode) {
        this._sourceDocumentHTML = this._getVisualHTML()
      }
      this._syncTextareaValue()
    })

    if (this._sourceElement instanceof HTMLTextAreaElement) {
      this._syncTextareaValue()
    }

    this._renderSourcePreview(this._sourceDocumentHTML || this._editor.getHTML())
    this._renderDocumentPreview(this._sourceDocumentHTML || this._editor.getHTML())
    this._setSourceMode(false)
    this._bindScrollState()
  }

  _bindScrollState() {
    if (!this._mountElement) return

    const updateScrolledState = () => {
      this._mountElement.classList.toggle('is-scrolled', window.scrollY > 0)
    }

    window.addEventListener('scroll', updateScrolledState, { passive: true })
    window.addEventListener('resize', updateScrolledState)
    updateScrolledState()

    this._scrollCleanup = () => {
      window.removeEventListener('scroll', updateScrolledState)
      window.removeEventListener('resize', updateScrolledState)
    }
  }

  _syncTextareaValue() {
    if (!this._sourceElement || !this._editor) return
    if (!(this._sourceElement instanceof HTMLTextAreaElement)) return
    this._sourceElement.value = this.getHTML()
  }

  _renderSourcePreview(source) {
    if (!this._sourcePreview) return
    this._sourcePreview.srcdoc = isFullDocumentHTML(source) ? source : wrapHTMLDocument(source)
  }

  _renderDocumentPreview(source) {
    if (!this._documentPreview) return
    this._documentPreview.srcdoc = isFullDocumentHTML(source) ? source : wrapHTMLDocument(source)
  }

  _setToolbarSourceState(isSourceMode) {
    if (!this._mountElement) return
    this._mountElement.classList.toggle('is-source-mode', isSourceMode)

    const allowed = new Set(['source', 'fullscreen'])
    const visualLocked = !isSourceMode && this._sourceDocumentMode && !this._visualDirtySinceSource
    this._mountElement
      .querySelectorAll('[data-command], [data-command-toggle]')
      .forEach((button) => {
        const name = button.dataset.command || button.dataset.commandToggle
        const shouldDisable = (isSourceMode || visualLocked) && !allowed.has(name)
        button.classList.toggle('is-disabled', shouldDisable)
        button.disabled = shouldDisable
      })

    this._mountElement.querySelectorAll('[data-command-group]').forEach((group) => {
      const name = group.dataset.commandGroup
      const shouldDisable = (isSourceMode || visualLocked) && !allowed.has(name)
      group.classList.toggle('is-disabled', shouldDisable)
    })
  }

  _setSourceMode(isSourceMode) {
    this._sourceMode = isSourceMode
    const lockedDocumentPreview =
      !isSourceMode && this._sourceDocumentMode && !this._visualDirtySinceSource
    this._visualHost.style.display = isSourceMode ? 'none' : ''
    this._editor.view.dom.style.display = lockedDocumentPreview ? 'none' : ''
    this._documentPreview.classList.toggle('is-active', lockedDocumentPreview)
    this._sourcePane.classList.toggle('is-active', isSourceMode)
    this._setToolbarSourceState(isSourceMode)
    this._syncTextareaValue()
  }

  toggleSourceMode(force) {
    const nextMode = typeof force === 'boolean' ? force : !this._sourceMode

    if (nextMode === this._sourceMode) return this

    if (nextMode) {
      const sourceValue =
        this._sourceDocumentMode && !this._visualDirtySinceSource
          ? this._sourceDocumentHTML || this._getVisualHTML()
          : this._getVisualHTML()
      const displayValue = this._getSourceDisplayHTML(sourceValue)
      this._sourceRawValue = sourceValue
      this._sourceDisplayValue = displayValue
      this._sourceTextarea.value = displayValue
      this._renderSourcePreview(sourceValue)
      this._setSourceMode(true)
      this._sourceTextarea.focus()
      return this
    }

    const nextSource =
      this._sourceTextarea.value === this._sourceDisplayValue
        ? this._sourceRawValue
        : this._sourceTextarea.value
    this._sourceDocumentHTML = nextSource
    this._sourceDocumentMode = isFullDocumentHTML(nextSource)
    this._visualDirtySinceSource = false
    this._renderDocumentPreview(nextSource)
    if (!this._sourceDocumentMode) {
      this._suspendVisualSync = true
      this._editor.commands.setContent(this._normalizeVisualContent(nextSource), false)
      this._suspendVisualSync = false
    }
    this._sourceRawValue = nextSource
    this._sourceDisplayValue = this._getSourceDisplayHTML(nextSource)
    this._setSourceMode(false)
    this.focus()
    return this
  }

  getHTML() {
    if (this._sourceMode) {
      return this._sourceTextarea.value
    }
    if (this._sourceDocumentMode && !this._visualDirtySinceSource && this._sourceDocumentHTML) {
      return this._sourceDocumentHTML
    }
    return this._getVisualHTML()
  }

  getJSON() {
    return this._editor.getJSON()
  }

  getText() {
    return this._editor.getText()
  }

  setContent(content, emitUpdate = false) {
    this._sourceDocumentHTML = content
    this._sourceDocumentMode = isFullDocumentHTML(content)
    this._visualDirtySinceSource = false
    this._sourceRawValue = content || ''
    this._sourceDisplayValue = this._getSourceDisplayHTML(content || '')
    if (this._sourceTextarea) {
      this._sourceTextarea.value = this._sourceMode ? this._sourceDisplayValue : content || ''
      this._renderSourcePreview(content)
    }
    this._renderDocumentPreview(content)
    if (!this._sourceDocumentMode) {
      this._suspendVisualSync = true
      this._editor.commands.setContent(this._normalizeVisualContent(content), emitUpdate)
      this._suspendVisualSync = false
    }
    this._setSourceMode(this._sourceMode)
    this._syncTextareaValue()
    return this
  }

  importHTML(html, emitUpdate = false) {
    return this.setContent(html, emitUpdate)
  }

  isEmpty() {
    return this._editor.isEmpty
  }

  focus() {
    if (this._sourceDocumentMode && !this._visualDirtySinceSource && !this._sourceMode) {
      return this
    }
    this._editor.commands.focus()
    return this
  }

  on(event, handler) {
    this._editor.on(event, handler)
    return this
  }

  off(event, handler) {
    this._editor.off(event, handler)
    return this
  }

  get tiptap() {
    return this._editor
  }

  destroy() {
    const html = this.getHTML()

    this._toolbarCleanup?.()
    this._scrollCleanup?.()
    this._cleanupPrintFrame(this._printFrame)
    this._pm.destroyAll(this._editor)
    this._editor?.destroy()

    if (this._sourceElement instanceof HTMLTextAreaElement) {
      this._sourceElement.value = html
      this._sourceElement.style.display = ''
      this._mountElement?.remove()
    } else {
      this._mountElement.innerHTML = html
      this._mountElement.classList.remove('je-container')
    }

    this._editor = null
    this._mountElement = null
  }
}
