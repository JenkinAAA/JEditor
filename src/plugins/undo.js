// src/plugins/undo.js

const UNDO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor">
    <path d="M6.25 3.75 2.5 6.25l3.75 2.5V6.875h5.938a4.062 4.062 0 1 1 0 8.125H8.125a.625.625 0 1 0 0 1.25h4.063a5.313 5.313 0 0 0 0-10.625H6.25z"></path>
</svg>`

export default {
    name: 'undo',
    toolbar: {
        icon: UNDO_SVG,
        title: '撤销',
        shortcut: 'Ctrl+Z',
    },
    tiptapExtension: null, // StarterKit History 内置
    command: (editor) => editor.chain().focus().undo().run(),
    isActive: () => false,
    isDisabled: (editor) => !editor.can().undo(),
}
