import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { NodeSelection } from '@tiptap/pm/state'
import { createLowlight } from 'lowlight'

import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import python from 'highlight.js/lib/languages/python'
import plaintext from 'highlight.js/lib/languages/plaintext'
import java from 'highlight.js/lib/languages/java'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'
import php from 'highlight.js/lib/languages/php'
import dockerfile from 'highlight.js/lib/languages/dockerfile'

import 'highlight.js/styles/github.css'
import { BLOCK_DRAG_HANDLE_ICON } from './shared/block-drag-handle.js'

const lowlight = createLowlight()

lowlight.register({
  xml,
  css,
  javascript,
  typescript,
  json,
  bash,
  python,
  plaintext,
  java,
  c,
  cpp,
  go,
  rust,
  sql,
  yaml,
  markdown,
  php,
  dockerfile,
})

const LANGUAGE_OPTIONS = [
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'HTML', value: 'xml' },
  { label: 'CSS', value: 'css' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JSON', value: 'json' },
  { label: 'Bash', value: 'bash' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'SQL', value: 'sql' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'PHP', value: 'php' },
  { label: 'Dockerfile', value: 'dockerfile' },
]

function resolveLanguageLabel(value) {
  return LANGUAGE_OPTIONS.find((item) => item.value === value)?.label || 'Plain Text'
}

const WRAPPER_BASE_STYLE = [
  'margin:1em 0',
  'border-radius:12px',
  'border:1px solid #d0d7de',
  'background:#ffffff',
  'overflow:hidden',
  'position:relative',
].join(';')

const HEADER_BASE_STYLE = [
  'display:flex',
  'align-items:center',
  'min-height:34px',
  'padding:0 12px',
  'background:#f6f8fa',
  'color:#6b7280',
  'font-size:12px',
  'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"PingFang SC","Microsoft YaHei",sans-serif',
  'border-bottom:1px solid #e5e7eb',
  'box-sizing:border-box',
].join(';')

const LANGUAGE_LABEL_STYLE = [
  'display:inline-flex',
  'align-items:center',
  'min-height:34px',
  'font-size:12px',
  'font-weight:500',
  'color:#6b7280',
].join(';')

const PRE_BASE_STYLE = [
  'margin:0',
  'padding:12px 16px 16px',
  'background:transparent',
  'overflow-x:auto',
  'box-sizing:border-box',
].join(';')

const CODE_BASE_STYLE = [
  'display:block',
  'padding:0',
  'border:none',
  'background:transparent',
  'color:#24292e',
  'font-weight:400',
  'font-family:"JetBrains Mono","SFMono-Regular",Consolas,monospace',
  'font-size:13px',
  'line-height:1.6',
  'white-space:pre',
  'box-shadow:none',
].join(';')

function combineStyles(...styles) {
  return styles.filter(Boolean).join(';')
}

function readCodeElement(element) {
  if (!(element instanceof HTMLElement)) return null

  if (element.tagName.toLowerCase() === 'code') {
    return element
  }

  if (element.tagName.toLowerCase() === 'pre') {
    const code = element.querySelector(':scope > code')
    return code instanceof HTMLElement ? code : null
  }

  const code = element.querySelector('pre > code')
  return code instanceof HTMLElement ? code : null
}

function readLanguageFromElement(element) {
  if (!(element instanceof HTMLElement)) return null

  const attrLanguage = element.getAttribute('data-code-language')
  if (attrLanguage) return attrLanguage

  const code = readCodeElement(element)
  if (!code) return null

  const languageClass = Array.from(code.classList).find((className) =>
    className.startsWith('language-'),
  )
  return languageClass ? languageClass.replace('language-', '') : null
}

function mergeClassNames(...classNames) {
  const merged = []

  classNames
    .flatMap((value) => String(value || '').split(/\s+/))
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      if (!merged.includes(value)) {
        merged.push(value)
      }
    })

  return merged.join(' ') || null
}

const HIGHLIGHT_STYLE_RULES = [
  {
    any: ['hljs-comment', 'hljs-quote'],
    style: 'color:#6a737d;font-style:italic',
  },
  {
    any: [
      'hljs-keyword',
      'hljs-doctag',
      'hljs-selector-tag',
      'hljs-literal',
      'hljs-type',
      'hljs-name',
      'hljs-tag',
    ],
    style: 'color:#d73a49',
  },
  {
    any: ['hljs-string', 'hljs-attr', 'hljs-template-tag', 'hljs-regexp', 'hljs-link'],
    style: 'color:#032f62',
  },
  {
    any: [
      'hljs-number',
      'hljs-built_in',
      'hljs-symbol',
      'hljs-bullet',
      'hljs-meta',
      'hljs-selector-id',
      'hljs-selector-class',
    ],
    style: 'color:#005cc5',
  },
  {
    all: ['hljs-title', 'class_'],
    style: 'color:#005cc5',
  },
  {
    all: ['hljs-title', 'function_'],
    style: 'color:#6f42c1',
  },
  {
    any: ['hljs-function', 'hljs-title'],
    style: 'color:#6f42c1',
  },
  {
    any: [
      'hljs-params',
      'hljs-property',
      'hljs-variable',
      'hljs-operator',
      'hljs-punctuation',
      'hljs-subst',
    ],
    style: 'color:#24292e',
  },
]

function getHighlightInlineStyle(classNames = []) {
  const classSet = new Set(classNames)
  const styles = HIGHLIGHT_STYLE_RULES.filter((rule) => {
    if (Array.isArray(rule.all) && !rule.all.every((className) => classSet.has(className))) {
      return false
    }

    if (Array.isArray(rule.any)) {
      return rule.any.some((className) => classSet.has(className))
    }

    return true
  }).map((rule) => rule.style)

  return styles.length ? styles.join(';') : null
}

function renderHighlightNode(node) {
  if (!node) return ''

  if (node.type === 'text') {
    return node.value || ''
  }

  if (node.type !== 'element') {
    return ''
  }

  const tagName = node.tagName || 'span'
  const classNames = Array.isArray(node.properties?.className)
    ? node.properties.className.filter(Boolean)
    : []
  const attrs = {}
  const className = classNames.join(' ')
  const inlineStyle = getHighlightInlineStyle(classNames)

  if (className) {
    attrs.class = className
  }

  if (inlineStyle) {
    attrs.style = inlineStyle
  }

  return [
    tagName,
    attrs,
    ...(node.children || [])
      .map((child) => renderHighlightNode(child))
      .filter((child) => child !== ''),
  ]
}

function renderHighlightedCode(language, text) {
  if (!text) return ['']

  try {
    const tree = lowlight.highlight(language || 'plaintext', text)
    const children = (tree.children || [])
      .map((child) => renderHighlightNode(child))
      .filter((child) => child !== '')
    return children.length ? children : [text]
  } catch {
    return [text]
  }
}

export const CodeBlockExtension = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: 'plaintext',
  HTMLAttributes: {},
}).extend({
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (element) => readLanguageFromElement(element) || this.options.defaultLanguage,
        rendered: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre[data-jeditor-code-block]',
        preserveWhitespace: 'full',
      },
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (element) => (element.hasAttribute('data-jeditor-code-block') ? false : null),
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const language = node.attrs.language || this.options.defaultLanguage || 'plaintext'
    const languageLabel = resolveLanguageLabel(language)
    const highlightedChildren = renderHighlightedCode(language, node.textContent || '')
    const wrapperAttributes = { ...HTMLAttributes }

    delete wrapperAttributes.class
    delete wrapperAttributes.style

    const wrapperClassName = mergeClassNames('je-code-block-wrap', HTMLAttributes.class)
    const wrapperStyle = combineStyles(WRAPPER_BASE_STYLE, HTMLAttributes.style)

    return [
      'div',
      {
        ...wrapperAttributes,
        'data-jeditor-code-block': '',
        'data-code-language': language,
        class: wrapperClassName,
        style: wrapperStyle,
      },
      [
        'div',
        {
          class: 'je-code-block-header',
          style: HEADER_BASE_STYLE,
          contenteditable: 'false',
        },
        [
          'span',
          {
            class: 'je-code-block-language',
            style: LANGUAGE_LABEL_STYLE,
          },
          languageLabel,
        ],
      ],
      [
        'pre',
        {
          style: PRE_BASE_STYLE,
        },
        [
          'code',
          {
            class: language ? `language-${language}` : null,
            style: CODE_BASE_STYLE,
          },
          ...highlightedChildren,
        ],
      ],
    ]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node
      let copyTimer = null
      let delegateDragToEditor = false

      const wrapper = document.createElement('div')
      wrapper.className = 'je-code-block-node'

      const dragHandle = document.createElement('button')
      dragHandle.type = 'button'
      dragHandle.className = 'je-block-drag-handle je-code-block-drag-handle'
      dragHandle.tabIndex = -1
      dragHandle.innerHTML = BLOCK_DRAG_HANDLE_ICON

      const block = document.createElement('div')
      block.className = 'je-code-block-wrap'

      const header = document.createElement('div')
      header.className = 'je-code-block-header'

      const select = document.createElement('select')
      select.className = 'je-code-block-select'

      const spacer = document.createElement('div')
      spacer.className = 'je-code-block-spacer'

      const copyButton = document.createElement('button')
      copyButton.type = 'button'
      copyButton.className = 'je-code-block-copy'
      copyButton.setAttribute('aria-label', 'Copy code')
      copyButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
      copyButton.addEventListener('mousedown', (event) => event.preventDefault())
      copyButton.addEventListener('click', async () => {
        const text = currentNode.textContent || ''
        try {
          await navigator.clipboard.writeText(text)
          copyButton.classList.add('is-copied')
          copyButton.title = 'Copied'
          window.clearTimeout(copyTimer)
          copyTimer = window.setTimeout(() => {
            copyButton.classList.remove('is-copied')
            copyButton.title = 'Copy code'
          }, 1200)
        } catch (error) {
          console.error('[JEditor] Failed to copy code block', error)
        }
      })

      LANGUAGE_OPTIONS.forEach((item) => {
        const option = document.createElement('option')
        option.value = item.value
        option.textContent = item.label
        select.appendChild(option)
      })

      const pre = document.createElement('pre')
      const code = document.createElement('code')
      const contentDOM = code

      pre.appendChild(code)
      header.append(select, spacer, copyButton)
      block.append(header, pre)
      wrapper.append(dragHandle, block)

      const selectNode = () => {
        const pos = getPos()
        if (typeof pos !== 'number') return false

        const { state, view } = editor
        view.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)))
        view.focus()
        return true
      }

      const resetDragDelegation = () => {
        delegateDragToEditor = false
        document.removeEventListener('dragend', resetDragDelegation, false)
        document.removeEventListener('mouseup', resetDragDelegation, false)
      }

      const handleNativeDragStart = (event) => {
        if (delegateDragToEditor) return
        if (dragHandle.contains(event.target)) return
        event.preventDefault()
        event.stopPropagation()
      }

      wrapper.addEventListener('dragstart', handleNativeDragStart, true)

      const render = (targetNode) => {
        const language = targetNode.attrs.language || 'plaintext'
        select.value = language
        block.dataset.language = resolveLanguageLabel(language)
        code.className = language ? `language-${language}` : ''
      }

      select.addEventListener('change', () => {
        const pos = getPos()
        const { state, view } = editor
        const tr = state.tr.setNodeMarkup(pos, undefined, {
          ...currentNode.attrs,
          language: select.value,
        })
        view.dispatch(tr)
        view.focus()
      })

      dragHandle.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return
        delegateDragToEditor = true
        selectNode()
        document.addEventListener('dragend', resetDragDelegation, false)
        document.addEventListener('mouseup', resetDragDelegation, false)
      })

      dragHandle.addEventListener('dragstart', (event) => {
        if (!delegateDragToEditor) {
          event.preventDefault()
          return
        }

        selectNode()
        wrapper.classList.add('is-dragging')
      })

      dragHandle.addEventListener('dragend', () => {
        wrapper.classList.remove('is-dragging')
        resetDragDelegation()
      })

      dragHandle.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        selectNode()
      })

      render(currentNode)

      return {
        dom: wrapper,
        contentDOM,
        update(updatedNode) {
          if (updatedNode.type.name !== 'codeBlock') return false
          currentNode = updatedNode
          render(updatedNode)
          return true
        },
        selectNode() {
          wrapper.classList.add('ProseMirror-selectednode', 'is-selected')
        },
        deselectNode() {
          wrapper.classList.remove('ProseMirror-selectednode', 'is-selected', 'is-dragging')
          resetDragDelegation()
        },
        stopEvent(event) {
          const fromHandle = dragHandle.contains(event.target)
          const fromSelect = select.contains(event.target)
          const fromCopyButton = copyButton.contains(event.target)

          if (fromHandle && event.type === 'mousedown') {
            return false
          }

          if (
            delegateDragToEditor &&
            /dragstart|dragover|dragenter|drop|dragend/.test(event.type)
          ) {
            return false
          }

          if (fromHandle || fromSelect || fromCopyButton) {
            return true
          }

          return false
        },
        ignoreMutation(mutation) {
          const target = mutation.target
          if (wrapper.contains(target) && !contentDOM.contains(target)) {
            return true
          }

          return false
        },
        destroy() {
          wrapper.removeEventListener('dragstart', handleNativeDragStart, true)
          resetDragDelegation()
          window.clearTimeout(copyTimer)
        },
      }
    }
  },
})
