import { ICONS } from './shared/icon-set.js'

export default {
    name: 'italic',
    toolbar: {
        icon: ICONS.italic,
        title: '斜体',
        shortcut: 'Ctrl+I',
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive('italic'),
}
