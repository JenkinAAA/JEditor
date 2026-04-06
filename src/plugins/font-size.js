import { FontSize } from '../extensions/font-size.js'
import { FONT_SIZE_OPTIONS } from './shared/style-presets.js'
import { createListPopover } from './shared/popover-factory.js'

function findCurrent(editor) {
  const current = editor.getAttributes('fontSize').size || null
  return FONT_SIZE_OPTIONS.find((opt) => opt.value === current) || { label: '字号', value: null }
}

export default {
  name: 'fontSize',
  toolbar: {
    text: '字号',
    title: '字号',
    dropdown: true,
  },
  tiptapExtension: FontSize,
  command: (editor) => editor.chain().focus().unsetFontSize().run(),
  isActive: (editor) => !!editor.getAttributes('fontSize').size,
  getToolbarState: (editor) => ({
    label: findCurrent(editor).label,
  }),
  renderPopover(editor, context) {
    return createListPopover(
      FONT_SIZE_OPTIONS,
      (item) => {
        const chain = editor.chain().focus()
        if (item.value) {
          chain.setFontSize(item.value).run()
        } else {
          chain.unsetFontSize().run()
        }
        context.closePopover()
      },
      { className: 'je-popover-list--scroll je-popover--font-size' },
    )
  },
}
