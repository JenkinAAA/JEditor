import { ICONS } from './shared/icon-set.js'
import BlockquoteExtension from '../extensions/blockquote.js'

export default {
  name: 'blockquote',
  toolbar: {
    icon: ICONS.quote,
    title: '引用',
  },
  tiptapExtension: BlockquoteExtension,
  command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  isActive: (editor) => editor.isActive('blockquote'),
}
