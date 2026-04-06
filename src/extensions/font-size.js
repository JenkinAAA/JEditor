import { Mark, mergeAttributes } from '@tiptap/core'

export const FontSize = Mark.create({
  name: 'fontSize',

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[style*="font-size"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const size = HTMLAttributes.size

    if (!size) {
      return ['span', {}, 0]
    }

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        style: `font-size:${size}`,
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ commands }) =>
          commands.setMark(this.name, { size }),
      unsetFontSize:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },
})
