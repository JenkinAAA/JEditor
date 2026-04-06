import { Mark, mergeAttributes } from '@tiptap/core'

export const FontFamily = Mark.create({
  name: 'fontFamily',

  addAttributes() {
    return {
      fontFamily: {
        default: null,
        parseHTML: (element) => element.style.fontFamily || null,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[style*="font-family"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const fontFamily = HTMLAttributes.fontFamily

    if (!fontFamily) {
      return ['span', {}, 0]
    }

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        style: `font-family:${fontFamily}`,
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setFontFamily:
        (fontFamily) =>
        ({ commands }) => {
          return commands.setMark(this.name, { fontFamily })
        },
      unsetFontFamily:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})
