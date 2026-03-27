import { ICONS } from './shared/icon-set.js'

export default {
    name: 'strike',
    toolbar: {
        icon: ICONS.strike,
        title: '删除线',
        shortcut: 'Ctrl+Shift+X',
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive('strike'),
}
