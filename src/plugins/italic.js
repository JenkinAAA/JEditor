// src/plugins/italic.js
export default {
    name: 'italic',
    toolbar: {
        text: 'I',
        title: '斜体',
        shortcut: 'Ctrl+I',
        className: 'italic',
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive('italic'),
}
