import { CustomHorizontalRule } from '../extensions/horizontal-rule.js'
import { ICONS } from './shared/icon-set.js'

export default {
  name: 'horizontalRule',
  toolbar: {
    icon: ICONS.divider,
    title: '分隔符',
  },
  tiptapExtension: CustomHorizontalRule,
  command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  isActive: () => false,
}
