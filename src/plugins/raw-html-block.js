import { ICONS } from './shared/icon-set.js'

export default {
  name: 'rawHtmlBlock',
  toolbar: {
    icon: ICONS.htmlBlock,
    text: 'HTML',
    title: 'HTML Block',
  },
  tiptapExtension: null,
  command: (editor) => {
    editor.chain().focus().insertRawHtmlIsland('<div>\n  Raw HTML\n</div>').run()
  },
  isActive: (editor) => editor.isActive('rawHtmlIsland'),
}
