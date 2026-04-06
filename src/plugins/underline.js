import Underline from '@tiptap/extension-underline'
import { ICONS } from './shared/icon-set.js'

export default {
  name: 'underline',
  toolbar: {
    icon: ICONS.underline,
    title: '下划线',
    shortcut: 'Ctrl+U',
  },
  tiptapExtension: Underline,
  command: (editor) => editor.chain().focus().toggleUnderline().run(),
  isActive: (editor) => editor.isActive('underline'),
}
