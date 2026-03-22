// src/plugins/strike.js
export default {
    name: 'strike',
    toolbar: {
        text: 'S',
        title: '删除线',
        shortcut: 'Ctrl+Shift+X',
        className: 'line-through text-[13px]',
    },
    tiptapExtension: null, // StarterKit 内置
    command: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive('strike'),
}
