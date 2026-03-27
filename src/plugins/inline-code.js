import { InlineCode } from '../extensions/inline-code.js'
import { ICONS } from './shared/icon-set.js'

export default {
    name: 'inlineCode',
    toolbar: {
        icon: ICONS.inlineCode,
        title: 'Inline Code',
    },
    tiptapExtension: InlineCode,
    command: (editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive('code'),
}
