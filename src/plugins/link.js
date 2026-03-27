import Link from '@tiptap/extension-link'
import { openLinkModal } from './shared/modal.js'
import { ICONS } from './shared/icon-set.js'

let activePopover = null
let hideTimer = null
let cleanup = null

function normalizeHref(value) {
    if (!value) return null
    const trimmed = value.trim()
    if (!trimmed) return null
    if (/^(https?:|mailto:|tel:|\/)/i.test(trimmed)) return trimmed
    return `https://${trimmed}`
}

function closeLinkPopover() {
    if (hideTimer) {
        window.clearTimeout(hideTimer)
        hideTimer = null
    }
    if (activePopover) {
        activePopover.remove()
        activePopover = null
    }
}

function scheduleClose() {
    if (hideTimer) window.clearTimeout(hideTimer)
    hideTimer = window.setTimeout(() => closeLinkPopover(), 120)
}

function focusLinkAtDOM(editor, anchor) {
    try {
        const pos = editor.view.posAtDOM(anchor, 0)
        editor.chain().focus().setTextSelection(Math.max(1, pos + 1)).extendMarkRange('link').run()
    } catch {
        editor.commands.focus()
    }
}

function openLinkPopover(editor, anchor) {
    closeLinkPopover()

    const href = anchor.getAttribute('href')
    if (!href) return

    const popover = document.createElement('div')
    popover.className = 'je-link-popover'

    const main = document.createElement('a')
    main.className = 'je-link-popover__main'
    main.href = href
    main.target = '_blank'
    main.rel = 'noopener noreferrer'
    main.innerHTML = `${ICONS.link}<span>${href}</span>`

    const actions = document.createElement('div')
    actions.className = 'je-link-popover__actions'

    const edit = document.createElement('button')
    edit.type = 'button'
    edit.className = 'je-link-popover__action'
    edit.innerHTML = ICONS.clearFormat.replace('width="24" height="24"', 'width="16" height="16"')
    edit.title = '修改链接'
    edit.addEventListener('click', () => {
        focusLinkAtDOM(editor, anchor)
        openLinkEditor(editor)
        closeLinkPopover()
    })

    const unlink = document.createElement('button')
    unlink.type = 'button'
    unlink.className = 'je-link-popover__action'
    unlink.innerHTML = ICONS.linkOff.replace('width="24" height="24"', 'width="16" height="16"')
    unlink.title = '取消链接'
    unlink.addEventListener('click', () => {
        focusLinkAtDOM(editor, anchor)
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
        closeLinkPopover()
    })

    actions.append(edit, unlink)
    popover.append(main, actions)
    popover.addEventListener('mouseenter', () => {
        if (hideTimer) window.clearTimeout(hideTimer)
    })
    popover.addEventListener('mouseleave', scheduleClose)

    document.body.appendChild(popover)
    const rect = anchor.getBoundingClientRect()
    popover.style.top = `${rect.bottom + window.scrollY + 8}px`
    popover.style.left = `${Math.max(12, rect.left + window.scrollX)}px`
    activePopover = popover
}

export function openLinkEditor(editor) {
    const currentHref = editor.getAttributes('link').href || ''
    const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ')

    openLinkModal({
        text: selectedText || '',
        href: currentHref,
    }).then((result) => {
        if (!result) return

        const href = normalizeHref(result.href)
        const chain = editor.chain().focus()

        if (!href) {
            chain.extendMarkRange('link').unsetLink().run()
            return
        }

        const text = result.text || href
        const { from, to, empty } = editor.state.selection

        if (empty) {
            chain.insertContent(text).setTextSelection({ from, to: from + text.length })
        } else if (selectedText !== text) {
            chain.insertContentAt({ from, to }, text).setTextSelection({ from, to: from + text.length })
        } else {
            chain.setTextSelection({ from, to })
        }

        chain.extendMarkRange('link').setLink({ href }).run()
    })
}

function bindLinkInteractions(editor) {
    const root = editor.view.dom

    const onClick = (event) => {
        const anchor = event.target.closest('a[href]')
        if (!anchor || !root.contains(anchor)) return

        if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            window.open(anchor.href, anchor.target || '_blank', 'noopener')
            return
        }

        event.preventDefault()
    }

    const onMouseOver = (event) => {
        const anchor = event.target.closest('a[href]')
        if (!anchor || !root.contains(anchor)) return
        openLinkPopover(editor, anchor)
    }

    const onMouseOut = (event) => {
        const anchor = event.target.closest('a[href]')
        if (!anchor || !root.contains(anchor)) return
        scheduleClose()
    }

    const onDocumentDown = (event) => {
        if (activePopover?.contains(event.target)) return
        closeLinkPopover()
    }

    root.addEventListener('click', onClick)
    root.addEventListener('mouseover', onMouseOver)
    root.addEventListener('mouseout', onMouseOut)
    document.addEventListener('mousedown', onDocumentDown, true)

    return () => {
        root.removeEventListener('click', onClick)
        root.removeEventListener('mouseover', onMouseOver)
        root.removeEventListener('mouseout', onMouseOut)
        document.removeEventListener('mousedown', onDocumentDown, true)
        closeLinkPopover()
    }
}

export default {
    name: 'link',
    toolbar: {
        icon: ICONS.link,
        title: '链接',
    },
    tiptapExtension: Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
    }),
    command: (editor) => openLinkEditor(editor),
    isActive: (editor) => editor.isActive('link'),
    init(editor) {
        cleanup = bindLinkInteractions(editor)
    },
    destroy() {
        cleanup?.()
        cleanup = null
    },
}
