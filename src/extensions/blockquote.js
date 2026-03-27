import { Node, mergeAttributes, wrappingInputRule } from '@tiptap/core'

const BLOCKQUOTE_STYLE = 'margin:0.8em 0;padding:2px 12px 2px 12px;border-left:3px solid #374151;background:#f3f4f6;color:#111827;'

export default Node.create({
    name: 'blockquote',
    group: 'block',
    content: 'block+',
    defining: true,

    addCommands() {
        return {
            setBlockquote: () => ({ commands }) => commands.wrapIn(this.name),
            toggleBlockquote: () => ({ commands }) => commands.toggleWrap(this.name),
            unsetBlockquote: () => ({ commands }) => commands.lift(this.name),
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
})
