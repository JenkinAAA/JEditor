import { CodeBlockExtension } from '../extensions/code-block.js'
import { ICONS } from './shared/icon-set.js'

export default {
    name: 'codeBlock',
    toolbar: {
        icon: ICONS.codeBlock,
        title: 'Code Block',
    },
    tiptapExtension: CodeBlockExtension,
    command: (editor) => editor.chain().focus().toggleCodeBlock({ language: 'plaintext' }).run(),
    isActive: (editor) => editor.isActive('codeBlock'),
}
