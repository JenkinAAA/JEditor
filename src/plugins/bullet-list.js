import { ICONS } from './shared/icon-set.js'

export default {
  name: 'bulletList',
  toolbar: {
    icon: ICONS.bulletList,
    title: '无序列表',
  },
  tiptapExtension: null,
  command: (editor) => editor.chain().focus().toggleBulletList().run(),
  isActive: (editor) => editor.isActive('bulletList'),
}
