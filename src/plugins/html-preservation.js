import { GenericDiv } from '../extensions/generic-div.js'
import { GlobalStyle } from '../extensions/global-style.js'
import { RawHtmlIsland } from '../extensions/raw-html-island.js'

export default {
  name: 'htmlPreservation',
  toolbar: {},
  tiptapExtension: [
    GenericDiv,
    GlobalStyle,
    RawHtmlIsland.configure({
      onOpenSource: null,
    }),
  ],
  init(editor, config = {}) {
    if (editor.storage.rawHtmlIsland) {
      editor.storage.rawHtmlIsland.onOpenSource = config.onOpenSource || null
    }
  },
}
