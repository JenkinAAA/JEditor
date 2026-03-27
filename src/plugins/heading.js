import { HEADING_OPTIONS } from './shared/style-presets.js'
import { createListPopover } from './shared/popover-factory.js'

function getHeadingLabel(editor) {
    const headingAttrs = editor.getAttributes('heading')

    if (editor.isActive('heading') && headingAttrs.level) {
        return `H${headingAttrs.level}`
    }

    return '正文'
}

export default {
    name: 'heading',
    toolbar: {
        text: '正文',
        title: '段落样式',
        dropdown: true,
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().setParagraph().run(),
    isActive: (editor) => editor.isActive('heading') || editor.isActive('paragraph'),
    getToolbarState: (editor) => ({
        label: getHeadingLabel(editor),
    }),
    renderPopover(editor, context) {
        return createListPopover(
            HEADING_OPTIONS.map((item) => ({
                ...item,
                style: item.level ? { fontWeight: '700' } : null,
            })),
            (item) => {
                const chain = editor.chain().focus()

                if (item.value === 'paragraph') {
                    chain.setParagraph().run()
                } else {
                    chain.toggleHeading({ level: item.level }).run()
                }

                context.closePopover()
            },
        )
    },
}
