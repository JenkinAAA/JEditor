import { createListPopover } from './shared/popover-factory.js'

const LINE_HEIGHT_OPTIONS = ['1.0', '1.15', '1.3', '1.5', '2.0', '3.0'].map((value) => ({
    label: value,
    value,
}))

function getCurrentLineHeight(editor) {
    return editor.getAttributes('paragraph').lineHeight || '1.5'
}

export default {
    name: 'lineHeight',
    toolbar: {
        text: '1.5',
        title: '行间距',
        dropdown: true,
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().setLineHeight('1.5').run(),
    isActive: (editor) => Boolean(editor.getAttributes('paragraph').lineHeight),
    getToolbarState: (editor) => ({ label: getCurrentLineHeight(editor) }),
    renderPopover(editor, context) {
        return createListPopover(LINE_HEIGHT_OPTIONS, (item) => {
            editor.chain().focus().setLineHeight(item.value).run()
            context.closePopover()
        })
    },
}
