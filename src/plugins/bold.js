// src/plugins/bold.js
export default {
    name: 'bold',
    toolbar: {
        text: 'B',
        title: '粗体',
        shortcut: 'Ctrl+B',
        className: 'font-bold',
    },
    tiptapExtension: null, // StarterKit 内置
    command: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive('bold'),
}
