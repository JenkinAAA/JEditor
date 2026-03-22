// src/plugins/clear-format.js
export default {
    name: 'clearFormat',
    toolbar: {
        icon: 'slash',       // feather icon name
        title: '清除格式',
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().unsetAllMarks().run(),
    isActive: () => false,
}
