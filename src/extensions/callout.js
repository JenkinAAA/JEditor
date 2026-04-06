import { Node, mergeAttributes } from '@tiptap/core'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'
import {
  CALLOUT_TYPES,
  getCalloutIconMarkup,
  getCalloutIconSpec,
  getCalloutTypeConfig,
} from '../plugins/shared/style-presets.js'
const DRAG_HANDLE_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="9" cy="12" r="1"/>
        <circle cx="9" cy="5" r="1"/>
        <circle cx="9" cy="19" r="1"/>
        <circle cx="15" cy="12" r="1"/>
        <circle cx="15" cy="5" r="1"/>
        <circle cx="15" cy="19" r="1"/>
    </svg>
`

function getCalloutType(value) {
  return getCalloutTypeConfig(value)
}

function combineStyles(...styles) {
  return styles.filter(Boolean).join(';')
}

function hexToRGBA(color, alpha = 1) {
  if (typeof color !== 'string') return color
  const normalized = color.trim().replace('#', '')
  const hex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized

  if (!/^[\da-fA-F]{6}$/.test(hex)) return color

  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function getCalloutStyles(attrs = {}, shouldShowHeader = true) {
  const textColor = attrs.textColor || CALLOUT_TYPES[0].textColor
  const backgroundColor = attrs.backgroundColor || CALLOUT_TYPES[0].backgroundColor

  return {
    card: combineStyles(
      `--je-callout-color:${textColor}`,
      `--je-callout-bg:${backgroundColor}`,
      'margin:12px 0',
      'width:100%',
      'padding:14px 16px 16px',
      'border-radius:14px',
      `background:${backgroundColor}`,
      `color:${textColor}`,
      `border:1px solid ${hexToRGBA(textColor, 0.12)}`,
      'box-sizing:border-box',
    ),
    header: shouldShowHeader
      ? combineStyles(
          'display:flex',
          'align-items:center',
          'gap:8px',
          'margin-bottom:12px',
          'user-select:none',
        )
      : 'display:none',
    icon: combineStyles(
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      'width:18px',
      'height:18px',
      'flex-shrink:0',
    ),
    title: combineStyles('font-size:14px', 'font-weight:700', 'color:inherit'),
    body: combineStyles('min-height:24px', 'color:inherit'),
  }
}

function buildTypeAttrs(value) {
  const type = getCalloutType(value)
  return {
    type: type.value,
    title: type.label,
    textColor: type.textColor,
    backgroundColor: type.backgroundColor,
  }
}

function readStyleVar(element, name) {
  return element.style.getPropertyValue(name)?.trim() || null
}

function readCalloutTitle(element) {
  return element.querySelector('.je-callout-title')?.textContent?.trim() || null
}

function findCalloutContext($pos) {
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    if ($pos.node(depth).type.name === 'callout') {
      return {
        depth,
        node: $pos.node(depth),
        pos: $pos.before(depth),
      }
    }
  }

  return null
}

function exitCallout(editor) {
  const { state, view } = editor
  const { empty, $from } = state.selection
  if (!empty) return false

  const context = findCalloutContext($from)
  if (!context) return false
  if ($from.parent.type.name !== 'paragraph' || $from.parent.content.size > 0) return false
  if ($from.depth !== context.depth + 1) return false

  const paragraph = state.schema.nodes.paragraph.create()
  const currentParagraphPos = $from.before($from.depth)
  const currentParagraphEnd = $from.after($from.depth)
  const calloutPos = context.pos
  const calloutEnd = calloutPos + context.node.nodeSize
  const blockIndex = $from.index(context.depth)
  const blockCount = context.node.childCount
  let tr = state.tr
  let selectionPos

  if (blockCount === 1) {
    tr = tr.replaceWith(calloutPos, calloutEnd, paragraph)
    selectionPos = calloutPos + 1
  } else if (blockIndex === 0) {
    tr = tr.delete(currentParagraphPos, currentParagraphEnd)
    const insertPos = tr.mapping.map(calloutPos, -1)
    tr = tr.insert(insertPos, paragraph)
    selectionPos = insertPos + 1
  } else {
    tr = tr.delete(currentParagraphPos, currentParagraphEnd)
    const insertPos = tr.mapping.map(calloutEnd, 1)
    tr = tr.insert(insertPos, paragraph)
    selectionPos = insertPos + 1
  }

  tr.setSelection(TextSelection.create(tr.doc, selectionPos))
  view.dispatch(tr.scrollIntoView())
  return true
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  draggable: true,
  isolating: true,
  defining: true,

  addAttributes() {
    return {
      type: {
        default: CALLOUT_TYPES[0].value,
        parseHTML: (element) => element.getAttribute('data-callout-type') || CALLOUT_TYPES[0].value,
        renderHTML: (attributes) => ({ 'data-callout-type': attributes.type }),
      },
      title: {
        default: CALLOUT_TYPES[0].label,
        parseHTML: (element) =>
          element.getAttribute('data-callout-title') ||
          readCalloutTitle(element) ||
          CALLOUT_TYPES[0].label,
        renderHTML: (attributes) => ({ 'data-callout-title': attributes.title }),
      },
      textColor: {
        default: CALLOUT_TYPES[0].textColor,
        parseHTML: (element) =>
          element.getAttribute('data-callout-color') ||
          readStyleVar(element, '--je-callout-color') ||
          CALLOUT_TYPES[0].textColor,
        renderHTML: (attributes) => ({ 'data-callout-color': attributes.textColor }),
      },
      backgroundColor: {
        default: CALLOUT_TYPES[0].backgroundColor,
        parseHTML: (element) =>
          element.getAttribute('data-callout-bg') ||
          readStyleVar(element, '--je-callout-bg') ||
          CALLOUT_TYPES[0].backgroundColor,
        renderHTML: (attributes) => ({ 'data-callout-bg': attributes.backgroundColor }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
        contentElement: '.je-callout-body',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = node?.attrs || {}
    const type = getCalloutType(attrs.type)
    const iconSpec = getCalloutIconSpec(type)
    const shouldShowHeader = type.value !== 'default'
    const styles = getCalloutStyles(attrs, shouldShowHeader)

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-callout': '',
        class: 'je-callout',
        style: combineStyles(styles.card, HTMLAttributes.style),
      }),
      ...(shouldShowHeader
        ? [
            [
              'div',
              { class: 'je-callout-header', contenteditable: 'false', style: styles.header },
              ...(iconSpec
                ? [
                    [
                      'span',
                      { class: 'je-callout-icon', 'aria-hidden': 'true', style: styles.icon },
                      iconSpec,
                    ],
                  ]
                : []),
              ['span', { class: 'je-callout-title', style: styles.title }, attrs.title],
            ],
          ]
        : []),
      ['div', { class: 'je-callout-body', style: styles.body }, 0],
    ]
  },

  addCommands() {
    return {
      insertCallout:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              ...buildTypeAttrs(attrs.type || CALLOUT_TYPES[0].value),
              ...attrs,
            },
            content: [{ type: 'paragraph' }],
          }),
      setCalloutType:
        (type) =>
        ({ state, dispatch }) => {
          const context = findCalloutContext(state.selection.$from)
          if (!context) return false

          const nextAttrs = {
            ...context.node.attrs,
            ...buildTypeAttrs(type),
          }

          if (dispatch) {
            dispatch(state.tr.setNodeMarkup(context.pos, undefined, nextAttrs))
          }

          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => exitCallout(this.editor),
    }
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const wrapper = document.createElement('div')
      wrapper.className = 'je-callout-node'
      let delegateDragToEditor = false
      let popover = null

      const dragHandle = document.createElement('button')
      dragHandle.type = 'button'
      dragHandle.className = 'je-callout-drag-handle'
      dragHandle.tabIndex = -1
      dragHandle.innerHTML = DRAG_HANDLE_ICON

      const card = document.createElement('div')
      card.className = 'je-callout'
      card.dataset.callout = ''

      const header = document.createElement('div')
      header.className = 'je-callout-header'
      header.contentEditable = 'false'

      const titleButton = document.createElement('button')
      titleButton.type = 'button'
      titleButton.className = 'je-callout-title-btn'

      const icon = document.createElement('span')
      icon.className = 'je-callout-icon'
      icon.setAttribute('aria-hidden', 'true')

      const title = document.createElement('span')
      title.className = 'je-callout-title'

      titleButton.append(icon, title)
      header.appendChild(titleButton)

      const contentDOM = document.createElement('div')
      contentDOM.className = 'je-callout-body'

      card.append(header, contentDOM)
      wrapper.append(dragHandle, card)

      const selectNode = () => {
        const pos = getPos()
        if (typeof pos !== 'number') return

        const { state, view } = editor
        view.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)))
        view.focus()
      }

      const render = (targetNode) => {
        wrapper.style.setProperty('--je-callout-color', targetNode.attrs.textColor)
        wrapper.style.setProperty('--je-callout-bg', targetNode.attrs.backgroundColor)
        const type = getCalloutType(targetNode.attrs.type)
        const shouldShowHeader = type.value !== 'default'
        title.textContent = targetNode.attrs.title
        const iconMarkup = getCalloutIconMarkup(type)
        icon.innerHTML = iconMarkup
        icon.classList.toggle('is-hidden', !iconMarkup)
        header.classList.toggle('is-hidden', !shouldShowHeader)
      }

      const resetDragDelegation = () => {
        delegateDragToEditor = false
        document.removeEventListener('dragend', resetDragDelegation, false)
        document.removeEventListener('mouseup', resetDragDelegation, false)
      }

      const closePopover = () => {
        if (!popover) return
        popover.remove()
        popover = null
        document.removeEventListener('mousedown', handleOutsideClick, true)
        window.removeEventListener('scroll', closePopover, true)
        window.removeEventListener('resize', closePopover, true)
      }

      const handleOutsideClick = (event) => {
        if (popover?.contains(event.target) || titleButton.contains(event.target)) return
        closePopover()
      }

      const openPopover = () => {
        closePopover()
        popover = document.createElement('div')
        popover.className = 'je-popover je-callout-type-popover'

        CALLOUT_TYPES.forEach((typeDef) => {
          const item = document.createElement('button')
          item.type = 'button'
          item.className = 'je-callout-item'

          const badge = document.createElement('span')
          badge.className = 'je-callout-badge'
          badge.innerHTML =
            getCalloutIconMarkup(typeDef) || '<span class="je-callout-badge-text">D</span>'
          badge.style.color = typeDef.textColor
          badge.style.background = typeDef.backgroundColor

          const content = document.createElement('span')
          content.className = 'je-callout-content'

          const label = document.createElement('span')
          label.className = 'je-callout-label'
          label.textContent = typeDef.label

          const short = document.createElement('span')
          short.className = 'je-callout-short'
          short.textContent = typeDef.shortLabel

          content.append(label, short)
          item.append(badge, content)
          item.addEventListener('click', () => {
            editor.chain().focus().setCalloutType(typeDef.value).run()
            closePopover()
          })
          popover.appendChild(item)
        })

        document.body.appendChild(popover)
        const rect = titleButton.getBoundingClientRect()
        popover.style.top = `${rect.bottom + window.scrollY + 8}px`
        popover.style.left = `${Math.max(12, rect.left + window.scrollX)}px`

        document.addEventListener('mousedown', handleOutsideClick, true)
        window.addEventListener('scroll', closePopover, true)
        window.addEventListener('resize', closePopover, true)
      }

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

      titleButton.addEventListener('mousedown', (event) => {
        event.preventDefault()
        event.stopPropagation()
      })

      titleButton.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        openPopover()
      })

      dragHandle.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        selectNode()
      })

      render(node)
      return {
        dom: wrapper,
        contentDOM,
        update(updatedNode) {
          if (updatedNode.type.name !== 'callout') return false
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
          const fromTitleButton = titleButton.contains(event.target)

          if (fromHandle && event.type === 'mousedown') {
            return false
          }

          if (
            delegateDragToEditor &&
            /dragstart|dragover|dragenter|drop|dragend/.test(event.type)
          ) {
            return false
          }

          if (fromHandle) {
            return true
          }

          if (fromTitleButton) {
            return true
          }

          return false
        },
        destroy() {
          closePopover()
          resetDragDelegation()
        },
      }
    }
  },
})
