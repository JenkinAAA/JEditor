import { Node, mergeAttributes } from '@tiptap/core'

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
            setHorizontalRule: () => ({ commands }) => commands.insertContent({ type: this.name }),
        }
    },
})
