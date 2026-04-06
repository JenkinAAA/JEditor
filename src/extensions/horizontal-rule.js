import { Node, mergeAttributes } from '@tiptap/core'
import {
  bindBlockDragHandle,
  BLOCK_DRAG_HANDLE_ICON,
  createNodeSelector,
} from './shared/block-drag-handle.js'

const HR_STYLE = [
  'display:block',
  'height:1px',
  'margin:1.1em 0',
  'background:#e5e7eb',
  'border-top-width:initial',
  'border-right-width:initial',
  'border-bottom-width:initial',
  'border-left-width:initial',
  'border-top-style:none',
  'border-right-style:none',
  'border-bottom-style:none',
  'border-left-style:none',
  'border-top-color:initial',
  'border-right-color:initial',
  'border-bottom-color:initial',
  'border-left-color:initial',
  'border-image-source:initial',
  'border-image-slice:initial',
  'border-image-width:initial',
  'border-image-outset:initial',
  'border-image-repeat:initial',
  'box-sizing:border-box',
].join(';')

export const CustomHorizontalRule = Node.create({
  name: 'horizontalRule',
  group: 'block',
  draggable: true,
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: 'hr' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(HTMLAttributes, { style: HR_STYLE })]
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state } = this.editor
        const { $from, empty } = state.selection
        if (!empty || $from.parent.type.name !== 'paragraph') return false
        const text = $from.parent.textContent.trim()
        if (text !== '---') return false

        const from = $from.start()
        const to = from + $from.parent.content.size
        return this.editor.chain().deleteRange({ from, to }).setHorizontalRule().run()
      },
    }
  },

  addCommands() {
    return {
      setHorizontalRule:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name }),
    }
  },

  addNodeView() {
    return ({ _node, editor, getPos }) => {
      const wrapper = document.createElement('div')
      wrapper.className = 'je-divider-node'

      const dragHandle = document.createElement('button')
      dragHandle.type = 'button'
      dragHandle.className = 'je-block-drag-handle je-divider-drag-handle'
      dragHandle.tabIndex = -1
      dragHandle.innerHTML = BLOCK_DRAG_HANDLE_ICON

      const hr = document.createElement('hr')
      hr.style.cssText = HR_STYLE

      wrapper.append(dragHandle, hr)

      const selectNode = createNodeSelector(editor, getPos)
      const dragBinding = bindBlockDragHandle({
        editor,
        getPos,
        wrapper,
        handle: dragHandle,
        selectNode,
      })

      return {
        dom: wrapper,
        update(updatedNode) {
          return updatedNode.type.name === 'horizontalRule'
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
        ignoreMutation() {
          return true
        },
        destroy() {
          dragBinding.destroy()
        },
      }
    }
  },
})
