import { Node, mergeAttributes, wrappingInputRule } from '@tiptap/core'
import {
  bindBlockDragHandle,
  BLOCK_DRAG_HANDLE_ICON,
  createNodeSelector,
} from './shared/block-drag-handle.js'

const BLOCKQUOTE_STYLE =
  'margin:0.8em 0;padding:2px 12px 2px 12px;border-left:3px solid #374151;background:#f3f4f6;color:#111827;'

export default Node.create({
  name: 'blockquote',
  group: 'block',
  content: 'block+',
  defining: true,
  draggable: true,
  isolating: true,

  addCommands() {
    return {
      setBlockquote:
        () =>
        ({ commands }) =>
          commands.wrapIn(this.name),
      toggleBlockquote:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
      unsetBlockquote:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    }
  },

  parseHTML() {
    return [{ tag: 'blockquote' }]
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: /^\s*>\s$/,
        type: this.type,
      }),
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['blockquote', mergeAttributes(HTMLAttributes, { style: BLOCKQUOTE_STYLE }), 0]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const wrapper = document.createElement('div')
      wrapper.className = 'je-blockquote-node'

      const dragHandle = document.createElement('button')
      dragHandle.type = 'button'
      dragHandle.className = 'je-block-drag-handle je-blockquote-drag-handle'
      dragHandle.tabIndex = -1
      dragHandle.innerHTML = BLOCK_DRAG_HANDLE_ICON

      const blockquote = document.createElement('blockquote')
      const contentDOM = document.createElement('div')
      blockquote.appendChild(contentDOM)
      wrapper.append(dragHandle, blockquote)

      const selectNode = createNodeSelector(editor, getPos)
      const dragBinding = bindBlockDragHandle({
        editor,
        getPos,
        wrapper,
        handle: dragHandle,
        selectNode,
      })

      const render = (targetNode) => {
        const className = targetNode.attrs.class || ''
        const nodeStyle = targetNode.attrs.style || ''
        blockquote.className = className
        if (targetNode.attrs.id) {
          blockquote.id = targetNode.attrs.id
        } else {
          blockquote.removeAttribute('id')
        }

        blockquote.style.cssText = BLOCKQUOTE_STYLE
        if (nodeStyle) {
          blockquote.style.cssText += `;${nodeStyle}`
        }
      }

      render(node)

      return {
        dom: wrapper,
        contentDOM,
        update(updatedNode) {
          if (updatedNode.type.name !== 'blockquote') return false
          render(updatedNode)
          return true
        },
        selectNode() {
          wrapper.classList.add('ProseMirror-selectednode', 'is-selected')
        },
        deselectNode() {
          wrapper.classList.remove('ProseMirror-selectednode', 'is-selected', 'is-dragging')
        },
        stopEvent(event) {
          return dragBinding.stopEvent(event)
        },
        ignoreMutation(mutation) {
          const target = mutation.target
          if (wrapper.contains(target) && !blockquote.contains(target)) {
            return true
          }

          return false
        },
        destroy() {
          dragBinding.destroy()
        },
      }
    }
  },
})
