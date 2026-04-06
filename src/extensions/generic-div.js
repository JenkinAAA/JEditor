import { Node, mergeAttributes } from '@tiptap/core'

export const GenericDiv = Node.create({
  name: 'genericDiv',
  group: 'block',
  content: 'block*',
  defining: true,

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute('class'),
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
      },
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('id'),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (element) => {
          if (element.hasAttribute('data-callout')) return false
          if (element.hasAttribute('data-jeditor-code-block')) return false
          return null
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0]
  },
})
