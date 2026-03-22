// src/plugins/underline.js
import Underline from '@tiptap/extension-underline'

export default {
    name: 'underline',
    toolbar: {
        text: 'U',
        title: '下划线',
        shortcut: 'Ctrl+U',
        className: 'underline',
    },
    tiptapExtension: Underline,
    command: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive('underline'),
}
