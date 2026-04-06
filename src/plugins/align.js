import { BlockStyle } from '../extensions/block-style.js'
import { createListPopover } from './shared/popover-factory.js'
import { ICONS } from './shared/icon-set.js'

const ALIGN_OPTIONS = [
  { label: '左对齐', value: 'left', icon: ICONS.alignLeft },
  { label: '居中对齐', value: 'center', icon: ICONS.alignCenter },
  { label: '右对齐', value: 'right', icon: ICONS.alignRight },
]

export default {
  name: 'align',
  toolbar: {
    icon: ICONS.align,
    title: '对齐',
    dropdown: true,
  },
  tiptapExtension: BlockStyle,
  command: (editor) => editor.chain().focus().setTextAlign('left').run(),
  isActive: (editor) => Boolean(editor.getAttributes('paragraph').textAlign),
  renderPopover(editor, context) {
    return createListPopover(ALIGN_OPTIONS, (item) => {
      editor.chain().focus().setTextAlign(item.value).run()
      context.closePopover()
    })
  },
}
