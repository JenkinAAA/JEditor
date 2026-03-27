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

function unwrap(node) {
    const parent = node.parentNode
    if (!parent) return

    while (node.firstChild) {
        parent.insertBefore(node.firstChild, node)
    }

    parent.removeChild(node)
}

function cleanupEditorArtifacts(doc) {
    doc.querySelectorAll('.je-table-move-handle, .je-table-resize-handle').forEach((node) => {
        node.remove()
    })

    doc.querySelectorAll('div.tableWrapper, div.je-table-wrap').forEach((node) => {
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
}

const VOID_TAGS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
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
    const lines = []

    tokens.forEach((token) => {
        const trimmed = token.trim()
        if (!trimmed) return

        if (isClosingTag(trimmed)) {
            depth = Math.max(0, depth - 1)
        }

        const indent = '  '.repeat(depth)
        if (trimmed.startsWith('<')) {
            lines.push(`${indent}${trimmed}`)
        } else {
            lines.push(`${indent}${trimmed}`)
        }

        if (isOpeningTag(trimmed) && !isSelfClosingTag(trimmed)) {
            depth += 1
        }
    })

    return lines.join('\n')
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

function isSupportedElement(node) {
    return SUPPORTED_TAGS.has(node.tagName.toLowerCase())
}

function walkAndPreserve(root) {
    Array.from(root.childNodes).forEach((child) => {
        if (child.nodeType !== Node.ELEMENT_NODE) return

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
    cleanupEditorArtifacts(doc)
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
    return doc.body.innerHTML
}
