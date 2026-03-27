import { Mark, mergeAttributes } from '@tiptap/core'

export const HighlightColor = Mark.create({
    name: 'highlightColor',
    excludes: '',
    addAttributes() {
        return {
            backgroundColor: {
                default: null,
                parseHTML: (element) => element.style.backgroundColor || element.getAttribute('data-background-color') || null,
            },
        }
    },
    parseHTML() {
        return [
            {
                tag: 'span',
                getAttrs: (element) => element.style.backgroundColor ? { backgroundColor: element.style.backgroundColor } : false,
            },
            {
                tag: 'mark',
                getAttrs: (element) => ({ backgroundColor: element.getAttribute('data-background-color') || element.style.backgroundColor })
            },
        ]
    },
    renderHTML({ HTMLAttributes }) {
        const color = HTMLAttributes.backgroundColor
        if (!color) return ['span', {}, 0]

        return ['span', mergeAttributes(HTMLAttributes, {
            'data-background-color': color,
            style: `background-color: ${color}`,
        }), 0]
    },
    addCommands() {
        return {
            setHighlightColor: (color) => ({ commands }) => {
                return commands.setMark(this.name, { backgroundColor: color })
            },
            unsetHighlightColor: () => ({ commands }) => {
                return commands.unsetMark(this.name)
            },
        }
    },
})
