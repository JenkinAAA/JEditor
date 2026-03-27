import { ICONS } from './shared/icon-set.js'

export default {
    name: 'bold',
    toolbar: {
        icon: ICONS.bold,
        title: '粗体',
        shortcut: 'Ctrl+B',
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive('bold'),
}
