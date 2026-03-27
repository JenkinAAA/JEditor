import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
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
  return LANGUAGE_OPTIONS.find(item => item.value === value)?.label || 'Plain Text'
}

export const CodeBlockExtension = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: 'plaintext',
  HTMLAttributes: {
    class: 'je-code-block',
  },
}).extend({
  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node
      let copyTimer = null

      const wrapper = document.createElement('div')
      wrapper.className = 'je-code-block-wrap'

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
      copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
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
      const contentDOM = document.createElement('div')

      code.appendChild(contentDOM)
      pre.appendChild(code)
      header.append(select, spacer, copyButton)
      wrapper.append(header, pre)

      const render = (targetNode) => {
        const language = targetNode.attrs.language || 'plaintext'
        select.value = language
        wrapper.dataset.language = resolveLanguageLabel(language)
        code.className = `je-code-block language-${language}`
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
        destroy() {
          window.clearTimeout(copyTimer)
        },
      }
    }
  },
})
