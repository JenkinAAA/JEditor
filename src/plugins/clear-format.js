import { ICONS } from './shared/icon-set.js'

export default {
    name: 'clearFormat',
    toolbar: {
        icon: ICONS.clearFormat,
        title: '清除格式',
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().unsetAllMarks().run(),
    isActive: () => false,
}
