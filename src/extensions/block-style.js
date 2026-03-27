import { Extension } from '@tiptap/core'

const TARGET_TYPES = new Set(['paragraph', 'heading', 'blockquote'])

function updateBlocks(tr, doc, from, to, updater) {
    const seen = new Set()
    doc.nodesBetween(from, to, (node, pos) => {
        if (!TARGET_TYPES.has(node.type.name) || seen.has(pos)) return
        seen.add(pos)
        tr.setNodeMarkup(pos, undefined, updater(node))
    })
    return tr
}

export const BlockStyle = Extension.create({
    name: 'blockStyle',

    addGlobalAttributes() {
        return [
            {
                types: ['paragraph', 'heading', 'blockquote'],
                attributes: {
                    textAlign: {
                        default: null,
                        parseHTML: (element) => element.style.textAlign || null,
                        renderHTML: (attributes) => attributes.textAlign ? { style: `text-align:${attributes.textAlign}` } : {},
                    },
                    lineHeight: {
                        default: null,
                        parseHTML: (element) => element.style.lineHeight || null,
                        renderHTML: (attributes) => attributes.lineHeight ? { style: `line-height:${attributes.lineHeight}` } : {},
                    },
                },
            },
        ]
    },

    addCommands() {
        return {
            setTextAlign: (textAlign) => ({ state, dispatch }) => {
                const { from, to } = state.selection
                const tr = updateBlocks(state.tr, state.doc, from, to, (node) => ({
                    ...node.attrs,
                    textAlign,
                }))
                if (dispatch) dispatch(tr)
                return true
            },
            unsetTextAlign: () => ({ state, dispatch }) => {
                const { from, to } = state.selection
                const tr = updateBlocks(state.tr, state.doc, from, to, (node) => ({
                    ...node.attrs,
                    textAlign: null,
                }))
                if (dispatch) dispatch(tr)
                return true
            },
            setLineHeight: (lineHeight) => ({ state, dispatch }) => {
                const { from, to } = state.selection
                const tr = updateBlocks(state.tr, state.doc, from, to, (node) => ({
                    ...node.attrs,
                    lineHeight,
                }))
                if (dispatch) dispatch(tr)
                return true
            },
            unsetLineHeight: () => ({ state, dispatch }) => {
                const { from, to } = state.selection
                const tr = updateBlocks(state.tr, state.doc, from, to, (node) => ({
                    ...node.attrs,
                    lineHeight: null,
                }))
                if (dispatch) dispatch(tr)
                return true
            },
        }
    },
})
