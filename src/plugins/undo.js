import { ICONS } from './shared/icon-set.js'

export default {
    name: 'undo',
    toolbar: {
        icon: ICONS.undo,
        title: '撤销',
        shortcut: 'Ctrl+Z',
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().undo().run(),
    isActive: () => false,
    isDisabled: (editor) => !editor.can().undo(),
}
