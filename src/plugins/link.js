import Link from '@tiptap/extension-link'
import { openLinkModal } from './shared/modal.js'
import { ICONS } from './shared/icon-set.js'

const stateMap = new WeakMap()
const cleanupMap = new WeakMap()

function getState(editor) {
  let state = stateMap.get(editor)
  if (!state) {
    state = {
      activePopover: null,
      hideTimer: null,
    }
    stateMap.set(editor, state)
  }
  return state
}

function normalizeHref(value) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^(https?:|mailto:|tel:|\/)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function closeLinkPopover(editor) {
  const state = getState(editor)

  if (state.hideTimer) {
    window.clearTimeout(state.hideTimer)
    state.hideTimer = null
  }

  if (state.activePopover) {
    state.activePopover.remove()
    state.activePopover = null
  }
}

function scheduleClose(editor) {
  const state = getState(editor)
  if (state.hideTimer) window.clearTimeout(state.hideTimer)
  state.hideTimer = window.setTimeout(() => closeLinkPopover(editor), 120)
}

function focusLinkAtDOM(editor, anchor) {
  try {
    const pos = editor.view.posAtDOM(anchor, 0)
    editor
      .chain()
      .focus()
      .setTextSelection(Math.max(1, pos + 1))
      .extendMarkRange('link')
      .run()
  } catch {
    editor.commands.focus()
  }
}

function openLinkEditor(editor) {
  const currentHref = editor.getAttributes('link').href || ''
  const selectedText = editor.state.doc.textBetween(
    editor.state.selection.from,
    editor.state.selection.to,
    ' ',
  )

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

function openLinkPopover(editor, anchor) {
  const state = getState(editor)
  closeLinkPopover(editor)

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
  edit.title = 'Edit link'
  edit.addEventListener('click', () => {
    focusLinkAtDOM(editor, anchor)
    openLinkEditor(editor)
    closeLinkPopover(editor)
  })

  const unlink = document.createElement('button')
  unlink.type = 'button'
  unlink.className = 'je-link-popover__action'
  unlink.innerHTML = ICONS.linkOff.replace('width="24" height="24"', 'width="16" height="16"')
  unlink.title = 'Remove link'
  unlink.addEventListener('click', () => {
    focusLinkAtDOM(editor, anchor)
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    closeLinkPopover(editor)
  })

  actions.append(edit, unlink)
  popover.append(main, actions)
  popover.addEventListener('mouseenter', () => {
    const nextState = getState(editor)
    if (nextState.hideTimer) window.clearTimeout(nextState.hideTimer)
  })
  popover.addEventListener('mouseleave', () => scheduleClose(editor))

  document.body.appendChild(popover)
  const rect = anchor.getBoundingClientRect()
  popover.style.top = `${rect.bottom + window.scrollY + 8}px`
  popover.style.left = `${Math.max(12, rect.left + window.scrollX)}px`
  state.activePopover = popover
}

function bindLinkInteractions(editor) {
  const root = editor.view.dom

  const onMouseDown = (event) => {
    const anchor = event.target.closest('a[href]')
    if (!anchor || !root.contains(anchor)) return

    if (event.ctrlKey || event.metaKey) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
  }

  const onClick = (event) => {
    const anchor = event.target.closest('a[href]')
    if (!anchor || !root.contains(anchor)) return

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      event.stopPropagation()
      window.open(anchor.href, '_blank', 'noopener,noreferrer')
      return
    }

    event.preventDefault()
    event.stopPropagation()
    focusLinkAtDOM(editor, anchor)
  }

  const onMouseOver = (event) => {
    const anchor = event.target.closest('a[href]')
    if (!anchor || !root.contains(anchor)) return
    openLinkPopover(editor, anchor)
  }

  const onMouseOut = (event) => {
    const anchor = event.target.closest('a[href]')
    if (!anchor || !root.contains(anchor)) return
    scheduleClose(editor)
  }

  const onDocumentDown = (event) => {
    const state = getState(editor)
    if (state.activePopover?.contains(event.target)) return
    closeLinkPopover(editor)
  }

  root.addEventListener('mousedown', onMouseDown, true)
  root.addEventListener('click', onClick, true)
  root.addEventListener('mouseover', onMouseOver)
  root.addEventListener('mouseout', onMouseOut)
  document.addEventListener('mousedown', onDocumentDown, true)

  return () => {
    root.removeEventListener('mousedown', onMouseDown, true)
    root.removeEventListener('click', onClick, true)
    root.removeEventListener('mouseover', onMouseOver)
    root.removeEventListener('mouseout', onMouseOut)
    document.removeEventListener('mousedown', onDocumentDown, true)
    closeLinkPopover(editor)
    stateMap.delete(editor)
  }
}

export { openLinkEditor }

export default {
  name: 'link',
  toolbar: {
    icon: ICONS.link,
    title: 'Link',
  },
  tiptapExtension: Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: 'https',
    HTMLAttributes: {
      target: null,
      class: 'je-editor-link',
    },
  }),
  command: (editor) => openLinkEditor(editor),
  isActive: (editor) => editor.isActive('link'),
  init(editor) {
    cleanupMap.set(editor, bindLinkInteractions(editor))
  },
  destroy(editor) {
    cleanupMap.get(editor)?.()
    cleanupMap.delete(editor)
  },
}
