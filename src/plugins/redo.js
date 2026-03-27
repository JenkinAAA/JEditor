import { ICONS } from './shared/icon-set.js'

export default {
    name: 'redo',
    toolbar: {
        icon: ICONS.redo,
        title: '重做',
        shortcut: 'Ctrl+Shift+Z',
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().redo().run(),
    isActive: () => false,
    isDisabled: (editor) => !editor.can().redo(),
}
