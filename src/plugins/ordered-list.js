import { ICONS } from './shared/icon-set.js'

export default {
    name: 'orderedList',
    toolbar: {
        icon: ICONS.orderedList,
        title: '有序列表',
    },
    tiptapExtension: null,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive('orderedList'),
}
