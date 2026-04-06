const SUPPORTED_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'raw-html',
  's',
  'span',
  'strike',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
])

const HIGH_FIDELITY_CONTAINER_TAGS = new Set(['div', 'section', 'article', 'table', 'pre'])

const TABLE_WRAPPER_STYLE =
  'overflow-x:auto;overflow-y:hidden;width:100%;max-width:100%;margin:1em 0;padding:0'
const TABLE_BASE_STYLE =
  'width:100%;margin:0;border-collapse:collapse;table-layout:fixed;background:#fff'
const TABLE_CELL_BASE_STYLE =
  'min-width:80px;height:auto;padding:8px 10px;border:1px solid #e5e7eb;vertical-align:top;line-height:1.5;overflow:hidden'
const TABLE_HEADER_BASE_STYLE = `${TABLE_CELL_BASE_STYLE};background:#f8fafc;font-weight:600;color:#374151;border-color:#dbe3ec`

function unwrap(node) {
  const parent = node.parentNode
  if (!parent) return

  while (node.firstChild) {
    parent.insertBefore(node.firstChild, node)
  }

  parent.removeChild(node)
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

function mergeInlineStyles(baseStyle = '', nextStyle = '') {
  const styles = new Map()
  const applyStyleText = (styleText) => {
    String(styleText || '')
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .forEach((declaration) => {
        const separatorIndex = declaration.indexOf(':')
        if (separatorIndex < 0) return

        const propertyName = declaration.slice(0, separatorIndex).trim().toLowerCase()
        const propertyValue = declaration.slice(separatorIndex + 1).trim()
        if (!propertyName || !propertyValue) return

        styles.set(propertyName, propertyValue)
      })
  }

  applyStyleText(baseStyle)
  applyStyleText(nextStyle)

  if (!styles.size) return null
  return `${Array.from(styles.entries())
    .map(([propertyName, propertyValue]) => `${propertyName}: ${propertyValue}`)
    .join('; ')};`
}

function readColumnWidth(col) {
  if (!(col instanceof HTMLElement)) return null

  const widthAttr = col.getAttribute('width')
  const attrWidth = widthAttr ? Number.parseInt(widthAttr, 10) : NaN
  if (Number.isFinite(attrWidth) && attrWidth > 0) {
    return attrWidth
  }

  const styleWidth = col.style.getPropertyValue('width')
  const parsedStyleWidth = styleWidth ? Number.parseInt(styleWidth, 10) : NaN
  if (Number.isFinite(parsedStyleWidth) && parsedStyleWidth > 0) {
    return parsedStyleWidth
  }

  return null
}

function normalizeTableColGroup(doc) {
  doc.querySelectorAll('table').forEach((table) => {
    const colgroup = table.querySelector(':scope > colgroup')
    if (!colgroup) return

    const cols = Array.from(colgroup.querySelectorAll(':scope > col'))
    const firstRow = table.querySelector('tr')
    const cells = firstRow
      ? Array.from(firstRow.children).filter((cell) => /^(td|th)$/i.test(cell.tagName))
      : []

    if (cells.length && cols.length) {
      let colIndex = 0

      cells.forEach((cell) => {
        const span = Math.max(1, Number.parseInt(cell.getAttribute('colspan') || '1', 10) || 1)
        const widthSlice = cols.slice(colIndex, colIndex + span).map((col) => readColumnWidth(col))

        if (
          widthSlice.length === span &&
          widthSlice.every((width) => Number.isFinite(width) && width > 0)
        ) {
          cell.setAttribute('colwidth', widthSlice.join(','))
        }

        colIndex += span
      })
    }

    colgroup.remove()
  })
}

function normalizeManagedTables(doc) {
  doc
    .querySelectorAll('div[data-jeditor-table-wrapper], div.je-table-wrap, div.tableWrapper')
    .forEach((wrapper) => {
      if (!(wrapper instanceof HTMLElement)) return

      wrapper.className = mergeClassNames(wrapper.className, 'je-table-wrap')
      const nextStyle = mergeInlineStyles(TABLE_WRAPPER_STYLE, wrapper.getAttribute('style') || '')
      if (nextStyle) {
        wrapper.setAttribute('style', nextStyle)
      }
    })

  doc.querySelectorAll('table.je-table').forEach((table) => {
    if (!(table instanceof HTMLElement)) return

    table.className = mergeClassNames(table.className, 'je-table')
    const nextTableStyle = mergeInlineStyles(TABLE_BASE_STYLE, table.getAttribute('style') || '')
    if (nextTableStyle) {
      table.setAttribute('style', nextTableStyle)
    }

    table.querySelectorAll('th').forEach((header) => {
      if (!(header instanceof HTMLElement)) return
      const nextStyle = mergeInlineStyles(
        TABLE_HEADER_BASE_STYLE,
        header.getAttribute('style') || '',
      )
      if (nextStyle) {
        header.setAttribute('style', nextStyle)
      }
    })

    table.querySelectorAll('td').forEach((cell) => {
      if (!(cell instanceof HTMLElement)) return
      const nextStyle = mergeInlineStyles(TABLE_CELL_BASE_STYLE, cell.getAttribute('style') || '')
      if (nextStyle) {
        cell.setAttribute('style', nextStyle)
      }
    })
  })
}

function readCodeBlockLanguage(element) {
  if (!(element instanceof HTMLElement)) return 'plaintext'

  const attrLanguage = element.getAttribute('data-code-language')
  if (attrLanguage) return attrLanguage

  const code = element.tagName.toLowerCase() === 'code' ? element : element.querySelector('code')

  if (!(code instanceof HTMLElement)) return 'plaintext'

  const languageClass = Array.from(code.classList).find((className) => /^language-/.test(className))
  return languageClass ? languageClass.replace('language-', '') : 'plaintext'
}

function readCodeBlockText(element) {
  if (!(element instanceof HTMLElement)) return ''

  const code = element.tagName.toLowerCase() === 'code' ? element : element.querySelector('code')

  return (code?.textContent || '').replace(/\r\n?/g, '\n')
}

function createNormalizedCodeBlock(doc, language, text) {
  const pre = doc.createElement('pre')
  const code = doc.createElement('code')

  pre.setAttribute('data-jeditor-code-block', '')
  pre.setAttribute('data-code-language', language || 'plaintext')
  code.className = `language-${language || 'plaintext'}`
  code.textContent = text || ''
  pre.appendChild(code)

  return pre
}

function normalizeEditorCodeBlocksForVisual(doc) {
  doc.querySelectorAll('div[data-jeditor-code-block]').forEach((wrapper) => {
    if (!(wrapper instanceof HTMLElement)) return

    const language = readCodeBlockLanguage(wrapper)
    const text = readCodeBlockText(wrapper)
    wrapper.replaceWith(createNormalizedCodeBlock(doc, language, text))
  })

  doc.querySelectorAll('div.je-code-block-header').forEach((header) => {
    if (!(header instanceof HTMLElement) || !header.isConnected) return
    if (header.closest('[data-jeditor-code-block]')) return

    const parent = header.parentElement
    if (!parent) return

    const fragments = []
    let cursor = header

    while (cursor && cursor.parentElement === parent) {
      const tagName = cursor.tagName.toLowerCase()
      const isHeader = tagName === 'div' && cursor.classList.contains('je-code-block-header')
      const isPre = tagName === 'pre'

      if (!isHeader && !isPre) break

      fragments.push(cursor)
      cursor = cursor.nextElementSibling
    }

    const codeBlocks = fragments.filter((node) => node.tagName.toLowerCase() === 'pre')
    if (!codeBlocks.length) return

    const selected =
      [...codeBlocks].reverse().find((node) => readCodeBlockText(node).trim()) ||
      codeBlocks[codeBlocks.length - 1]
    const language = readCodeBlockLanguage(selected)
    const text = readCodeBlockText(selected)
    const normalized = createNormalizedCodeBlock(doc, language, text)

    fragments[0].replaceWith(normalized)
    fragments.slice(1).forEach((node) => node.remove())
  })
}

function cleanupEditorArtifacts(doc, options = {}) {
  const { normalizeForVisual = false } = options

  doc
    .querySelectorAll(
      '.je-table-move-handle, .je-table-resize-handle, .je-table-col-handle, .je-table-row-handle, .je-table-add-control, .je-table-overlay',
    )
    .forEach((node) => {
      node.remove()
    })

  if (normalizeForVisual) {
    doc
      .querySelectorAll('div.tableWrapper, div.je-table-wrap, div[data-jeditor-table-wrapper]')
      .forEach((node) => {
        const hasOnlyTableContent = Array.from(node.childNodes).every((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            return !child.textContent.trim()
          }

          if (child.nodeType !== Node.ELEMENT_NODE) return false

          return child.tagName.toLowerCase() === 'table'
        })

        if (hasOnlyTableContent) {
          unwrap(node)
        }
      })

    normalizeTableColGroup(doc)
  }
}

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

function isOpeningTag(token) {
  return /^<([a-zA-Z][^\s/>]*)[^>]*>$/.test(token)
}

function isClosingTag(token) {
  return /^<\/[a-zA-Z][^>]*>$/.test(token)
}

function isSelfClosingTag(token) {
  if (/^<!/.test(token)) return true
  const match = token.match(/^<([a-zA-Z][^\s/>]*)/)
  if (!match) return false
  return /\/>$/.test(token) || VOID_TAGS.has(match[1].toLowerCase())
}

export function formatHTMLForDisplay(html = '') {
  const normalized = html.trim()
  if (!normalized) return html

  const tokens = normalized.match(/<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?[^>]+>|[^<]+/gi)
  if (!tokens) return html

  let depth = 0
  let result = ''
  let preDepth = 0

  tokens.forEach((token) => {
    const isTag = token.startsWith('<')
    const trimmed = token.trim()

    const closing = isTag && isClosingTag(trimmed)
    const opening = isTag && isOpeningTag(trimmed) && !isSelfClosingTag(trimmed)

    if (preDepth > 0) {
      result += token
      if (opening && /^<pre(\s|>)/i.test(trimmed)) {
        preDepth++
      } else if (closing && /^<\/pre>/i.test(trimmed)) {
        preDepth--
        if (preDepth === 0) {
          depth = Math.max(0, depth - 1)
        }
      }
      return
    }

    if (!trimmed) return

    if (closing) {
      depth = Math.max(0, depth - 1)
    }

    const indent = '  '.repeat(depth)
    if (result.length > 0) result += '\n'
    result += `${indent}${trimmed}`

    if (opening) {
      depth += 1
      if (/^<pre(\s|>)/i.test(trimmed)) {
        preDepth = 1
      }
    }
  })

  return result
}

function encodeRawHTML(rawHTML) {
  return encodeURIComponent(rawHTML)
}

function decodeRawHTML(rawHTML) {
  try {
    return decodeURIComponent(rawHTML)
  } catch {
    return rawHTML
  }
}

function createRawPlaceholder(doc, rawHTML) {
  const placeholder = doc.createElement('raw-html')
  placeholder.setAttribute('data-raw-html', encodeRawHTML(rawHTML))
  return placeholder
}

function isLanguageClass(className = '') {
  return /^language-/.test(className)
}

function isStandardCodeBlock(node) {
  if (!(node instanceof HTMLElement)) return false
  if (node.tagName.toLowerCase() !== 'pre') return false

  const code = node.firstElementChild
  if (!(code instanceof HTMLElement) || code.tagName.toLowerCase() !== 'code') return false

  const preClasses = Array.from(node.classList)
  const codeClasses = Array.from(code.classList)
  const unsupportedPreClass = preClasses.some((className) => !/^hljs(?:-|$)/.test(className))
  const unsupportedCodeClass = codeClasses.some(
    (className) => !isLanguageClass(className) && !/^hljs(?:-|$)/.test(className),
  )
  const hasInlineStyle = Boolean(
    (node.getAttribute('style') || '').trim() || (code.getAttribute('style') || '').trim(),
  )

  return !unsupportedPreClass && !unsupportedCodeClass && !hasInlineStyle
}

function hasMeaningfulClass(element) {
  if (!(element instanceof HTMLElement)) return false

  return Array.from(element.classList).some((className) => {
    if (!className) return false
    return !(
      /^(je-|ProseMirror|tableWrapper$|hljs(?:-|$))/.test(className) || isLanguageClass(className)
    )
  })
}

function hasMeaningfulStyle(element) {
  if (!(element instanceof HTMLElement)) return false
  const style = element.getAttribute('style') || ''
  return style.trim().length > 0
}

function isEditorManagedElement(element) {
  if (!(element instanceof HTMLElement)) return false
  if (element.tagName.toLowerCase() === 'raw-html') return true
  if (element.hasAttribute('data-callout')) return true
  if (element.hasAttribute('data-jeditor-code-block')) return true
  if (element.classList.contains('je-callout')) return true
  if (element.classList.contains('je-table')) return true
  if (element.classList.contains('tableWrapper')) return true
  if (element.classList.contains('ProseMirror')) return true

  return Array.from(element.classList).some((className) => /^(je-|hljs(?:-|$))/.test(className))
}

function countStyledDescendants(node) {
  if (!(node instanceof Element)) return 0

  let count = 0
  node.querySelectorAll('*').forEach((element) => {
    if (!(element instanceof HTMLElement)) return
    if (isEditorManagedElement(element)) return
    if (hasMeaningfulStyle(element) || hasMeaningfulClass(element)) {
      count += 1
    }
  })
  return count
}

function shouldPreserveEntireFragment(doc) {
  const body = doc.body
  if (!body) return false

  if (
    body.querySelector(
      ':scope > style, :scope > script, :scope > link[rel="stylesheet"], :scope > meta',
    )
  ) {
    return true
  }

  if (body.children.length === 1 && shouldPreserveAsHighFidelity(body.firstElementChild)) {
    return true
  }

  return false
}

function shouldPreserveAsHighFidelity(node) {
  if (!(node instanceof HTMLElement)) return false
  if (isEditorManagedElement(node)) return false

  const tagName = node.tagName.toLowerCase()
  if (!HIGH_FIDELITY_CONTAINER_TAGS.has(tagName)) return false

  const styledNodeCount = countStyledDescendants(node)
  const hasEmbeddedAssets = Boolean(
    node.querySelector('style, link[rel="stylesheet"], meta, svg, canvas'),
  )
  const hasMeaningfulPresentation = hasMeaningfulStyle(node) || hasMeaningfulClass(node)

  if (tagName === 'pre') {
    return !isStandardCodeBlock(node) && (hasMeaningfulPresentation || styledNodeCount > 0)
  }

  if (tagName === 'table') {
    return (
      !node.classList.contains('je-table') &&
      (hasMeaningfulPresentation || styledNodeCount >= 2 || hasEmbeddedAssets)
    )
  }

  return hasEmbeddedAssets || (hasMeaningfulPresentation && styledNodeCount >= 3)
}

function isSupportedElement(node) {
  return SUPPORTED_TAGS.has(node.tagName.toLowerCase())
}

function walkAndPreserve(root) {
  Array.from(root.childNodes).forEach((child) => {
    if (child.nodeType !== Node.ELEMENT_NODE) return

    if (shouldPreserveAsHighFidelity(child)) {
      child.replaceWith(createRawPlaceholder(root.ownerDocument, child.outerHTML))
      return
    }

    if (!isSupportedElement(child)) {
      child.replaceWith(createRawPlaceholder(root.ownerDocument, child.outerHTML))
      return
    }

    if (child.tagName.toLowerCase() === 'raw-html') return
    walkAndPreserve(child)
  })
}

export function preprocessHTML(html = '') {
  if (!html || typeof DOMParser === 'undefined') return html

  const doc = new DOMParser().parseFromString(html, 'text/html')
  cleanupEditorArtifacts(doc, { normalizeForVisual: true })
  normalizeEditorCodeBlocksForVisual(doc)
  if (shouldPreserveEntireFragment(doc)) {
    return createRawPlaceholder(doc, doc.body.innerHTML).outerHTML
  }
  walkAndPreserve(doc.body)
  return doc.body.innerHTML
}

export function restoreRawHTML(html = '') {
  if (!html || typeof DOMParser === 'undefined') return html

  const doc = new DOMParser().parseFromString(html, 'text/html')
  cleanupEditorArtifacts(doc)
  doc.querySelectorAll('raw-html[data-raw-html]').forEach((node) => {
    const raw = node.getAttribute('data-raw-html')
    if (!raw) return

    const fragment = doc.createRange().createContextualFragment(decodeRawHTML(raw))
    node.replaceWith(fragment)
  })

  cleanupEditorArtifacts(doc)
  normalizeManagedTables(doc)
  return doc.body.innerHTML
}
