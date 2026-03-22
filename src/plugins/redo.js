// src/plugins/redo.js

const REDO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" style="transform:scaleX(-1)">
    <path d="M6.25 3.75 2.5 6.25l3.75 2.5V6.875h5.938a4.062 4.062 0 1 1 0 8.125H8.125a.625.625 0 1 0 0 1.25h4.063a5.313 5.313 0 0 0 0-10.625H6.25z"></path>
</svg>`

export default {
    name: 'redo',
    toolbar: {
        icon: REDO_SVG,
        title: '重做',
        shortcut: 'Ctrl+Shift+Z',
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().redo().run(),
    isActive: () => false,
    isDisabled: (editor) => !editor.can().redo(),
}
