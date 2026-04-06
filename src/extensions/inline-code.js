import { Mark, mergeAttributes } from '@tiptap/core'

const INLINE_CODE_STYLE = [
  'padding:0.14em 0.42em',
  'border:1px solid #e8edf3',
  'border-radius:6px',
  'background:#f7f9fc',
  'color:#c2410c',
  'font-weight:700',
  'font-family:"JetBrains Mono","SFMono-Regular",Consolas,monospace',
  'font-size:0.92em',
].join(';')

export const InlineCode = Mark.create({
  name: 'code',
  excludes: '_',
  code: true,

  parseHTML() {
    return [{ tag: 'code' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['code', mergeAttributes(HTMLAttributes, { style: INLINE_CODE_STYLE }), 0]
  },

  addCommands() {
    return {
      setCode:
        () =>
        ({ commands }) =>
          commands.setMark(this.name),
      toggleCode:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
      unsetCode:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },
})
